# wildcard

```ts
function Source.wildcard(path: string, options?: {
    alias?: string
    type?: boolean
}): Promise<Source | undefined>
```

Constructs a new source representing a wildcard export. May return `Promise<undefined>` if the physical location on disk could not be resolved via [`SourceModule.resolve`](../SourceModule/resolve).

## Example

```ts
import { Source, Barrel } from "@monstermann/barrels";

const source = await Source.wildcard("./source.ts");

// export * from "./source.ts";
Barrel.export(source);
```

## Options

### alias

Defines the alias that should be used when creating barrels.

```ts
import { Source, Barrel } from "@monstermann/barrels";

const source = await Source.wildcard("source.ts", {
    alias: "bar",
});

// export * as bar from "./source.ts";
Barrel.export(source);
```

### type

When enabled, treats this source as a type definition.

```ts
import { Source, Barrel } from "@monstermann/barrels";

const source = await Source.wildcard("source.ts", {
    type: true,
});

// export type * from "./source.ts";
Barrel.export(source);
```
