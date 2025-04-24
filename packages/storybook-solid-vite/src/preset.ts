import jsxDocgen from "@joshwooding/vite-plugin-react-docgen-typescript";
import type { PresetProperty } from "storybook/internal/types";
import type { StorybookConfig } from "./types";

export const core: PresetProperty<"core", StorybookConfig> = {
  builder: "@storybook/builder-vite",
  renderer: "@dusksystems/storybook-solid",
};

export const viteFinal: StorybookConfig["viteFinal"] = async (config) => {
  const plugins = config.plugins ?? [];

  plugins.unshift(
    jsxDocgen({
      savePropValueAsString: true,
      shouldRemoveUndefinedFromOptional: true,
    }),
  );

  return { ...config, plugins };
};
