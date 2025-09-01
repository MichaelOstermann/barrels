# resolveExtension

```ts
function Source.resolveExtension(source: Source): Source
```

Creates a copy of `source` with its extension automatically removed or modified, based on various `tsconfig` settings.

## Example

```ts
import { Source } from "@monstermann/barrels";

const sourceA = await Source.file("./source.ts");

// export * from "./source.ts";
Source.toExport(sourceA);

// tsconfig.compilerOptions.moduleResolution = "bundler"
const sourceB = Source.resolveExtension(sourceA);

// export * from "./source";
Source.toExport(sourceB);
```
