# export

```ts
function Barrel.export(source: Source): string
```

Takes a `source` and returns an appropriate export string.

## Example

```ts
import { Source, Barrel } from "@monstermann/barrels";

// export * from "./source";
// export { default } from "./source";
// export { foo } from "./source";
// export * from "./source";
[
    await Source.file("./source.ts"),
    await Source.default("./source.ts"),
    await Source.named("foo", "./source.ts"),
    await Source.wildcard("./source.ts"),
]
    .map((source) => Source.importFrom("./index.ts"))
    .map((source) => Source.removeExtension(source));
    .map(source => Barrel.export(source))
    .join("\n")
```
