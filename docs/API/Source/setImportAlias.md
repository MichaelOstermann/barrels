# setImportAlias

```ts
function Source.setImportAlias(source: Source, alias: string): Source;
```

Creates a copy of `source` with an import alias that will be considered when creating barrel file contents.

## Example

```ts
import { Source, Barrel } from "@monstermann/barrels";

const sourceA = await Source.file("./source.ts");

// export * from "./source.ts";
Barrel.export(sourceA);

const sourceB = Source.setImportAlias(sourceA, "foo");

// export * as foo from "./source.ts";
Barrel.export(sourceB);
```
