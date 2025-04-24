import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],

  build: {
    target: "esnext",

    lib: {
      formats: ["es"],
      entry: "src/index.ts",
    },

    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
    },
  },
});
