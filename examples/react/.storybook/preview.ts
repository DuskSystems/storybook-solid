import addonDocs from "@storybook/addon-docs";
import addonVitest from "@storybook/addon-vitest";
import { definePreview } from "@storybook/react-vite";

export default definePreview({
  addons: [addonDocs(), addonVitest()],
  parameters: {
    backgrounds: {
      options: {
        light: { name: "light", value: "#FFFFFF" },
        dark: { name: "dark", value: "#000000" },
      },
    },
    controls: {
      expanded: true,
    },
    docs: {
      canvas: {
        sourceState: "shown",
      },
    },
  },
  initialGlobals: {
    backgrounds: { value: "light" },
  },
});
