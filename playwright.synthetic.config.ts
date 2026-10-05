import { defineConfig } from "@playwright/test";

// 本番（https://soular-inc.com）向けの synthetic チェック。**読み取り専用**。
// 問い合わせ・事前確認の正規送信は絶対にしない（e2e/synthetic/*.spec.ts の冒頭を参照）。
//
//   npm run test:synthetic                          # 本番
//   SYNTHETIC_BASE_URL=https://<preview> npm run test:synthetic

export default defineConfig({
  testDir: "./e2e/synthetic",
  fullyParallel: true,
  retries: 2,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  timeout: 30_000,
  use: {
    baseURL: process.env.SYNTHETIC_BASE_URL ?? "https://soular-inc.com",
    extraHTTPHeaders: { "user-agent": "soular-landing-synthetic/1.0 (+playwright)" },
  },
  projects: [{ name: "synthetic" }],
});
