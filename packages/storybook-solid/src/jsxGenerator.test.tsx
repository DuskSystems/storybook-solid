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
        null: null,
        array: [1, 2, 3],
        nested: ["nested", ["array", 456]],
        object: { foo: "bar", baz: false },
        complex: { bar: 123, foo: ["array", 456] },
        function: function power(x: number) {
          return x * x;
        },
        arrow: (x: number) => x * 2,
        call: Math.max(1, 2),
        component: <div>Hi</div>,
        symbol: Symbol("foo"),
        big_number: BigInt(123456),
        solid: <Show when={() => true}>Inner Value</Show>,
      },
      null,
    );

    expect(result).toMatchInlineSnapshot(`
      "<MyComponent
        array={[1, 2, 3]}
        arrow={() => {}}
        big_number={123456n}
        boolTrue
        call={2}
        complex={{
          bar: 123,
          foo: ["array", 456],
        }}
        component={<div>Hi</div>}
        function={() => {}}
        nested={["nested", ["array", 456]]}
        number={42}
        object={{
          foo: "bar",
          baz: false,
        }}
        solid={() => {}}
        string="hello"
        symbol="Symbol(foo)"
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
