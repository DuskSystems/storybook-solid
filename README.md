![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)
[![ci](https://github.com/DuskSystems/storybook-solid/actions/workflows/ci.yml/badge.svg)](https://github.com/DuskSystems/storybook-solid/actions/workflows/ci.yml)

# `@dusksystems/storybook-solid`

A forward-looking [SolidJS](https://www.solidjs.com) integration for [Storybook](https://storybook.js.org).

- [`@dusksystems/storybook-solid`](https://www.npmjs.com/package/@dusksystems/storybook-solid)
- [`@dusksystems/storybook-solid-vite`](https://www.npmjs.com/package/@dusksystems/storybook-solid-vite)

## Features

- Reactivity decorator for fine-grained updates of controlled state.
- Naive JSX source decorator powered by `recast`.
- Documentation powered by `react-docgen-typescript`.

## Caveats

- Storybook v9 only.
- CSF4 (CSF Factories) only.
- TypeScript only.
- No Storybook CLI integration.
- Limited configurability.
- Relies on unstable Storybook APIs.

## License

All libraries are licensed under the terms of the [MIT License](LICENSE).

## Inspirations / Thanks

- [storybook-solidjs](https://github.com/storybookjs/solidjs): Project started out as a fork of the upstream library.
- [KonghaYao](https://github.com/KonghaYao): [Suggesting usage of `react-docgen-typescript` for docgen](https://github.com/storybookjs/solidjs/issues/7).
