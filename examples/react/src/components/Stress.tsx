import type { ReactNode } from "react";

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
  element: ReactNode;
  symbol: symbol;
  children: ReactNode;
}

export const Stress = ({
  string,
  number,
  boolTrue,
  boolFalse,
  nil,
  array,
  nested,
  object,
  complex,
  func,
  arrow,
  element,
  symbol,
  children,
}: StressProps) => {
  return (
    <div>
      <pre>
        {JSON.stringify({
          string,
          number,
          boolTrue,
          boolFalse,
          nil,
          array,
          nested,
          object,
          complex,
          func,
          arrow,
          element,
          symbol,
        })}
      </pre>

      <div>{children}</div>
    </div>
  );
};
