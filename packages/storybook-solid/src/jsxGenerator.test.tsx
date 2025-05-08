import { Show } from "solid-js/web";
import { describe, expect, it } from "vitest";
import { jsxGenerator } from "./jsxGenerator";

describe("jsxGenerator", () => {
  it("handles all kinds of attributes", async () => {
    const result = await jsxGenerator(
      "MyComponent",
      {
        string: "hello",
        number: 42,
        boolTrue: true,
        boolFalse: false,
        nil: null,
        array: [1, 2, 3],
        nested: ["nested", ["array", 456]],
        object: { foo: "bar", baz: false },
        complex: { bar: 123, foo: ["array", 456] },
        func: function power(x: number) {
          return x * x;
        },
        arrow: (x: number) => x * 2,
        element: <div>Hi</div>,
        symbol: Symbol("foo"),
        big: BigInt(123456),
      },
      null,
    );

    expect(result).toMatchInlineSnapshot(`
      "<MyComponent
        array={[1, 2, 3]}
        arrow={() => {}}
        big={123456n}
        boolTrue
        complex={{
          bar: 123,
          foo: ["array", 456],
        }}
        element={<div>Hi</div>}
        func={() => {}}
        nested={["nested", ["array", 456]]}
        nil={null}
        number={42}
        object={{
          foo: "bar",
          baz: false,
        }}
        string="hello"
        symbol={Symbol("foo")}
      />"
    `);
  });

  it("handles all kinds of children", async () => {
    const result = await jsxGenerator("MyComponent", {}, [
      "text",
      123,
      true,
      false,
      null,
      ["nested", ["array", 456]],
      { foo: "bar" },
      <div>Hello</div>,
      <span>World</span>,
      () => <em>JSX from function</em>,
      () => 99,
      <Show when={() => true}>Show</Show>,
    ]);

    expect(result).toMatchInlineSnapshot(`
      "<MyComponent>
        text{123}
        {true}
        {false}
        {null}
        {["nested", ["array", 456]]}
        {{
          foo: "bar",
        }}
        {{}}
        {{}}
        {() => {}}
        {() => {}}
        {() => {}}
      </MyComponent>"
    `);
  });
});
