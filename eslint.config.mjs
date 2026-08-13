import { globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  // 旧 Cloudflare Worker は移行完了 (Phase 4) まで残すが、lint 対象からは外す。
  globalIgnores([".next/**", "node_modules/**", "dist/**", "worker/**"]),
  ...nextVitals,
];

export default eslintConfig;
