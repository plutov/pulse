// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-file

import { defineConfig } from "#q-app/wrappers";

export default defineConfig(() => {
  return {
    boot: ["pinia", "axios"],
    css: ["app.scss"],
    extras: ["material-icons", "roboto-font"],
    build: {
      target: {
        browser: ["es2022", "firefox115", "chrome115", "safari14"],
        node: "node20",
      },
      typescript: {
        strict: true,
        vueShim: true,
      },
      vueRouterMode: "hash",
      vitePlugins: [
        [
          "vite-plugin-checker",
          {
            vueTsc: false,
            eslint: {
              lintCommand:
                'eslint -c ./eslint.config.mjs "./src*/**/*.{ts,js,mjs,cjs,vue}"',
              useFlatConfig: true,
            },
          },
          { server: false },
        ],
      ],
    },
    devServer: {
      open: false,
    },
    framework: {
      config: {
        dark: true,
      },
      iconSet: "material-icons",
      plugins: ["Notify"],
    },
    animations: [],
  };
});
