import type { Decorator } from "./public-types";
import { reactivityDecorator } from "./renderToCanvas";

export const parameters = {
  renderer: "solid",
};

export { render } from "./render";
export { renderToCanvas } from "./renderToCanvas";

export const decorators: Decorator[] = [reactivityDecorator];
