import * as Babel from "@babel/standalone";
import prettierPluginBabel from "prettier/plugins/babel";
import prettierPluginEstree from "prettier/plugins/estree";
import { format } from "prettier/standalone";
import type { Component } from "solid-js";
import { SNIPPET_RENDERED, SourceType } from "storybook/internal/docs-tools";
import { addons, useEffect, useRef } from "storybook/internal/preview-api";
import type { PartialStoryFn } from "storybook/internal/types";
import type { Args } from "./public-types";
import type { SolidRenderer, StoryContext } from "./types";

const t = Babel.packages.types;
const generate = Babel.packages.generator.default;
const traverse = Babel.packages.traverse.default;
const { parse } = Babel.packages.parser;

type Expression = ReturnType<typeof t.toExpression>;
type File = ReturnType<typeof t.file>;
type JSXAttribute = ReturnType<typeof t.jsxAttribute>;
type JSXElement = ReturnType<typeof t.jsxElement>;
type JSXExpressionContainer = ReturnType<typeof t.jsxExpressionContainer>;
type JSXText = ReturnType<typeof t.jsxText>;
type ObjectExpression = ReturnType<typeof t.objectExpression>;
type ObjectProperty = ReturnType<typeof t.objectProperty>;
type SpreadElement = ReturnType<typeof t.spreadElement>;

function skipSourceRender(context: StoryContext<SolidRenderer>): boolean {
  const sourceParams = context?.parameters.docs?.source;
  const isArgsStory = context?.parameters.__isArgsStory;

  if (sourceParams?.type === SourceType.DYNAMIC) {
    return false;
  }

  if (sourceParams?.originalSource?.includes("render:")) {
    return true;
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
      // FIXME: Make use of args here for reactivity?
      // We'll want to prefer source dervied values, unless trivially updatable.
      const name = extractComponentName(context.component);
      const originalSource = context?.parameters.docs?.source?.originalSource;

      jsxGenerator(name, originalSource).then((source) => {
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
  if (!component) {
    return "Component";
  }

  if ("displayName" in component && typeof component?.displayName === "string") {
    return component.displayName;
  }

  if (typeof component?.name === "string") {
    return component.name.replace("[solid-refresh]", "");
  }

  return "Component";
}

export async function jsxGenerator(name: string, source: string): Promise<string | undefined> {
  const ast = parse(source, {
    plugins: ["jsx", "typescript"],
  });

  const args = extractArgs(ast);
  if (!args) {
    return;
  }

  const { attributes, children } = convertArgsToJSX(args);

  const hasChildren = children.length > 0;
  const openingElement = t.jsxOpeningElement(t.jsxIdentifier(name), attributes, !hasChildren);
  const closingElement = hasChildren ? t.jsxClosingElement(t.jsxIdentifier(name)) : null;
  const jsx = t.jsxElement(openingElement, closingElement, children, !hasChildren);

  const { code } = generate(jsx);

  const formatted = await format(code, {
    parser: "babel-ts",
    plugins: [prettierPluginBabel, prettierPluginEstree],
    printWidth: 120,
    singleAttributePerLine: true,
  });

  return formatted.trim().replace(/;$/, "");
}

function extractArgs(ast: File): ObjectExpression | null {
  let args = null;

  traverse(ast, {
    CallExpression(path) {
      if (
        t.isMemberExpression(path.node.callee) &&
        t.isIdentifier(path.node.callee.object, { name: "meta" }) &&
        t.isIdentifier(path.node.callee.property, { name: "story" })
      ) {
        const [first] = path.node.arguments;
        if (t.isObjectExpression(first)) {
          for (const prop of first.properties) {
            if (
              t.isObjectProperty(prop) &&
              t.isIdentifier(prop.key, { name: "args" }) &&
              t.isObjectExpression(prop.value)
            ) {
              args = prop.value;
              path.stop();
              break;
            }
          }
        }
      }
    },
  });

  return args;
}

function convertArgsToJSX(args: ObjectExpression) {
  const children: (JSXElement | JSXText | JSXExpressionContainer)[] = [];
  const attributes: JSXAttribute[] = [];

  if (!args) {
    return { attributes, children };
  }

  for (const prop of args.properties) {
    if (!t.isObjectProperty(prop)) {
      continue;
    }

    if (!t.isIdentifier(prop.key)) {
      continue;
    }

    if (prop.key.name === "children") {
      const extractedChildren = extractChildrenFromProp(prop);
      children.push(...extractedChildren);
      continue;
    }

    // TODO: ?
    if (!t.isExpression(prop.value)) {
      continue;
    }

    const value = convertValueToJSXValue(prop.value);
    if (value) {
      attributes.push(t.jsxAttribute(t.jsxIdentifier(prop.key.name), value));
    }
  }

  return { attributes, children };
}

function convertValueToJSXValue(value: Expression): JSXExpressionContainer | null {
  if (
    t.isStringLiteral(value) ||
    t.isNumericLiteral(value) ||
    t.isBooleanLiteral(value) ||
    t.isNullLiteral(value) ||
    t.isIdentifier(value) ||
    t.isObjectExpression(value) ||
    t.isArrayExpression(value) ||
    t.isFunctionExpression(value) ||
    t.isArrowFunctionExpression(value) ||
    t.isCallExpression(value) ||
    t.isJSXElement(value)
  ) {
    return t.jsxExpressionContainer(value);
  }

  return null;
}

function extractChildrenFromProp(prop: ObjectProperty): (JSXElement | JSXText | JSXExpressionContainer)[] {
  if (t.isArrayExpression(prop.value)) {
    const children = [];
    for (const element of prop.value.elements) {
      const child = convertElementToJSXChild(element);
      if (child !== null) {
        children.push(child);
      }
    }

    return children;
  }

  if (t.isJSXElement(prop.value)) {
    return [prop.value];
  }

  if (t.isStringLiteral(prop.value)) {
    return [t.jsxText(prop.value.value)];
  }

  if (t.isExpression(prop.value)) {
    return [t.jsxExpressionContainer(prop.value)];
  }

  return [];
}

function convertElementToJSXChild(element: Expression | SpreadElement | null) {
  if (!element) {
    return null;
  }

  if (t.isStringLiteral(element)) {
    return t.jsxText(element.value);
  }

  if (
    t.isNumericLiteral(element) ||
    t.isBooleanLiteral(element) ||
    t.isNullLiteral(element) ||
    t.isArrayExpression(element) ||
    t.isObjectExpression(element)
  ) {
    return t.jsxExpressionContainer(element);
  }

  if (t.isJSXElement(element)) {
    return element;
  }

  // TODO: ?
  if (t.isSpreadElement(element)) {
    return null;
  }

  return t.jsxExpressionContainer(element);
}
