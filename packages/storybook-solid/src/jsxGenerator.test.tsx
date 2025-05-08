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
        function: (x: number) => x * 2,
        call: Math.max(1, 2),
        component: <div>Hi</div>,
      },
      null,
    );

    expect(result).toMatchInlineSnapshot(`
      "<MyComponent
        array={[1, 2, 3]}
        boolTrue
        call={2}
        complex={{
          bar: 123,
          foo: ["array", 456],
        }}
        component={{}}
        function={() => {}}
        nested={["nested", ["array", 456]]}
        null={null}
        number={42}
        object={{
          foo: "bar",
          baz: false,
        }}
        string="hello"
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
