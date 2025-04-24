import type { Component as ComponentType, JSX } from "solid-js";
import type { WebRenderer } from "storybook/internal/types";

export type { RenderContext, StoryContext } from "storybook/internal/types";

export interface SolidRenderer extends WebRenderer {
  // @ts-expect-error: Copied from React integration.
  component: ComponentType<this["T"]>;
  storyResult: JSX.Element;
}
