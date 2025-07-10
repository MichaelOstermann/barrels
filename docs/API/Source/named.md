# named

```ts
function Source.named(name: string, path: string, options?: {
    alias?: string
    type?: boolean
}): Promise<Source | undefined>
```

Constructs a new source representing a named export. May return `Promise<undefined>` if the physical location on disk could not be resolved via [`SourceModule.resolve`](../SourceModule/resolve).

## Example

```ts
import { Source, Barrel } from "@monstermann/barrels";

const source = await Source.named("foo", "./source.ts");

// export { foo } from "./source.ts";
Barrel.export(source);
```

## Options

### alias

Defines the alias that should be used when creating barrels.

```ts
import { Source, Barrel } from "@monstermann/barrels";

const source = await Source.named("foo", "./source.ts", {
    alias: "bar",
});

// export { foo as bar } from "./source.ts";
Barrel.export(source);
```

### type

When enabled, treats this source as a type definition.

```ts
import { Source, Barrel } from "@monstermann/barrels";

const source = await Source.named("foo", "source.ts", {
    type: true,
});

// export type { foo } from "./source.ts";
Barrel.export(source);
```
