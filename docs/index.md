---
aside: true
---

# barrels

**Tools for managing barrel files.**

An extensive set of tools to create and maintain all kinds of barrel files, for example:

::: code-group

```ts [Classic]
export * from "./foo";
export * from "./bar";
export * from "./baz";
```

```ts [Namespace]
import { foo as _foo } from "./foo";
import { bar as _bar } from "./bar";
import { baz as _baz } from "./baz";

export namespace Foo {
    export const foo = _foo;
    export const bar = _bar;
    export const baz = _baz;
}
```

```ts [Tree-shakeble Namespace]
// barrel.ts
export * from "./foo";
export * from "./bar";
export * from "./baz";

// index.ts
// Typically bundlers are capable of tree-shaking this:
export * as Foo from "./barrel";
```

```ts [Record]
import { foo } from "./foo";
import { bar } from "./bar";
import { baz } from "./baz";

export const Foo = {
    foo,
    bar,
    baz,
};
```

```jsonc [JSON]
{
    "foo": [
        {
            "exportName": "foo",
            "exportType": "named",
            "isTypeDeclaration": false,
            "isExternalDependency": false,
        },
    ],
    "bar": [
        {
            "exportName": "bar",
            "exportType": "named",
            "isTypeDeclaration": false,
            "isExternalDependency": false,
        },
    ],
    "baz": [
        {
            "exportName": "baz",
            "exportType": "named",
            "isTypeDeclaration": false,
            "isExternalDependency": false,
        },
    ],
}
```

:::

## Features

- Simple to use presets with sensible defaults
- Grouped and sorted barrel contents with linting/formatting ignore directives
- Uses the [Oxidation Compiler](https://oxc.rs/) toolchain
    - Extract exported values and type declarations from files
    - Recursive export resolution for re-exports
    - External dependency detection and filtering
    - Supports tsconfig settings: `paths`, `references`, `moduleResolution`, `allowImportingTsExtensions`
    - Supports monorepo setups
- Deep customization
    - Filter out specific files or exports, eg. external dependencies or type declarations
    - Manually add references to files and export declarations
    - Manually remap or remove extensions
    - Re-alias exported identifiers
    - Explicitly re-export as type declarations
    - Collect your own sources, build your own barrels via an [API](./API/Guide) comprised of simple & optional utility functions
- [CLI](#cli)
    - Create barrels via a classic config file (`barrels.config.*`)
    - Create barrels via CLI options
    - Queue-based watch mode to keep things up to date
    - Config hot-reloading in watch mode
    - Gitignore integration
    - Infinite loop prevention when barrel files are modified
    - Pretty output with bordered visualization of generated barrel contents

## Installation

::: code-group

```sh [npm]
npm install -D @monstermann/barrels
```

```sh [pnpm]
pnpm add -D @monstermann/barrels
```

```sh [yarn]
yarn add -D @monstermann/barrels
```

```sh [bun]
bun add -D @monstermann/barrels
```

:::

## Setup

```ts [barrels.config.ts]
import { defineConfig } from "@monstermann/barrels";

export default defineConfig([
    {
        type: "flat",
        directories: "./src/utils/*",
        files: "*.ts",
    },
]);
```

### Usage

::: code-group

```sh [npm]
npx barrels
npx barrels --watch
```

```sh [pnpm]
pnpm exec barrels
pnpm exec barrels --watch
```

```sh [yarn]
yarn barrels
yarn barrels --watch
```

```sh [bun]
bun run barrels
bun run barrels --watch
```

:::

## CLI

### run

This is the default command, it will look for a `barrels.config.*` or `barrels.*` file as shown above and run it for you.

```sh
USAGE:
  barrels run <OPTIONS>

OPTIONS:
  -h, --help            Display this help message
  -v, --version         Display this version
  -c, --config <config> Use the specified config file (default: barrels.config.*, barrels.*)
  -w, --watch           Keep barrels up-to-date (default: false)
```

### create

If you have a simple setup, you can use this command to create barrels instead of using a config file.

The options reflect the [`flat`](./Config/flat), [`namespace`](./Config/namespace) and [`record`](./Config/record) config counterparts.

```sh
USAGE:
  barrels create <OPTIONS>

OPTIONS:
  -h, --help                      Display this help message
  -v, --version                   Display this version
  -b, --banner <banner>           Custom banner text
  -d, --directories <directories> Paths or globs to directories (default: $PWD)
  -e, --exclude <exclude>         Glob patterns to filter files
  -X, --extensions [extensions]   Extension handling: auto, remove, or ts:js,tsx:jsx,… (default: auto)
  -f, --files <files>             Paths or globs to include files from
  -i, --include <include>         Glob patterns to filter files
  -I, --indentation [indentation] Indentation spaces (default: 4)
  -n, --name <name>               Name for namespace/record barrels
  -o, --output <output>           Output file path (default: index.ts)
  -r, --resolve-exports           Extract individual exports instead of wildcards
  --no-resolve-exports            Negatable of -r, --resolve-exports
  -t, --type [type]               Barrel type: flat, namespace, or record (default: flat)
  -T, --types [types]             Type handling for namespace barrels: merge, nested, flat (default: flat)
  -w, --watch                     Keep barrels up-to-date (default: false)
```

## Tips

### Tree-shaking

If you would like to use the benefits of eg. TypeScript namespace barrels without losing tree-shaking, you can give [`tree-shake-import-namespaces`](https://michaelostermann.github.io/tree-shake-import-namespaces/) a try!

## Credits

- [bencoveney/barrelsby](https://github.com/bencoveney/barrelsby)
