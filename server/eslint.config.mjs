import { fixupConfigRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  // migrate ignore patterns from .eslintignore / package.json
  {
    ignores: ["build.ts", "src/configs/config.ts"],
  },

  // bring in compatible rules/configs (keep core + typescript recommended)
  ...fixupConfigRules(
    compat.extends(
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:@typescript-eslint/recommended-requiring-type-checking"
    )
  ),

  // project-specific languageOptions and rule tweaks
  {
    languageOptions: {
      parser: await import("@typescript-eslint/parser").then((m) => m.default || m),
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    rules: {
      "max-len": ["error", { code: 100 }],
      "no-console": 1,
      "no-extra-boolean-cast": 0,
      "@typescript-eslint/restrict-plus-operands": 0,
      "@typescript-eslint/explicit-module-boundary-types": 0,
      "@typescript-eslint/no-explicit-any": 0,
      "@typescript-eslint/no-floating-promises": 0,
      "@typescript-eslint/no-unsafe-member-access": 0,
      "@typescript-eslint/no-unsafe-assignment": 0,
      "@typescript-eslint/no-unsafe-call": 0,
    },
  },
];
