# isType

```ts
function Source.isType(source: Source): boolean
```

Takes a `source` and returns a boolean indicating whether it represents a type declaration.

## Example

```ts [source.ts]
export type Foo = true;
```

```ts
import { Source } from "@monstermann/barrels";

const source = await Source.file("./source.ts");
const exports = await Source.exports(source);

Source.isType(exports[0]); // true
```
