# isTypeImport

```ts
function Source.isTypeImport(source: Source): boolean
```

Takes a `source` and returns a boolean indicating whether it should be treated as type declaration when creating barrel file contents.

## Example

```ts
import { Source } from "@monstermann/barrels";

const sourceA = await Source.default("./source.ts", {
    type: true,
});

Source.isTypeImport(sourceA); // true

const sourceB = await Source.default("./source.ts");

Source.isTypeImport(sourceB); // false

const sourceC = Source.toTypeImport(sourceB);

Source.isTypeImport(sourceC); // true
```
