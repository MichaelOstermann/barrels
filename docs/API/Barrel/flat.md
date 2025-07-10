# flat

```ts
function Barrel.flat(sources: Source[]): string
```

Takes a list of `sources` and creates a classic barrel file, with all sources re-exported as-is, flattening a list of modules into one file.

## Example

```ts
import { Source, Barrel } from "@monstermann/barrels";

const sources = await Source.files("./utils/*.ts");

const result = sources
    .map((source) => Source.importFrom(source, "./utils/index.ts"))
    .map((source) => Source.removeExtension(source));

// export * from "./foo";
// export * from "./bar";
// export * from "./baz";
Barrel.flat(result);
```
