import { globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  globalIgnores([".next/**", "node_modules/**", "dist/**", "playwright-report/**", "test-results/**"]),
  ...nextVitals,
];

export default eslintConfig;
