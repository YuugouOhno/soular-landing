import { configDefaults, defineConfig } from "vitest/config";
import { fileURLToPath } from "url";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  // e2e/ は Playwright のテスト。vitest に拾わせない。
  test: { exclude: [...configDefaults.exclude, "e2e/**"] },
});
