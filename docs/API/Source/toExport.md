# toExport

```ts
function Source.toExport(source: Source): string
```

Takes a `source` and returns an appropriate export string.

## Example

```ts [source.ts]
export const foo = true;
export const bar = true;
```

```ts
import { Source } from "@monstermann/barrels";

const source = await Source.file("./source.ts");
const exports = await Source.exports(source);

// export { foo } from "./source";
Source.toExport(exports[0]);
// export { bar } from "./source";
Source.toExport(exports[1]);
```
