// @ts-check

import js from "@eslint/js";
import globals from "globals";
import pluginVue from "eslint-plugin-vue";
import pluginQuasar from "@quasar/app-vite/eslint";
import {
  defineConfigWithVueTs,
  vueTsConfigs,
} from "@vue/eslint-config-typescript";
import prettierSkipFormatting from "@vue/eslint-config-prettier/skip-formatting";

export default defineConfigWithVueTs(
  pluginQuasar.configs.recommended(),
  js.configs.recommended,
  pluginVue.configs["flat/essential"],

  {
    files: ["**/*.ts", "**/*.vue"],
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports" },
      ],
    },
  },
  // https://github.com/vuejs/eslint-config-typescript
  vueTsConfigs.recommendedTypeChecked,

  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",

      globals: {
        ...globals.browser,
        ...globals.node, // SSR, Electron, config files
        process: "readonly", // process.env.*
        ga: "readonly", // Google Analytics
        cordova: "readonly",
        Capacitor: "readonly",
        chrome: "readonly", // BEX related
        browser: "readonly", // BEX related
      },
    },

    // add your custom rules here
    rules: {
      "prefer-promise-reject-errors": "off",

      // allow debugger during development only
      "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    },
  },

  {
    files: ["src-pwa/custom-service-worker.ts"],
    languageOptions: {
      globals: {
        ...globals.serviceworker,
      },
    },
  },

  prettierSkipFormatting,
);
