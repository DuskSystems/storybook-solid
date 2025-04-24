import { defineMain } from "@storybook/react-vite/node";

export default defineMain({
  framework: "@storybook/react-vite",
  stories: ["../src/**/!(__screenshots__)/*.stories.tsx"],
  addons: ["@storybook/addon-docs", "@storybook/addon-vitest"],
});
