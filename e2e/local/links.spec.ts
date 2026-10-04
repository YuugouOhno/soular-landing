import { test, expect } from "./fixtures";

// リンクチェッカー。
// - 内部リンク（同一オリジン）: 200 であること。**失敗したらテストを落とす。**
// - 外部リンク: HEAD（405/403 なら GET）を best-effort で叩き、問題は annotation に
//   出すだけでテストは落とさない（外部サイトの一時障害で CI を赤くしないため）。

const PAGES = ["/", "/precontract", "/precontract/dental/legal/terms"];

test("内部リンクはすべて 200、外部リンクは best-effort で確認", async ({ page, request }, testInfo) => {
  test.setTimeout(120_000);
  const origin = new URL(testInfo.project.use.baseURL!).origin;
  const internal = new Set<string>();
  const external = new Set<string>();

  for (const path of PAGES) {
    await page.goto(path);
    const hrefs = await page.$$eval("a[href], link[rel=icon][href], img[src]", (els) =>
      els.map((el) => (el as HTMLAnchorElement).href || (el as HTMLImageElement).src),
    );
    for (const href of hrefs) {
      if (!href || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) continue;
      const url = new URL(href);
      url.hash = "";
      if (url.origin === origin) internal.add(url.pathname + url.search);
      else if (url.protocol.startsWith("http")) external.add(url.toString());
    }
  }

  expect(internal.size).toBeGreaterThan(0);
  const brokenInternal: string[] = [];
  for (const path of internal) {
    const res = await request.get(path, { maxRedirects: 5 });
    if (res.status() !== 200) brokenInternal.push(`${res.status()} ${path}`);
  }
  expect(brokenInternal, "壊れた内部リンク").toEqual([]);

  const brokenExternal: string[] = [];
  await Promise.all(
    [...external].map(async (url) => {
      try {
        let res = await request.head(url, { timeout: 10_000, maxRedirects: 5 });
        if ([403, 405].includes(res.status())) res = await request.get(url, { timeout: 10_000, maxRedirects: 5 });
        if (res.status() >= 400) brokenExternal.push(`${res.status()} ${url}`);
      } catch (e) {
        brokenExternal.push(`ERR ${url}: ${(e as Error).message.split("\n")[0]}`);
      }
    }),
  );
  for (const b of brokenExternal) {
    testInfo.annotations.push({ type: "warning", description: `外部リンク不達（非ブロッキング）: ${b}` });
    console.warn(`[links] external (non-blocking): ${b}`);
  }
});
