import { createHash } from "node:crypto";
import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";

// 事前確認フロー: 合言葉 → 条件確定 → 申込フォーム → 中継（HMAC 署名）→ OTP 入力。
// 中継先は e2e/support/mock-service.mjs（PRECONTRACT_*_URL をモックへ向けて起動している）。
// モックは署名を検証し、合わなければ 401 を返すので、署名が壊れるとこのテストが落ちる。

const MOCK_URL = `http://127.0.0.1:${process.env.MOCK_SERVICE_PORT ?? 4010}`;

type Received = {
  path: string;
  signatureValid: boolean;
  body: Record<string, any> | null;
  createdId?: string;
};

async function received(): Promise<Received[]> {
  const res = await fetch(`${MOCK_URL}/__received`);
  return (await res.json()) as Received[];
}

async function startConditions(page: Page, service: string, password: string) {
  await page.goto("/precontract");
  await page.locator('select[name="service"]').selectOption(service);
  await page.locator('input[name="initialFeeYen"]').fill("0");
  await page.locator('input[name="monthlyFeeYen"]').fill("39800");
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "この内容で申込フォームへ進む" }).click();
}

test("モック受信側は署名の無い・誤ったリクエストを 401 で拒否する（モック自体の健全性）", async () => {
  const body = JSON.stringify({ service: "dental" });
  const unsigned = await fetch(`${MOCK_URL}/api/consents`, { method: "POST", body });
  expect(unsigned.status).toBe(401);
  const ts = Math.floor(Date.now() / 1000).toString();
  const forged = await fetch(`${MOCK_URL}/api/consents`, {
    method: "POST",
    body,
    headers: { "X-Soular-Timestamp": ts, "X-Soular-Signature": `sha256=${"0".repeat(64)}` },
  });
  expect(forged.status).toBe(401);
});

test("ゲート未通過で申込フォームを開くとスタート画面へ戻される", async ({ page }) => {
  await page.goto("/precontract/dental/apply");
  await expect(page).toHaveURL(/\/precontract$/);
});

test("合言葉が違うと先へ進めない", async ({ page }) => {
  await startConditions(page, "dental", "wrong-passphrase");
  await expect(page.getByText("合言葉が違います")).toBeVisible();
  await expect(page).toHaveURL(/\/precontract$/);
});

test("金額が不正だとエラー", async ({ page }) => {
  await page.goto("/precontract");
  await page.locator('input[name="initialFeeYen"]').fill("１００"); // 全角は拒否
  await page.locator('input[name="monthlyFeeYen"]').fill("39800");
  await page.locator('input[name="password"]').fill("soular");
  // pattern 属性のブラウザ検証を外して、サーバー側の検証まで届かせる。
  await page.locator("form").evaluate((f) => ((f as HTMLFormElement).noValidate = true));
  await page.getByRole("button", { name: "この内容で申込フォームへ進む" }).click();
  await expect(page.getByText("初期費用を半角数字で入力してください")).toBeVisible();
});

for (const service of ["dental", "aichat"] as const) {
  test(`${service}: 合言葉 → 申込 → 署名付き中継 → OTP 入力まで`, async ({ page, context }) => {
    test.setTimeout(60_000);
    const email = `e2e-${service}-${Date.now()}@example.com`;

    // 1. スタート画面（合言葉 "soular"）
    await startConditions(page, service, "soular");
    await expect(page).toHaveURL(new RegExp(`/precontract/${service}/apply$`));
    await expect(page.getByText(/ご契約プラン：/)).toBeVisible();

    // 2. 申込者情報
    await page.locator('input[name="clinicName"]').fill("E2E テスト医院");
    await page.locator('select[name="servicePlan"]').selectOption("スタンダードプラン");
    await page.locator('input[name="applicantName"]').fill("テスト 太郎");
    await page.locator('input[name="applicantKana"]').fill("テスト タロウ");
    await page.locator('input[name="phone"]').fill("03-0000-0000");
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="emailConfirm"]').fill(email);
    await page.locator('input[name="salesRep"]').fill("営業 花子");
    await page.locator('input[name="scheduledContractDate"]').fill("2026-12-01");

    // 3. 書面を開くまで同意チェックは無効
    const checkboxes = page.locator('input[type="checkbox"]');
    await expect(page.locator('input[name="agreedImportant"]')).toBeDisabled();
    for (const label of ["重要事項説明書", "利用規約", "プライバシーポリシー"]) {
      const [popup] = await Promise.all([
        context.waitForEvent("page"),
        page.getByRole("link", { name: new RegExp(`${label} を開く`) }).click(),
      ]);
      await popup.waitForLoadState();
      expect(popup.url()).toContain(`/precontract/${service}/legal/`);
      await expect(popup.locator("article h1")).not.toBeEmpty();
      await popup.close();
    }
    const submit = page.getByRole("button", { name: "同意して本人確認に進む" });
    await expect(submit).toBeDisabled();
    const n = await checkboxes.count();
    for (let i = 0; i < n; i++) await checkboxes.nth(i).check();
    await expect(submit).toBeEnabled();
    await submit.click();

    // 4. 本人確認画面（モックが返したマスク済みメールが出る）
    await expect(page).toHaveURL(new RegExp(`/precontract/${service}/apply/verify$`));
    await expect(page.getByRole("heading", { name: "確認コードの入力" })).toBeVisible();
    await expect(page.getByText(`${email.slice(0, 2)}***@example.com`)).toBeVisible();

    // 中継リクエストの検証: 署名が正しく、条件は cookie 由来、重説ハッシュが本文と一致。
    // 並列実行の他テストと混ざらないよう、申込メールで自分の分を特定する。
    const create = (await received()).find((r) => r.path === "/api/consents" && r.body?.applicant?.email === email);
    expect(create, "モックが作成リクエストを受け取っていない").toBeTruthy();
    expect(create!.signatureValid).toBe(true);
    const body = create!.body!;
    expect(body.service).toBe(service);
    expect(body.fees).toMatchObject({ initialFeeYen: 0, monthlyFeeYen: 39800 });
    expect(body.consent).toMatchObject({
      agreedTerms: true,
      agreedPrivacy: true,
      agreedImportant: true,
      selfInputConfirmed: true,
    });
    const hash = createHash("sha256").update(body.documents.importantText, "utf8").digest("hex");
    expect(body.documents.importantHash).toBe(hash);

    // 5. OTP: 誤ったコード → エラー、正しいコード（モックの 123456）→ 完了
    await page.locator('input[name="code"]').fill("000000");
    await page.getByRole("button", { name: "確認する" }).click();
    await expect(page.getByText("コードが正しくありません")).toBeVisible();
    await page.locator('input[name="code"]').fill("123456");
    await page.getByRole("button", { name: "確認する" }).click();
    await expect(page.getByText("本人確認が完了しました ✓")).toBeVisible();

    // 以降の status / verify も同じ submissionId・正しい署名で届いていること。
    const sid = create!.createdId;
    const followUps = (await received()).filter((r) => r.body?.submissionId === sid);
    expect(followUps.map((r) => r.path)).toEqual(
      expect.arrayContaining(["/api/consents/status", "/api/consents/verify"]),
    );
    expect(followUps.every((r) => r.signatureValid)).toBe(true);
  });
}
