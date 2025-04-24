import type { BuilderOptions, StorybookConfigVite } from "@storybook/builder-vite";
import type { CompatibleString, StorybookConfig as StorybookConfigBase } from "storybook/internal/types";

type FrameworkName = CompatibleString<"@dusksystems/storybook-solid-vite">;
type BuilderName = CompatibleString<"@storybook/builder-vite">;

export type FrameworkOptions = {
  builder?: BuilderOptions;
};

type StorybookConfigFramework = {
  framework:
    | FrameworkName
    | {
        name: FrameworkName;
        options: FrameworkOptions;
      };
  core?: StorybookConfigBase["core"] & {
    builder?:
      | BuilderName
      | {
          name: BuilderName;
          options: BuilderOptions;
        };
  };
};

export type StorybookConfig = Omit<StorybookConfigBase, keyof StorybookConfigVite | keyof StorybookConfigFramework> &
  StorybookConfigVite &
  StorybookConfigFramework;
