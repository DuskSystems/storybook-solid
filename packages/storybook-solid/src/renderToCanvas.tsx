import { ErrorBoundary, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { render } from "solid-js/web";
import type { Args, RenderContext } from "storybook/internal/types";
import type { Decorator } from "./public-types";
import type { SolidRenderer } from "./types";

type StoryData = {
  args: Args;
  rendered: boolean;
  dispose?: () => void;
};

const [store, setStore] = createStore<Record<string, StoryData>>();

export async function renderToCanvas(
  renderContext: RenderContext<SolidRenderer>,
  canvasElement: SolidRenderer["canvasElement"],
) {
  const { storyContext, storyFn: Story, forceRemount, showMain, showException } = renderContext;
  const id = storyContext.canvasElement.id;

  if (forceRemount) {
    store[id]?.dispose?.();
    setStore(id, {
      args: {},
      rendered: false,
      dispose: undefined,
    });
  }

  if (!store[id]) {
    setStore(id, {
      args: storyContext.args,
      rendered: false,
    });
  } else {
    setStore(id, "args", storyContext.args);
  }

  if (store[id]?.rendered) {
    return;
  }

  const App = () => {
    onMount(showMain);

    return (
      <ErrorBoundary
        fallback={(err) => {
          showException(err);
          return err;
        }}
      >
        <Story {...storyContext} />
      </ErrorBoundary>
    );
  };

  setStore(id, {
    ...store[id],
    rendered: true,
    dispose: render(() => <App />, canvasElement),
  });
}

export const reactivityDecorator: Decorator = (Story, context) => {
  const id = context.canvasElement.id;
  if (store[id]) {
    context.args = store[id].args;
  }

  return <Story {...context.args} />;
};
