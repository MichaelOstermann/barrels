# importName

```ts
function Source.importName(source: Source): string
```

Returns the name the given `source` should be imported as, either the alias set via [`Source.setAlias`](./setAlias), or the identifier used for named exports, otherwise an empty string for other sources.

## Example

```ts [source.ts]
export default true;
export const foo = true;
export * as bar from "…";
```

```ts
import { Source } from "@monstermann/barrels";

const source = await Source.file("./source.ts");
const exports = await Source.exports(source);

Source.importName(source); // ""
Source.importName(exports[0]); // ""
Source.importName(exports[1]); // "foo"
Source.importName(exports[2]); // "bar"
```
