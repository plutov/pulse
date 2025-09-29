import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      src: resolve(__dirname, "src"),
      components: resolve(__dirname, "src/components"),
      boot: resolve(__dirname, "src/boot"),
      stores: resolve(__dirname, "src/stores"),
    },
  },
  test: {
    environment: "jsdom",
    coverage: {
      provider: "v8",
      exclude: ["dist/**", ".quasar/**"],
    },
  },
});
