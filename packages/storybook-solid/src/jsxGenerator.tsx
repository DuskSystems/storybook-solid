import * as Babel from "@babel/standalone";
import prettierPluginBabel from "prettier/plugins/babel";
import prettierPluginEstree from "prettier/plugins/estree";
import { format } from "prettier/standalone";
import { logger } from "storybook/internal/client-logger";

const t = Babel.packages.types;
const generate = Babel.packages.generator.default;

type JSXAttribute = ReturnType<typeof t.jsxAttribute>;
type JSXElement = ReturnType<typeof t.jsxElement>;
type JSXExpressionContainer = ReturnType<typeof t.jsxExpressionContainer>;
type JSXText = ReturnType<typeof t.jsxText>;

export async function jsxGenerator(
  name: string,
  attributes: Record<string, unknown>,
  children: unknown,
): Promise<string> {
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
  if (value === undefined) {
    return null;
  }

  if (typeof value === "boolean") {
    if (value) {
      return t.jsxAttribute(t.jsxIdentifier(key), null);
    }

    return null;
  }

  if (typeof value === "string") {
    return t.jsxAttribute(t.jsxIdentifier(key), t.stringLiteral(value));
  }

  if (value === null) {
    return t.jsxAttribute(t.jsxIdentifier(key), t.jsxExpressionContainer(t.nullLiteral()));
  }

  if (typeof value === "number") {
    return t.jsxAttribute(t.jsxIdentifier(key), t.jsxExpressionContainer(t.numericLiteral(value)));
  }

  if (typeof value === "function") {
    return t.jsxAttribute(
      t.jsxIdentifier(key),
      t.jsxExpressionContainer(t.arrowFunctionExpression([], t.blockStatement([]))),
    );
  }

  if (Array.isArray(value)) {
    return t.jsxAttribute(
      t.jsxIdentifier(key),
      t.jsxExpressionContainer(t.arrayExpression(value.map((item) => valueToNode(item)))),
    );
  }

  if (typeof value === "object") {
    const properties = Object.entries(value).map(([propKey, propValue]) => {
      return t.objectProperty(t.identifier(propKey), valueToNode(propValue));
    });

    return t.jsxAttribute(t.jsxIdentifier(key), t.jsxExpressionContainer(t.objectExpression(properties)));
  }

  logger.warn(`Skipping attribute "${key}" with unsupported value type: ${typeof value}`);
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
    return children.map((child) => {
      if (typeof child === "string") {
        return t.jsxText(child);
      }

      return t.jsxExpressionContainer(valueToNode(child));
    });
  }

  return [t.jsxExpressionContainer(valueToNode(children))];
}

// biome-ignore lint/suspicious/noExplicitAny: Best effort.
function valueToNode(value: unknown): any {
  if (value === null || value === undefined) {
    return t.nullLiteral();
  }

  if (typeof value === "string") {
    return t.stringLiteral(value);
  }

  if (typeof value === "number") {
    return t.numericLiteral(value);
  }

  if (typeof value === "boolean") {
    return t.booleanLiteral(value);
  }

  if (typeof value === "function") {
    return t.arrowFunctionExpression([], t.blockStatement([]));
  }

  if (Array.isArray(value)) {
    return t.arrayExpression(value.map((item) => valueToNode(item)));
  }

  if (typeof value === "object") {
    const properties = Object.entries(value).map(([propKey, propValue]) => {
      return t.objectProperty(t.identifier(propKey), valueToNode(propValue));
    });

    return t.objectExpression(properties);
  }

  return t.nullLiteral();
}
