import { devices } from "@playwright/test";
import { test, expect } from "./fixtures";

// トップページのビジュアル回帰（ファーストビューのみ）。
// 「見た目は移行前と 1px も変えない」方針（README）を機械的に守るための網。
//
// - 基準画像は CI（ubuntu-latest）で生成したものだけを持つ。
//   フォントのレンダリングが OS で違うため、Linux 以外では skip する。
//   更新: gh workflow run verify.yml --ref <branch> -f update_snapshots=true
//         → artifact "visual-snapshots" を e2e/local/visual.spec.ts-snapshots/ に置いてコミット
// - reducedMotion: reduce でキーワード切替・カウントアップ等の演出を止める。
// - 許容差は playwright.config.ts の expect.toHaveScreenshot（2% / threshold 0.2）。

test.skip(process.platform !== "linux", "基準画像は CI(Linux) 用のみ");

const VIEWPORTS = {
  desktop: { viewport: { width: 1440, height: 900 } },
  mobile: {
    viewport: devices["Pixel 7"].viewport,
    deviceScaleFactor: devices["Pixel 7"].deviceScaleFactor,
    isMobile: true,
    hasTouch: true,
  },
} as const;

for (const [name, opts] of Object.entries(VIEWPORTS)) {
  test.describe(name, () => {
    test.use({ ...opts, reducedMotion: "reduce" });

    test(`トップページ ファーストビュー (${name})`, async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await page.evaluate(() => document.fonts.ready);
      // 入場演出（.reveal 付与）を待つ。
      await expect(page.locator(".reveal").first()).toBeAttached();
      await expect(page).toHaveScreenshot(`top-${name}.png`, {
        // 横に流れ続けるティッカーは比較対象から外す。
        mask: [page.locator(".ticker")],
      });
    });
  });
}
