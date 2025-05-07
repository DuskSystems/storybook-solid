import solid from "vite-plugin-solid";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [solid()],

  test: {
    environment: "jsdom",

    coverage: {
      provider: "istanbul",
      reportsDirectory: "coverage",
      include: ["src"],
    },
  },
});
