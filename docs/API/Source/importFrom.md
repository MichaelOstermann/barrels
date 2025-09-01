# importFrom

```ts
function Source.importFrom(source: Source, filePath: string): Source
```

Creates a copy of `source` with its path updated so it can be imported from `filePath`, which should be the path of the barrel file.

## Example

```ts
import { Source } from "@monstermann/barrels";

// We want to create a barrel file at this location:
const destination = "./src/index.ts";

// The original file on disk that we want to re-export:
const sourceA = await Source.file("./src/utils/source.ts");

// Creating a barrel file at `destination` does not work:
// export * from "./src/utils/source.ts";
Source.toExport(sourceA);

// We have to move our source relative to `destination`:
const sourceB = Source.importFrom(sourceA, destination);

// Which results with the correct path being used:
// export * from "./utils/source.ts";
Source.toExport(sourceB);
```
