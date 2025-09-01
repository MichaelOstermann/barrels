# removeExtension

```ts
function Source.removeExtension(source: Source): Source
```

Creates a copy of `source` with its extension removed.

## Example

```ts
import { Source } from "@monstermann/barrels";

const sourceA = await Source.file("./source.ts");

// export * from "./source.ts";
Source.toExport(sourceA);

const sourceB = Source.removeExtension(sourceA);

// export * from "./source";
Source.toExport(sourceB);
```
