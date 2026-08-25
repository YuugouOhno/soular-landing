import { globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  globalIgnores([".next/**", "node_modules/**", "dist/**"]),
  ...nextVitals,
];

export default eslintConfig;
