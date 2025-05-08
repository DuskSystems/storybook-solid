import type { JSX } from "solid-js";

export interface StressProps {
  string: string;
  number: number;
  boolTrue: boolean;
  boolFalse: boolean;
  nil: null;
  array: number[];
  nested: (string | (string | number)[])[];
  object: {
    foo: string;
    baz: boolean;
  };
  complex: {
    bar: number;
    foo: (string | number)[];
  };
  func: (x: number) => number;
  arrow: (x: number) => number;
  element: JSX.Element;
  symbol: symbol;
}

export const Stress = (props: StressProps) => {
  return (
    <div>
      <div>{props.element}</div>

      <pre>
        {JSON.stringify({
          string: props.string,
          number: props.number,
          boolTrue: props.boolTrue,
          boolFalse: props.boolFalse,
          nil: props.nil,
          array: props.array,
          nested: props.nested,
          object: props.object,
          complex: props.complex,
          func: props.func,
          arrow: props.arrow,
          symbol: props.symbol,
        })}
      </pre>
    </div>
  );
};
