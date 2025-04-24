// biome-ignore-all lint/suspicious/noExplicitAny: Copied from React integration.
// biome-ignore-all lint/complexity/noBannedTypes: Copied from React integration.

import type {
  DecoratorFunction,
  StoryContext as GenericStoryContext,
  LoaderFunction,
  ProjectAnnotations,
  StrictArgs,
} from "storybook/internal/types";
import type { Simplify } from "type-fest";
import type { SolidRenderer } from "./types";

export type { Args, ArgTypes, Parameters, StrictArgs } from "storybook/internal/types";
export type { SolidRenderer };

export type AddMocks<TArgs, DefaultArgs> = Simplify<{
  [T in keyof TArgs]: T extends keyof DefaultArgs
    ? DefaultArgs[T] extends (...args: any) => any & { mock: {} }
      ? DefaultArgs[T]
      : TArgs[T]
    : TArgs[T];
}>;

export type Decorator<TArgs = StrictArgs> = DecoratorFunction<SolidRenderer, TArgs>;
export type Loader<TArgs = StrictArgs> = LoaderFunction<SolidRenderer, TArgs>;
export type StoryContext<TArgs = StrictArgs> = GenericStoryContext<SolidRenderer, TArgs>;
export type Preview = ProjectAnnotations<SolidRenderer>;
