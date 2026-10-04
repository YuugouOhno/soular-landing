import { test, expect } from "@playwright/test";

// 本番（既定 https://soular-inc.com）の synthetic チェック。**読み取り専用**。
//
// ⚠️ 禁止事項（このファイルを触る人へ）:
//   - /api/contact に「有効な」問い合わせを送らない（本物のメールが s-hamada@ に届く）。
//     送ってよいのは必ず 400 になる不正ボディだけ。
//   - /precontract の合言葉送信・申込送信をしない（本番の HRMS / aichat に同意データが作られる）。
//   - POST は 1 回の実行で最小限に（本番のレート制限 IP 毎 10分5回 を食い潰さない）。

const LEGAL = (["dental", "medical", "aichat"] as const).flatMap((service) =>
  (["terms", "privacy", "important"] as const).map((doc) => `/precontract/${service}/legal/${doc}`),
);

test("トップページ: 200・タイトル・主要セクション・まごころAI ウィジェット読込", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  // ウィジェット本体の取得が実際に成功したかを見る（script 要素の有無だけでは偽陽性になる）。
  const widget = page.waitForResponse((r) => r.url().startsWith("https://magokoro-ai.com/magokoro-ai.js"), {
    timeout: 20_000,
  });
  // load は外部ウィジェット・フォント待ちで揺れるので DOM 構築完了で判定する。
  const res = await page.goto("/", { waitUntil: "domcontentloaded" });
  expect(res?.status()).toBe(200);
  await expect(page).toHaveTitle("株式会社soular");
  await expect(page.locator("header.hero h1")).toBeVisible();
  await expect(page.locator("#company")).toContainText("soular");
  await expect(page.locator("form.cf")).toBeVisible();
  const widgetRes = await widget;
  expect(widgetRes.status(), "まごころAI ウィジェットの取得").toBe(200);
  // 初期化時の例外も拾えるよう、ネットワークが落ち着くまで待ってから判定する。
  await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});
  expect(errors, "未捕捉の例外").toEqual([]);
});

test("OG / canonical メタと OG 画像の実在", async ({ page, request }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  // Next.js は末尾スラッシュを落として出力する。
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /^https:\/\/soular-inc\.com\/?$/);
  const og = await page.locator('meta[property="og:image"]').getAttribute("content");
  expect(og).toBeTruthy();
  const ogRes = await request.get(og!);
  expect(ogRes.status(), `${og} が 404（og-image.png 未配置）`).toBe(200);
  expect(ogRes.headers()["content-type"]).toContain("image/");
});

test("静的アセット: robots.txt / sitemap.xml / logo / favicon", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain("Sitemap: https://soular-inc.com/sitemap.xml");

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain("<loc>https://soular-inc.com/</loc>");

  for (const p of ["/logo.png", "/favicon.svg"]) {
    const r = await request.get(p);
    expect(r.status(), p).toBe(200);
    expect(r.headers()["content-type"], p).toMatch(/^image\//);
  }
});

test("事前確認スタート画面が表示され、noindex である（送信はしない）", async ({ page }) => {
  const res = await page.goto("/precontract");
  expect(res?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "お申し込み内容の確認" })).toBeVisible();
  await expect(page.locator('input[name="password"]')).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});

for (const path of LEGAL) {
  test(`法務文書 ${path}`, async ({ request }) => {
    const res = await request.get(path);
    expect(res.status()).toBe(200);
    const html = await res.text();
    expect(html).toMatch(/<h1[^>]*>[^<]+/);
    expect(html).toMatch(/版: (<!-- -->)?\d{4}-\d{2}-\d{2}/);
  });
}

test("/api/contact: GET は 405、不正な POST は 400（メールは送られない）", async ({ request }) => {
  expect((await request.get("/api/contact")).status()).toBe(405);
  // 必須項目が欠けたボディ。Resend 呼び出しより前に 400 で返る。
  const res = await request.post("/api/contact", { data: {} });
  expect(res.status()).toBe(400);
  expect(await res.json()).toEqual({ error: "missing required fields" });
});
