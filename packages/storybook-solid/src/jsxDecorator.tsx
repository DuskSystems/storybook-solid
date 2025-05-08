import type { Component } from "solid-js";
import { logger } from "storybook/internal/client-logger";
import { SNIPPET_RENDERED, SourceType } from "storybook/internal/docs-tools";
import type { Args, PartialStoryFn, StoryContext } from "storybook/internal/types";
import { addons, useEffect, useRef } from "storybook/preview-api";
import { jsxGenerator } from "./jsxGenerator";
import type { SolidRenderer } from "./types";

// NOTE: Copied from React integration.
function skipSourceRender(context: StoryContext<SolidRenderer>): boolean {
  const sourceParams = context?.parameters.docs?.source;
  const isArgsStory = context?.parameters.__isArgsStory;

  if (sourceParams?.type === SourceType.DYNAMIC) {
    return false;
  }

  return !isArgsStory || sourceParams?.code || sourceParams?.type === SourceType.CODE;
}

export const jsxDecorator = (storyFn: PartialStoryFn<SolidRenderer>, context: StoryContext<SolidRenderer>) => {
  const jsx = useRef<string | null>(null);
  const story = storyFn();
  const channel = addons.getChannel();

  const skip = skipSourceRender(context);

  useEffect(() => {
    if (skip) {
      return;
    }

    const emitSource = (args: Args) => {
      const name = extractComponentName(context.component);
      const { children, ...attributes } = args;

      jsxGenerator(name, attributes, children).then((source) => {
        if (source && source !== jsx.current) {
          jsx.current = source;
          channel.emit(SNIPPET_RENDERED, {
            id: context.id,
            args,
            source,
          });
        }
      });
    };

    emitSource(context.args);
    const onArgsUpdate = ({ args }: { args: Args }) => emitSource(args);

    channel.on("storyArgsUpdated", onArgsUpdate);
    return () => {
      channel.off("storyArgsUpdated", onArgsUpdate);
    };
  });

  return story;
};

function extractComponentName(component: Component | undefined): string {
  // biome-ignore lint/suspicious/noExplicitAny: Best effort.
  const displayName = (component as any).displayName;
  if (typeof displayName === "string") {
    return displayName;
  }

  const name = component?.name?.replace("[solid-refresh]", "") || null;
  if (name) {
    return name;
  }

  logger.warn("Failed to extract component name: ", component);
  return "Component";
}
