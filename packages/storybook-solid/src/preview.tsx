// biome-ignore-all lint/suspicious/noExplicitAny: Copied from React integration.
// biome-ignore-all lint/complexity/noBannedTypes: Copied from React integration.

import type { Component as ComponentType } from "solid-js";
import type { Meta, Preview, Story } from "storybook/internal/csf";
import type {
  Args,
  ArgsStoryFn,
  ComponentAnnotations,
  DecoratorFunction,
  Renderer,
  StoryAnnotations,
} from "storybook/internal/types";
import type { OmitIndexSignature, SetOptional, Simplify, UnionToIntersection } from "type-fest";
import { __definePreview as definePreviewBase } from "./csf4";
import * as solidAnnotations from "./entry-preview";
import * as solidDocsAnnotations from "./entry-preview-docs";
import type { AddMocks } from "./public-types";
import type { SolidRenderer } from "./types";

export function __definePreview(preview: SolidPreview["input"]) {
  return definePreviewBase({
    ...preview,
    // @ts-expect-error: Copied from React integration.
    addons: [solidAnnotations, solidDocsAnnotations, ...(preview.addons ?? [])],
  }) as SolidPreview;
}

export interface SolidPreview extends Preview<SolidRenderer> {
  meta<TArgs extends Args, Decorators extends DecoratorFunction<SolidRenderer, any>, TMetaArgs extends Partial<TArgs>>(
    meta: {
      render?: ArgsStoryFn<SolidRenderer, TArgs>;
      component?: ComponentType<TArgs>;
      decorators?: Decorators | Decorators[];
      args?: TMetaArgs;
    } & Omit<ComponentAnnotations<SolidRenderer, TArgs>, "decorators">,
  ): SolidMeta<
    {
      args: Simplify<TArgs & Simplify<OmitIndexSignature<DecoratorsArgs<SolidRenderer, Decorators>>>>;
    },
    { args: Partial<TArgs> extends TMetaArgs ? {} : TMetaArgs }
  >;
}

type DecoratorsArgs<TRenderer extends Renderer, Decorators> = UnionToIntersection<
  Decorators extends DecoratorFunction<TRenderer, infer TArgs> ? TArgs : unknown
>;

interface SolidMeta<Context extends { args: Args }, MetaInput extends ComponentAnnotations<SolidRenderer>>
  extends Meta<SolidRenderer, Context["args"]> {
  story<
    TInput extends StoryAnnotations<SolidRenderer, Context["args"]> & {
      render: () => SolidRenderer["storyResult"];
    },
  >(story: TInput): SolidStory;

  story<
    TInput extends Simplify<
      StoryAnnotations<
        SolidRenderer,
        AddMocks<Context["args"], MetaInput["args"]>,
        SetOptional<Context["args"], keyof Context["args"] & keyof MetaInput["args"]>
      >
    >,
  >(story: TInput): SolidStory;
}

export interface SolidStory extends Story<SolidRenderer> {}
