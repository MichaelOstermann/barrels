# exports

```ts
function Source.exports(source: Source): Promise<Source[]>
```

Takes a `source` and recursively extracts its export declarations.

## Example

```ts [source.ts]
export const foo = true;
export const bar = true;
```

```ts
import { Source, Sources } from "@monstermann/barrels";

const source = await Source.file("./source.ts");
const exports = await Source.exports(source);

// export * from "./source";
await Source.toExport(source);

// export { foo } from "./source";
// export { bar } from "./source";
await Sources.toExports(exports);
```
