# file

```ts
function Source.file(path: string, options?: {
    alias?: string
    type?: boolean
}): Promise<Source | undefined>
```

Constructs a new source representing a file on disk. May return `Promise<undefined>` if the physical location on disk could not be resolved via [`SourceModule.resolve`](../SourceModule/resolve).

## Example

```ts
import { Source } from "@monstermann/barrels";

const source = await Source.file("./source.ts");

// export * from "./source.ts"
Source.toExport(source);
```

## Options

### alias

Defines the alias that should be used when creating barrels.

```ts
import { Source } from "@monstermann/barrels";

const source = await Source.file("source.ts", {
    alias: "bar",
});

// export * as bar from "./source.ts";
Source.toExport(source);
```

### type

When enabled, treats this source as a type definition.

```ts
import { Source } from "@monstermann/barrels";

const source = await Source.file("source.ts", {
    type: true,
});

// export type * from "./source.ts";
Source.toExport(source);
```
