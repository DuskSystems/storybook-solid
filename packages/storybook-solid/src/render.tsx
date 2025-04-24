import type { ArgsStoryFn } from "storybook/internal/types";
import type { SolidRenderer } from "./types";

export const render: ArgsStoryFn<SolidRenderer> = (_args, context) => {
  const { id, component: Component } = context;
  if (!Component) {
    throw new Error(`Unable to render story ${id} as the component annotation is missing from the default export`);
  }

  // Don't touch '_args', since they aren't reactive.
  return <Component {...context.args} />;
};
