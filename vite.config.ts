import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import jsx from "@vitejs/plugin-vue-jsx";
import path from "path";
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // base: mode === "production" ? "/manajemen-dashboard/" : "/",
  base: mode === "production" ? "/" : "/",
  resolve: {
    alias: {
      "@": path.resolve("./src"),
    },
  },
  plugins: [vue(), jsx()],
}));
