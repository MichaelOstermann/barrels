# import

```ts
function Barrel.import(source: Source): string
```

Takes a `source` and returns an appropriate import string.

## Example

```ts
import { Source, Barrel } from "@monstermann/barrels";

// import * as foo from "./source";
// import foo from "./source";
// import { foo } from "./source";
// import * as foo from "./source";
[
    await Source.file("./source.ts", { alias: "foo" }),
    await Source.default("./source.ts", { alias: "foo" }),
    await Source.named("foo", "./source.ts"),
    await Source.wildcard("./source.ts", { alias: "foo" }),
]
    .map((source) => Source.importFrom("./index.ts"))
    .map((source) => Source.removeExtension(source));
    .map(source => Barrel.import(source))
    .join("\n")
```
