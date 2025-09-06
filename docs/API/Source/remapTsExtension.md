# remapTsExtension

```ts
function Source.remapTsExtension(source: Source): Source
```

Creates a copy of `source` with common `.ts` file extensions remapped to `.js`.

## Example

```ts
import { Source } from "@monstermann/barrels";

const sourceA = await Source.file("./source.tsx");

// export * from "./source.tsx"
Source.toExport(sourceA);

const sourceB = Source.remapTsExtension(sourceA);

// export * from "./source.jsx";
Source.toExport(sourceB);
```
