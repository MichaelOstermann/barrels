# isTypeExport

```ts
function Source.isTypeExport(source: Source): boolean
```

Takes a `source` and returns a boolean indicating whether it represents a type export.

## Example

```ts
import { Source } from "@monstermann/barrels";

const source = await Source.default("./source.ts", {
    type: true,
});

Source.isTypeExport(source); // true
```
