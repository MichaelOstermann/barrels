# toImport

```ts
function Source.toImport(source: Source): string
```

Takes a `source` and returns an appropriate import string.

## Example

```ts [source.ts]
export const foo = true;
export const bar = true;
```

```ts
import { Source } from "@monstermann/barrels";

const source = await Source.file("./source.ts");
const exports = await Source.exports(source);

// import { foo } from "./source";
Source.toImport(exports[0]);
// import { bar } from "./source";
Source.toImport(exports[1]);
```
