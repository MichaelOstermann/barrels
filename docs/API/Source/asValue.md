# asValue

```ts
function Source.asValue(source: Source): Source
```

Creates a copy of `source` which is treated as a value, instead of a type declaration.

## Example

```ts
import { Source } from "@monstermann/barrels";

const sourceA = await Source.file("./source.ts");

// export type * from "./source.ts";
Source.toExport(sourceA);

const sourceB = Source.asValue(sourceA);

// export * from "./source.ts";
Source.toExport(sourceB);
```
