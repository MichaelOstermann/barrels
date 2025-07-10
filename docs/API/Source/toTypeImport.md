# toTypeImport

```ts
function Source.toTypeImport(source: Source): Source
```

Creates a copy of `source` that will be treated as a type declaration when creating barrel file contents.

## Example

```ts
import { Source, Barrel } from "@monstermann/barrels";

const sourceA = await Source.file("./source.ts");

// export * from "./source.ts";
Barrel.export(sourceA);

const sourceB = Source.toTypeImport(sourceA);

// export type * from "./source.ts";
Barrel.export(sourceB);
```
