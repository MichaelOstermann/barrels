<div align="center">

<h1>barrels</h1>

**Generates namespace and flat barrel files.**

</div>

## Installation

```sh
bun add -D @monstermann/barrels
```

## Usage

```ts [barrels.config.ts]
import { defineConfig, flat, namespace } from "@monstermann/barrels";

export default defineConfig([
    namespace({
        entries: "./src/Rect",
    }),
    flat({
        entries: "./src",
        include: ["*", "Rect/index.js"],
    }),
]);
```

```sh
bunx barrels
bunx barrels --config ./barrels.config.ts
```

Configs run one after another, so a barrel can pick up the barrels created before it. Files are only written when their contents changed.

## Options

`namespace` and `flat` take the same options:

| Option    | Default             | Description                                       |
| --------- | ------------------- | ------------------------------------------------- |
| `entries` | `process.cwd()`     | Glob(s) to the directories to create barrels in.  |
| `include` | `["*.ts", "*.tsx"]` | Glob(s) to collect files, relative to each entry. |
| `exclude` |                     | Glob(s) to skip files, relative to each entry.    |

## namespace

Creates an `index.js` and `index.d.ts` in each entry, exporting everything the collected files export as an object named after the directory:

```ts [src/Rect/index.js]
import { area } from "./area.js";
import { create } from "./create.js";

export const Rect = {
    area,
    create,
};
```

```ts [src/Rect/index.d.ts]
import { area } from "./area.js";
import { create } from "./create.js";

type Rect = {
    height: number;
    width: number;
};

declare namespace Rect {
    export { area, create };
}

export { Rect };
```

- Exported types are re-exported next to the namespace.
- A type with the same name as the namespace (`Rect` above) can not be imported into the declaration, the types of its file are copied into it instead, together with the imports they need.
- `export * from "./foo"` is followed for relative paths, the names of `export * from "package"` are not collected.
- Default exports are skipped.

Use [`@monstermann/barrels-treeshake`](../barrels-treeshake) to turn `Rect.area()` into a direct import of `area`.

## flat

Creates an `index.ts` in each entry, re-exporting everything from the collected files:

```ts [src/index.ts]
export * from "./Rect/index";
export * from "./types";
```

Import paths are written without extension, which expects `"moduleResolution": "bundler"`.
