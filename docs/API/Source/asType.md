# asType

```ts
function Source.asType(source: Source): Source
```

Creates a copy of `source`, marked as a type declaration.

## Example

```ts
import { Source } from "@monstermann/barrels";

const sourceA = await Source.file("./source.ts");

// export * from "./source.ts";
Source.toExport(sourceA);

const sourceB = Source.asType(sourceA);

// export type * from "./source.ts";
Source.toExport(sourceB);
```
