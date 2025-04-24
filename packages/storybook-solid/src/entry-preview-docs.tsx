// @ts-expect-error No typedef, but this export exists.
import { parameters as jsxParameters } from "@storybook/react/dist/entry-preview-docs.mjs";
import { enhanceArgTypes, extractComponentDescription } from "storybook/internal/docs-tools";
import type { ArgTypesEnhancer } from "storybook/internal/types";
import { jsxDecorator } from "./jsxDecorator";
import type { Decorator, SolidRenderer } from "./public-types";

export const parameters = {
  docs: {
    story: {
      inline: true,
    },
    extractArgTypes: jsxParameters.docs.extractArgTypes,
    extractComponentDescription,
  },
};

export const decorators: Decorator<SolidRenderer>[] = [jsxDecorator];
export const argTypesEnhancers: ArgTypesEnhancer<SolidRenderer>[] = [enhanceArgTypes];
