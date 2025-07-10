# importName

```ts
function Source.importName(source: Source): string
```

Returns the name the given `source` should be imported as, either the alias set via [`Source.setImportAlias`](./setImportAlias), or the identifier used for named exports, otherwise an empty string for other sources.

## Example

```ts
import { Source } from "@monstermann/barrels";

const sourceA = await Source.file("./source.ts");
Source.importName(sourceA); // ""

const sourceB = Source.setImportAlias(sourceA, "foo");
Source.importName(sourceB); // "foo"

const sourceC = await Source.named("foo", "./source.ts");
Source.importName(sourceC); // "foo"
```
