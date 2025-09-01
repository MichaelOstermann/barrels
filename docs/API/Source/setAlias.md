# setAlias

```ts
function Source.setAlias(source: Source, alias: string): Source;
```

Creates a copy of `source` with an import alias that should be considered when creating barrel file contents.

## Example

```ts
import { Source } from "@monstermann/barrels";

const sourceA = await Source.file("./source.ts");

// export * from "./source.ts";
Source.toExport(sourceA);

const sourceB = Source.setAlias(sourceA, "foo");

// export * as foo from "./source.ts";
Source.toExport(sourceB);
```
