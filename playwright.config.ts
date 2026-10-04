import { defineConfig, devices } from "@playwright/test";

// ローカル実挙動テスト（e2e/local）。`next build` 済みの成果物を `next start` で立て、
// 事前確認フォームの中継先はモック受信側（e2e/support/mock-service.mjs）へ向ける。
//
// - 本物のメールは送らない: RESEND_API_KEY を空にし、テストも有効な問い合わせを
//   サーバーへ送らない（成功表示はブラウザ側で /api/contact をモックして確認する）。
// - 本物の HRMS / aichat にはつながない: PRECONTRACT_*_URL はすべてモックを指す。
// - 本番向けの読み取り専用チェックは playwright.synthetic.config.ts（synthetic プロジェクト）。

const PORT = Number(process.env.E2E_PORT ?? 3100);
const MOCK_PORT = Number(process.env.MOCK_SERVICE_PORT ?? 4010);
const MOCK_SECRET = "e2e-mock-secret";
const MOCK_URL = `http://127.0.0.1:${MOCK_PORT}`;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e/local",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  timeout: 30_000,
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.02, threshold: 0.2, animations: "disabled" },
  },
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    locale: "ja-JP",
    timezoneId: "Asia/Tokyo",
  },
  projects: [{ name: "e2e", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "node e2e/support/mock-service.mjs",
      url: `${MOCK_URL}/__health`,
      env: { MOCK_SERVICE_PORT: String(MOCK_PORT), MOCK_SERVICE_SECRET: MOCK_SECRET },
      reuseExistingServer: false,
      stdout: "pipe",
    },
    {
      // ビルドは事前に済ませる（npm run test:e2e / CI の build ステップ）。
      command: `npx next start --port ${PORT}`,
      url: BASE_URL,
      timeout: 60_000,
      reuseExistingServer: false,
      env: {
        // 問い合わせメールを絶対に送らない。
        RESEND_API_KEY: "",
        RESEND_FROM_EMAIL: "",
        // next start は NODE_ENV=production なので合言葉の開発用フォールバックは効かない。
        // 開発時と同じ "soular" を明示する。
        PRECONTRACT_ACCESS_PASSWORD: "soular",
        PRECONTRACT_CONDITIONS_SECRET: "e2e-conditions-secret",
        PRECONTRACT_HRMS_URL: MOCK_URL,
        PRECONTRACT_HRMS_SECRET: MOCK_SECRET,
        PRECONTRACT_AICHAT_URL: MOCK_URL,
        PRECONTRACT_AICHAT_SECRET: MOCK_SECRET,
        PRECONTRACT_RIPICHAN_URL: MOCK_URL,
        PRECONTRACT_RIPICHAN_SECRET: MOCK_SECRET,
      },
    },
  ],
});
