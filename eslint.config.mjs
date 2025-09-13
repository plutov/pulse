// @ts-check

import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  {
    files: ["**/*.{js,ts}"],
    extends: [eslint.configs.recommended],
    languageOptions: {
      globals: {
        module: "readonly",
        require: "readonly",
        process: "readonly",
      },
    },
  },
  {
    files: ["**/*.ts"],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    ignores: ["dist/**", "node_modules/**", "eslint.config.mjs", "src/apigen/**"],
  }
);
