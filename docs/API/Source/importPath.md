# importPath

```ts
function Source.importPath(source: Source): string
```

Returns the path the given `source` should be imported from, considering the location set via [`Source.importFrom`](./importFrom), modified extensions via [`Source.removeExtension`](./removeExtension) or [`Source.remapExtension`](./remapExtension), etc.

## Example

```ts
import { Source } from "@monstermann/barrels";

const sourceA = await Source.file("./src/utils/source.ts");
Source.importPath(sourceA); // "./src/utils/source.ts"

const sourceB = Source.importFrom(sourceA, "./src/index.ts");
Source.importPath(sourceB); // "./utils/source.ts"

const sourceC = Source.removeExtension(sourceB);
Source.importPath(sourceC); // "./utils/source"
```
