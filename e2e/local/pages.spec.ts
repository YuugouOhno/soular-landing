import { test, expect } from "./fixtures";

// 主要ページが描画でき、console エラー・未捕捉例外が出ないこと。

const LEGAL_PAGES = (["dental", "medical", "aichat"] as const).flatMap((service) =>
  (["terms", "privacy", "important"] as const).map((doc) => `/precontract/${service}/legal/${doc}`),
);

test("トップページが描画され、主要セクションが揃っている", async ({ page, consoleProblems }) => {
  const res = await page.goto("/");
  expect(res?.status()).toBe(200);
  await expect(page).toHaveTitle("株式会社soular");
  await expect(page.locator("header.hero h1")).toBeVisible();
  for (const id of ["philosophy", "story", "domains", "topics", "company", "start"]) {
    await expect(page.locator(`#${id}`), `#${id} セクション`).toHaveCount(1);
  }
  await expect(page.locator("form.cf")).toBeVisible();
  await page.waitForLoadState("networkidle");
  expect(consoleProblems).toEqual([]);
});

test("OG 画像・ファビコン・ロゴが配信されている", async ({ page, request }) => {
  await page.goto("/");
  const og = await page.locator('meta[property="og:image"]').getAttribute("content");
  expect(og).toBeTruthy();
  // 本番の絶対 URL をローカルのパスに読み替えて実在を確認する。
  const ogPath = new URL(og!).pathname;
  const ogRes = await request.get(ogPath);
  expect(ogRes.status(), `${ogPath} が配信されていない`).toBe(200);
  expect(ogRes.headers()["content-type"]).toContain("image/png");

  for (const path of ["/logo.png", "/favicon.svg"]) {
    expect((await request.get(path)).status(), path).toBe(200);
  }
});

test("事前確認スタート画面が描画される", async ({ page, consoleProblems }) => {
  const res = await page.goto("/precontract");
  expect(res?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "お申し込み内容の確認" })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await page.waitForLoadState("networkidle");
  expect(consoleProblems).toEqual([]);
});

for (const path of LEGAL_PAGES) {
  test(`法務文書 ${path} が描画される`, async ({ page, consoleProblems }) => {
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.locator("article h1")).not.toBeEmpty();
    await expect(page.getByText(/版: \d{4}-\d{2}-\d{2}/)).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    expect(consoleProblems).toEqual([]);
  });
}

test("未知のサービス・文書は 404", async ({ request }) => {
  expect((await request.get("/precontract/unknown/legal/terms")).status()).toBe(404);
  expect((await request.get("/precontract/dental/legal/unknown")).status()).toBe(404);
  expect((await request.get("/precontract/unknown/apply")).status()).toBe(404);
});

test("robots.txt と sitemap.xml", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  const robotsText = await robots.text();
  expect(robotsText).toMatch(/User-agent: \*/);
  expect(robotsText).toContain("Sitemap: https://soular-inc.com/sitemap.xml");

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  expect(sitemap.headers()["content-type"]).toMatch(/xml/);
  expect(await sitemap.text()).toContain("<loc>https://soular-inc.com/</loc>");
});
