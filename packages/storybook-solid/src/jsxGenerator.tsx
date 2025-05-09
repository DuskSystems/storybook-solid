// biome-ignore-all lint/suspicious/noExplicitAny: Best effort parsing.

import * as Babel from "@babel/standalone";
import prettierPluginBabel from "prettier/plugins/babel";
import prettierPluginEstree from "prettier/plugins/estree";
import { format } from "prettier/standalone";
import { logger } from "storybook/internal/client-logger";

const t = Babel.packages.types;
const generate = Babel.packages.generator.default;
const { parseExpression } = Babel.packages.parser;

export async function jsxGenerator(
  name: string,
  attributes: Record<string, unknown>,
  children: unknown,
): Promise<string> {
  const element = createJSXElement(name, attributes, children);
  const { code } = generate(element);

  const formatted = await format(code, {
    parser: "babel-ts",
    plugins: [prettierPluginBabel, prettierPluginEstree],
    printWidth: 120,
    singleAttributePerLine: true,
  });

  return formatted.trim().replace(/;$/, "");
}

function createJSXElement(name: string, attributes: Record<string, unknown>, children: unknown): any {
  const jsxAttributes = createJSXAttributes(attributes);
  const jsxChildren = createJSXChildren(children);
  const hasChildren = jsxChildren.length > 0;

  return t.jsxElement(
    t.jsxOpeningElement(t.jsxIdentifier(name), jsxAttributes, !hasChildren),
    hasChildren ? t.jsxClosingElement(t.jsxIdentifier(name)) : null,
    jsxChildren,
  );
}

function createJSXAttributes(attributes: Record<string, unknown>): any[] {
  const result = [];
  const sorted = Object.entries(attributes).sort(([a], [b]) => a.localeCompare(b));

  for (const [key, value] of sorted) {
    if (value === undefined) {
      continue;
    }

    if (typeof value === "boolean") {
      if (value) {
        result.push(t.jsxAttribute(t.jsxIdentifier(key), null));
      }

      continue;
    }

    const parsed = parseAttributeValue(value, true);
    if (parsed) {
      result.push(t.jsxAttribute(t.jsxIdentifier(key), parsed));
    }
  }

  return result;
}

function parseAttributeValue(value: unknown, root: boolean): any {
  if (value === null || value === undefined) {
    return root ? t.jsxExpressionContainer(t.nullLiteral()) : t.nullLiteral();
  }

  if (Array.isArray(value)) {
    const expression = t.arrayExpression(value.map((item) => parseAttributeValue(item, false)));
    return root ? t.jsxExpressionContainer(expression) : expression;
  }

  switch (typeof value) {
    case "string":
      return t.stringLiteral(value);

    case "number": {
      const expression = t.numericLiteral(value);
      return root ? t.jsxExpressionContainer(expression) : expression;
    }

    case "boolean": {
      const expression = t.booleanLiteral(value);
      return root ? t.jsxExpressionContainer(expression) : expression;
    }

    case "bigint": {
      const expression = t.bigIntLiteral(value.toString());
      return root ? t.jsxExpressionContainer(expression) : expression;
    }

    case "function": {
      const expression = t.arrowFunctionExpression([], t.blockStatement([]));
      return root ? t.jsxExpressionContainer(expression) : expression;
    }

    case "symbol": {
      const expression = value.description
        ? t.callExpression(t.identifier("Symbol"), [t.stringLiteral(value.description)])
        : t.callExpression(t.identifier("Symbol"), []);

      return root ? t.jsxExpressionContainer(expression) : expression;
    }

    case "object": {
      if (value instanceof HTMLElement) {
        const expression = parseExpression(value.outerHTML, { plugins: ["jsx"] });
        return root ? t.jsxExpressionContainer(expression) : expression;
      }

      const properties = [];
      for (const [propKey, propValue] of Object.entries(value)) {
        properties.push(t.objectProperty(t.identifier(propKey), parseAttributeValue(propValue, false)));
      }

      const expression = t.objectExpression(properties);
      return root ? t.jsxExpressionContainer(expression) : expression;
    }

    default:
      logger.warn(`Skipping value "${value}" with unsupported type: ${typeof value}`);
      return root ? null : t.nullLiteral();
  }
}

function createJSXChildren(children: unknown): any[] {
  if (!children) {
    return [];
  }

  if (typeof children === "string") {
    return [t.jsxText(children)];
  }

  if (children instanceof HTMLElement) {
    const expression = parseExpression(children.outerHTML, { plugins: ["jsx"] });
    return [expression];
  }

  if (Array.isArray(children)) {
    const result = [];
    for (const child of children) {
      if (typeof child === "string") {
        result.push(t.jsxText(child));
        continue;
      }

      if (child === null || child === undefined || typeof child === "boolean") {
        continue;
      }

      if (typeof child === "number") {
        result.push(t.jsxText(String(child)));
        continue;
      }

      if (Array.isArray(child)) {
        const nested = createJSXChildren(child);
        result.push(...nested);
        continue;
      }

      if (child instanceof HTMLElement) {
        result.push(parseExpression(child.outerHTML, { plugins: ["jsx"] }));
        continue;
      }

      const parsed = parseChild(child);
      if (parsed) {
        result.push(t.jsxExpressionContainer(parsed));
      }
    }

    return result;
  }

  const parsed = parseChild(children);
  if (parsed) {
    return [t.jsxExpressionContainer(parsed)];
  }

  return [];
}

function parseChild(value: unknown): any {
  if (value === null || value === undefined) {
    return null;
  }

  if (Array.isArray(value)) {
    const items = value.map((item) => parseChild(item)).filter(Boolean);
    if (items.length > 0) {
      return t.arrayExpression(items);
    }

    return null;
  }

  switch (typeof value) {
    case "string":
      return t.stringLiteral(value);

    case "number":
      return t.stringLiteral(value.toString());

    case "boolean":
      return null;

    case "function":
      return null;

    case "object": {
      if (value instanceof HTMLElement) {
        return parseExpression(value.outerHTML, { plugins: ["jsx"] });
      }

      const properties = [];
      for (const [propKey, propValue] of Object.entries(value)) {
        const parsed = parseChild(propValue);
        if (parsed) {
          properties.push(t.objectProperty(t.identifier(propKey), parsed));
        }
      }

      if (properties.length > 0) {
        return t.objectExpression(properties);
      }

      return null;
    }

    default:
      logger.warn(`Skipping value "${value}" with unsupported type: ${typeof value}`);
      return null;
  }
}
