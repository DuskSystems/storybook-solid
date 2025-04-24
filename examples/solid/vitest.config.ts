import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    plugins: [storybookTest()],

    test: {
      name: "storybook",
      setupFiles: [".storybook/vitest.setup.ts"],

      environment: "node",

      browser: {
        enabled: true,
        headless: true,

        provider: "playwright",
        instances: [{ browser: "chromium" }, { browser: "firefox" }],
      },

      coverage: {
        provider: "istanbul",
        reportsDirectory: "coverage",
        include: ["src"],
      },
    },
  }),
);
