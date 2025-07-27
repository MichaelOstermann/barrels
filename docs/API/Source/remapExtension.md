# remapExtension

```ts
function Source.remapExtension(
    source: Source,
    mapping: Record<string, string>
): Source
```

Creates a copy of `source` with its file extension modified.

## Example

```ts
import { Source, Barrel } from "@monstermann/barrels";

const sourceA = await Source.file("./source.ts");

// export * from "./source.ts"
Barrel.export(sourceA);

const sourceB = Source.remapExtension(sourceA, {
    ts: "js",
});

// export * from "./source.js";
Barrel.export(sourceB);
```
