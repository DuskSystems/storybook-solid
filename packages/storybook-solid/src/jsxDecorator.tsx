import * as Babel from "@babel/standalone";
import prettierPluginBabel from "prettier/plugins/babel";
import prettierPluginEstree from "prettier/plugins/estree";
import { format } from "prettier/standalone";
import type { Component } from "solid-js";
import { logger } from "storybook/internal/client-logger";
import { SNIPPET_RENDERED, SourceType } from "storybook/internal/docs-tools";
import type { Args, PartialStoryFn, StoryContext } from "storybook/internal/types";
import { addons, useEffect, useRef } from "storybook/preview-api";
import type { SolidRenderer } from "./types";

const t = Babel.packages.types;
const generate = Babel.packages.generator.default;

type JSXAttribute = ReturnType<typeof t.jsxAttribute>;
type JSXElement = ReturnType<typeof t.jsxElement>;
type JSXExpressionContainer = ReturnType<typeof t.jsxExpressionContainer>;
type JSXText = ReturnType<typeof t.jsxText>;

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
      generateSolidSource(context, args).then((source) => {
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

async function generateSolidSource(context: StoryContext<SolidRenderer>, args: Args): Promise<string> {
  const name = extractComponentName(context.component);
  const { children, ...attributes } = args;

  const element = createJSXElement(name, attributes, children);
  const { code } = generate(element);

  const formatted = await format(code, {
    parser: "babel",
    plugins: [prettierPluginBabel, prettierPluginEstree],
    printWidth: 120,
    singleAttributePerLine: true,
  });

  return formatted.trim().replace(/;$/, "");
}

function extractComponentName(component: Component | undefined): string {
  const name = component?.name?.replace("[solid-refresh]", "") || null;
  if (name && name !== "C") {
    return name;
  }

  // biome-ignore lint/suspicious/noExplicitAny: Best effort.
  const displayName = (component as any).displayName;
  if (typeof displayName === "string") {
    return displayName;
  }

  logger.warn("Failed to extract component name: ", component);
  return "Component";
}

function createJSXElement(name: string, attributes: Record<string, unknown>, children: unknown): JSXElement {
  const jsxAttributes = createJSXAttributes(attributes);
  const jsxChildren = createJSXChildren(children);
  const hasChildren = jsxChildren.length > 0;

  return t.jsxElement(
    t.jsxOpeningElement(t.jsxIdentifier(name), jsxAttributes, !hasChildren),
    hasChildren ? t.jsxClosingElement(t.jsxIdentifier(name)) : null,
    jsxChildren,
  );
}

function createJSXAttributes(attributes: Record<string, unknown>): JSXAttribute[] {
  const result = [];

  const sorted = Object.entries(attributes).sort(([a], [b]) => a.localeCompare(b));
  for (const [key, value] of sorted) {
    const attribute = createSingleAttribute(key, value);
    if (attribute) {
      result.push(attribute);
    }
  }

  return result;
}

function createSingleAttribute(key: string, value: unknown): JSXAttribute | null {
  if (typeof value === "string") {
    return t.jsxAttribute(t.jsxIdentifier(key), t.stringLiteral(value));
  }

  if (typeof value === "number") {
    return t.jsxAttribute(t.jsxIdentifier(key), t.jsxExpressionContainer(t.numericLiteral(value)));
  }

  if (typeof value === "boolean") {
    if (value) {
      return t.jsxAttribute(t.jsxIdentifier(key), null);
    }

    return null;
  }

  if (value === null || value === undefined) {
    return t.jsxAttribute(t.jsxIdentifier(key), t.jsxExpressionContainer(t.nullLiteral()));
  }

  if (typeof value === "function") {
    return t.jsxAttribute(
      t.jsxIdentifier(key),
      t.jsxExpressionContainer(t.arrowFunctionExpression([], t.blockStatement([]))),
    );
  }

  logger.warn(`Skipping attribute "${key}" with unsupported value type: ${typeof value} ${value}`);
  return null;
}

function createJSXChildren(children: unknown): (JSXText | JSXExpressionContainer)[] {
  if (!children) {
    return [];
  }

  if (typeof children === "string") {
    return [t.jsxText(children)];
  }

  if (Array.isArray(children)) {
    const result = [];

    for (const child of children) {
      if (typeof child === "string") {
        result.push(t.jsxText(child));
      } else {
        result.push(t.jsxExpressionContainer(child));
      }
    }

    return result;
  }

  logger.warn(`Skipping children with unsupported value type: ${typeof children} ${children}`);
  return [];
}
