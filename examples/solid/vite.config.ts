import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],

  build: {
    target: "esnext",

    lib: {
      formats: ["es"],
      entry: "src/index.ts",
    },

    rollupOptions: {
      external: ["solid-js", "solid-js/web", "solid-js/store"],
    },
  },
});
