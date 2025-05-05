import * as recast from "recast";
import { SNIPPET_RENDERED, SourceType } from "storybook/internal/docs-tools";
import type { PartialStoryFn, StoryContext } from "storybook/internal/types";
import { addons, useEffect } from "storybook/preview-api";
import type { SolidRenderer } from "./types";

const t = recast.types.builders;

type JSXAttribute = recast.types.namedTypes.JSXAttribute;
type JSXElement = recast.types.namedTypes.JSXElement;
type JSXExpressionContainer = recast.types.namedTypes.JSXExpressionContainer;
type JSXText = recast.types.namedTypes.JSXText;

// NOTE: Copied from React integration.
function skipSourceRender(context: StoryContext<SolidRenderer>): boolean {
  const sourceParams = context?.parameters.docs?.source;
  const isArgsStory = context?.parameters.__isArgsStory;

  if (sourceParams?.type === SourceType.DYNAMIC) {
    return false;
  }

  return !isArgsStory || sourceParams?.code || sourceParams?.type === SourceType.CODE;
}

// TODO: Add formatting of render functions, see: `Hooks Story` in examples.
export const jsxDecorator = (storyFn: PartialStoryFn<SolidRenderer>, context: StoryContext<SolidRenderer>) => {
  const story = storyFn();
  const channel = addons.getChannel();

  const skip = skipSourceRender(context);
  if (skip) {
    return story;
  }

  const name = context.component?.name.replace("[solid-refresh]", "");
  if (!name) {
    console.error("Missing name");
    return story;
  }

  const { children, ...attributes } = context.args;

  useEffect(() => {
    generateSolidSource(name, attributes, children).then((source) => {
      channel.emit(SNIPPET_RENDERED, {
        id: context.id,
        args: context.unmappedArgs,
        source,
      });
    });
  });

  return story;
};

export async function generateSolidSource(
  name: string,
  attributes: Record<string, unknown>,
  children: unknown,
): Promise<string> {
  const element = createJSXElement(name, attributes, children);
  const { code } = recast.print(element);
  return code;
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

    return t.jsxAttribute(t.jsxIdentifier(key), t.jsxExpressionContainer(t.booleanLiteral(false)));
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

  console.warn(`Skipping attribute "${key}" with unsupported value type: ${typeof value} ${value}`);
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

  console.warn(`Skipping children with unsupported value type: ${typeof children} ${children}`);
  return [];
}
