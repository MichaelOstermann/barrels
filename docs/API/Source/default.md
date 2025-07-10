# default

```ts
function Source.default(path: string, options?: {
    alias?: string
    type?: boolean
}): Promise<Source | undefined>
```

Constructs a new source representing a default export. May return `Promise<undefined>` if the physical location on disk could not be resolved via [`SourceModule.resolve`](../SourceModule/resolve).

## Example

```ts
import { Source, Barrel } from "@monstermann/barrels";

const source = await Source.default("./source.ts");

// export { default } from "./source.ts";
Barrel.export(source);
```

## Options

### alias

Defines the alias that should be used when creating barrels.

```ts
import { Source, Barrel } from "@monstermann/barrels";

const source = await Source.default("./source.ts", {
    alias: "bar",
});

// export { default as bar } from "./source.ts";
Barrel.export(source);
```

### type

When enabled, treats this source as a type definition.

```ts
import { Source, Barrel } from "@monstermann/barrels";

const source = await Source.default("./source.ts", {
    type: true,
});

// export type { default } from "./source.ts;"
Barrel.export(source);
```
