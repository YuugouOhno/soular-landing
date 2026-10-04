import { test as base, expect, type Page } from "@playwright/test";

// ローカル E2E 共通の fixture。
//
// - まごころAI ウィジェット（magokoro-ai.com の外部スクリプト）は空 JS で差し替える。
//   外部サービスの稼働状況でローカルの E2E が揺れないようにするため。
//   本番での読み込みは synthetic 側で見る。
// - console.error / pageerror を収集し、テスト側で「エラーなし」を検査できるようにする。

export type ConsoleProblems = string[];

async function stubThirdParty(page: Page) {
  await page.route(/^https:\/\/magokoro-ai\.com\//, (route) =>
    route.fulfill({ status: 200, contentType: "application/javascript", body: "/* e2e stub */" }),
  );
}

export const test = base.extend<{ consoleProblems: ConsoleProblems }>({
  // auto: 全テストで外部スクリプトのスタブとエラー収集を有効にする。
  consoleProblems: [
    async ({ page }, use) => {
    const problems: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") problems.push(`console.error: ${msg.text()}`);
    });
    page.on("pageerror", (err) => problems.push(`pageerror: ${err.message}`));
    await stubThirdParty(page);
    await use(problems);
    },
    { auto: true },
  ],
});

export { expect };
