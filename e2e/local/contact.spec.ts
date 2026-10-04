import { test, expect } from "./fixtures";

// 問い合わせフォーム。**本物のメールは送らない**:
//   - サーバー（next start）は RESEND_API_KEY 空で起動している
//   - サーバーへは不正な入力か honeypot 入りしか送らない（どちらも Resend 呼び出しの手前で返る）
//   - 成功/失敗の表示確認はブラウザ側で /api/contact をモックして行う

// レート制限（IP 毎 10分5回）に他テストが巻き込まれないよう、テストごとに別 IP を名乗る。
const uniqueIp = (tag: string) => ({ "x-forwarded-for": `203.0.113.${tag}` });

test.describe("クライアント側の検証", () => {
  test("必須項目が空だと送信されない", async ({ page }) => {
    let posted = false;
    await page.route("**/api/contact", (route) => {
      posted = true;
      return route.fulfill({ status: 200, json: { ok: true } });
    });
    await page.goto("/#start");
    await page.locator(".cf-submit").click();
    await expect(page.locator("#cf-name")).toHaveJSProperty("validity.valueMissing", true);
    expect(posted).toBe(false);
  });

  test("メール形式が不正だと送信されない", async ({ page }) => {
    let posted = false;
    await page.route("**/api/contact", (route) => {
      posted = true;
      return route.fulfill({ status: 200, json: { ok: true } });
    });
    await page.goto("/#start");
    await page.fill("#cf-name", "テスト 太郎");
    await page.fill("#cf-email", "not-an-email");
    await page.fill("#cf-message", "E2E");
    await page.locator(".cf-submit").click();
    await expect(page.locator("#cf-email")).toHaveJSProperty("validity.typeMismatch", true);
    expect(posted).toBe(false);
  });

  test("送信ペイロードと成功表示（API はモック）", async ({ page }) => {
    let payload: Record<string, unknown> | null = null;
    await page.route("**/api/contact", (route) => {
      payload = route.request().postDataJSON();
      return route.fulfill({ status: 200, json: { ok: true } });
    });
    await page.goto("/#start");
    await page.fill("#cf-company", "株式会社テスト");
    await page.fill("#cf-name", "テスト 太郎");
    await page.fill("#cf-email", "e2e@example.com");
    await page.fill("#cf-message", "E2E からの送信です");
    await page.locator(".cf-submit").click();
    await expect(page.getByText("お問い合わせを受け付けました")).toBeVisible();
    expect(payload).toMatchObject({
      company: "株式会社テスト",
      name: "テスト 太郎",
      email: "e2e@example.com",
      message: "E2E からの送信です",
      _hp: "",
    });
  });

  test("API エラー時はエラー表示（API はモック）", async ({ page }) => {
    await page.route("**/api/contact", (route) => route.fulfill({ status: 500, json: { error: "send failed" } }));
    await page.goto("/#start");
    await page.fill("#cf-name", "テスト 太郎");
    await page.fill("#cf-email", "e2e@example.com");
    await page.fill("#cf-message", "E2E");
    await page.locator(".cf-submit").click();
    await expect(page.locator(".cf-note.err")).toBeVisible();
  });
});

test.describe("サーバー側の検証（/api/contact）", () => {
  test("GET は 405", async ({ request }) => {
    expect((await request.get("/api/contact")).status()).toBe(405);
  });

  const invalid: [string, unknown][] = [
    ["空オブジェクト", {}],
    ["配列", []],
    ["name 欠落", { email: "a@example.com", message: "x" }],
    ["email 形式不正", { name: "a", email: "bad", message: "x" }],
    ["message 長すぎ", { name: "a", email: "a@example.com", message: "x".repeat(5001) }],
    ["name 長すぎ", { name: "a".repeat(101), email: "a@example.com", message: "x" }],
    ["非文字列", { name: 1, email: ["a@example.com"], message: { x: 1 } }],
  ];
  invalid.forEach(([label, body], i) => {
    test(`不正入力は 400: ${label}`, async ({ request }) => {
      const res = await request.post("/api/contact", { data: body, headers: uniqueIp(String(10 + i)) });
      expect(res.status()).toBe(400);
      expect(await res.json()).toHaveProperty("error");
    });
  });

  test("JSON でないボディは 400", async ({ request }) => {
    const res = await request.post("/api/contact", {
      data: "not json",
      headers: { "content-type": "application/json", ...uniqueIp("30") },
    });
    expect(res.status()).toBe(400);
  });

  test("honeypot が埋まっていれば黙って成功扱い（送信はしない）", async ({ request }) => {
    const res = await request.post("/api/contact", {
      data: { name: "bot", email: "bot@example.com", message: "spam", _hp: "filled" },
      headers: uniqueIp("31"),
    });
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  test("同一 IP から 6 回目で 429", async ({ request }) => {
    const headers = uniqueIp("32");
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) {
      statuses.push((await request.post("/api/contact", { data: {}, headers })).status());
    }
    expect(statuses.slice(0, 5)).toEqual([400, 400, 400, 400, 400]);
    expect(statuses[5]).toBe(429);
  });
});
