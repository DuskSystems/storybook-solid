import { defineMain } from "@dusksystems/storybook-solid-vite/node";

export default defineMain({
  framework: "@dusksystems/storybook-solid-vite",
  stories: ["../src/**/!(__screenshots__)/*.stories.tsx"],
  addons: ["@storybook/addon-docs", "@storybook/addon-vitest"],
});
