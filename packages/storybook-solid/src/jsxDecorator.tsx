import * as Babel from "@babel/standalone";
import prettierPluginBabel from "prettier/plugins/babel";
import prettierPluginEstree from "prettier/plugins/estree";
import { format } from "prettier/standalone";
import { SNIPPET_RENDERED, SourceType } from "storybook/internal/docs-tools";
import type { PartialStoryFn, StoryContext } from "storybook/internal/types";
import { addons, useEffect } from "storybook/preview-api";
import type { SolidRenderer } from "./types";

const t = Babel.packages.types;
const generate = Babel.packages.generator.default;

type JSXAttribute = ReturnType<typeof t.jsxAttribute>;
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
  const opening = t.jsxOpeningElement(t.jsxIdentifier(name), createJSXAttributes(attributes), !children);

  const element = t.jsxElement(
    opening,
    children ? t.jsxClosingElement(t.jsxIdentifier(name)) : null,
    createJSXChildren(children),
    !children,
  );

  const { code } = generate(element);

  // TODO: Switch to `biome` once `tsdown` supports top-level await for CJS?
  let formatted = await format(code, {
    parser: "babel",
    plugins: [prettierPluginBabel, prettierPluginEstree],
    printWidth: 120,
    singleAttributePerLine: true,
  });

  formatted = formatted.trim();
  if (formatted.endsWith(";")) {
    return formatted.slice(0, -1);
  }

  return formatted;
}

function createJSXAttributes(attributes: Record<string, unknown>): JSXAttribute[] {
  const result: JSXAttribute[] = [];

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

  return t.jsxAttribute(t.jsxIdentifier(key), t.jsxExpressionContainer(t.valueToNode(value)));
}

function createJSXChildren(children: unknown): Array<JSXText | JSXExpressionContainer> {
  if (!children) {
    return [];
  }

  if (typeof children === "string") {
    return [t.jsxText(children)];
  }

  if (Array.isArray(children)) {
    const result: Array<JSXText | JSXExpressionContainer> = [];

    for (const child of children) {
      if (typeof child === "string") {
        result.push(t.jsxText(child));
      } else {
        result.push(t.jsxExpressionContainer(t.valueToNode(child)));
      }
    }

    return result;
  }

  return [t.jsxExpressionContainer(t.valueToNode(children))];
}
