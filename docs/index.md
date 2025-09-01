---
aside: true
---

# barrels

**Tools for creating barrel files.**

## Features

This library exposes a set of utility functions which:

- Collect files and directories
- Extract export declarations from files using the [Oxidation Compiler](https://oxc.rs/) toolchain
    - Supports all export declaration types
    - Supports detecting type declarations
    - Supports detection and handling of external dependencies and built-ins
    - Supports various tsconfig settings: `paths`, `references`, `moduleResolution`, `allowImportingTsExtensions`
    - Supports monorepo setups
- Handle file extensions
    - Manually remove or remap extensions
    - Automatic handling by considering tsconfig settings
- Convert sources to export/import declarations
- [CLI](#cli)
    - Create barrels via a classic config file (`barrels.config.*`)
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
    () => {
        // See API/Guide for how to create barrel files,
        // or use one of the presets further below!
    },
]);
```

## Usage

::: code-group

```sh [npm]
npx barrels
npx barrels --watch
npx barrels --help
```

```sh [pnpm]
pnpm exec barrels
pnpm exec barrels --watch
pnpm exec barrels --help
```

```sh [yarn]
yarn barrels
yarn barrels --watch
yarn barrels --help
```

```sh [bun]
bun run barrels
bun run barrels --watch
bun run barrels --help
```

:::

## barrels-flat

This preset collects files and creates classic flat barrels, for example:

```ts
export * from "./foo";
export * from "./bar";
```

### Installation

::: code-group

```sh [npm]
npm install -D @monstermann/barrels-flat
```

```sh [pnpm]
pnpm add -D @monstermann/barrels-flat
```

```sh [yarn]
yarn add -D @monstermann/barrels-flat
```

```sh [bun]
bun add -D @monstermann/barrels-flat
```

:::

### Setup

<!-- prettier-ignore -->
```ts [barrels.config.ts]
import { defineConfig } from "@monstermann/barrels";
import { flat } from "@monstermann/barrels-flat";

export default defineConfig([
    flat(options)
]);
```

```ts [Options]
interface FlatBarrelConfig {
    // Glob(s) to directories to create barrel files in.
    // Default: process.cwd()
    entries?: string | string[];
    // Glob(s) to collect files, relative to each entry.
    // Default: *.ts
    include?:
        | string
        | string[]
        | ((ctx: { entry: string; outDir: string }) => string | string[]);
    // Glob(s) or RegExp(s) to exclude matched files.
    // Default: undefined
    exclude?: string | string[] | RegExp | RegExp[];
    // The directory where the barrel files should be created.
    // Will be resolved against the current entry.
    // Default: entry
    outDir?: string | ((ctx: { entry: string }) => string);
    // The file name used to create the barrel file within `outDir`.
    // Default: index.ts
    outFile?: string | ((ctx: { entry: string; outDir: string }) => string);
}
```

## barrels-namespace

This preset collects files and creates TypeScript namespace barrels, for example:

::: code-group

```ts [example.d.ts]
import { foo } from "./foo.js";
import { bar } from "./bar.js";

declare namespace Example {
    export { foo, bar };
}

export { Example };
```

```ts [example.js]
import { foo } from "./foo.js";
import { bar } from "./bar.js";

export const Example = {
    foo,
    bar,
};
```

:::

### Installation

::: code-group

```sh [npm]
npm install -D @monstermann/barrels-namespace
```

```sh [pnpm]
pnpm add -D @monstermann/barrels-namespace
```

```sh [yarn]
yarn add -D @monstermann/barrels-namespace
```

```sh [bun]
bun add -D @monstermann/barrels-namespace
```

:::

### Setup

<!-- prettier-ignore -->
```ts [barrels.config.ts]
import { defineConfig } from "@monstermann/barrels";
import { namespace } from "@monstermann/barrels-namespace";

export default defineConfig([
    namespace(options)
]);
```

```ts [Options]
interface NamespaceBarrelConfig {
    // Glob(s) to directories to create barrel files in.
    // Default: process.cwd()
    entries?: string | string[];
    // Glob(s) to collect files, relative to each entry.
    // Default: *.ts
    include?:
        | string
        | string[]
        | ((ctx: {
              entry: string;
              outDir: string;
              title: string;
          }) => string | string[]);
    // Glob(s) or RegExp(s) to exclude matched files.
    // Default: undefined
    exclude?: string | string[] | RegExp | RegExp[];
    // The title of the namespace.
    // Default: Path.basename(entry)
    title?: string | ((ctx: { entry: string }) => string);
    // The directory where the barrel files should be created.
    // Will be resolved against the current entry.
    // Default: entry
    outDir?: string | ((ctx: { entry: string; title: string }) => string);
    // The name without extension that should be used to
    // create the `.d.ts` and `.js` files.
    // Default: outDir === entry ? "index" : title
    outName?:
        | string
        | ((ctx: { entry: string; outDir: string; title: string }) => string);
}
```

### Tree-shaking

If you would like to use the benefits of eg. TypeScript namespace barrels without losing tree-shaking, you can give [`tree-shake-import-namespaces`](https://michaelostermann.github.io/tree-shake-import-namespaces/) a try!

## Credits

- [bencoveney/barrelsby](https://github.com/bencoveney/barrelsby)
