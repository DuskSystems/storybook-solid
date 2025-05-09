import { Show } from "solid-js";
import preview from "#.storybook/preview";
import { Stress } from "./Stress";

const meta = preview.meta({
  id: "stress-component",
  title: "Example/Stress",
  component: Stress,
  tags: ["autodocs"],
});

export const Example = meta.story({
  args: {
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
    children: [
      "text",
      123,
      true,
      false,
      null,
      ["nested", ["array", 456]],
      <div>Hello</div>,
      <span>World</span>,
      <Show when={() => true}>Show</Show>,
    ],
  },
});
