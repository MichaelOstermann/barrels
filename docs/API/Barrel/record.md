# record

```ts
function Barrel.record(sources: Source[], options: {
    name: string
    indentation?: number
}): string
```

Takes a list of `sources` and creates record barrel file.

## Example

```ts
import { Source, Barrel } from "@monstermann/barrels";

const files = await Source.files("./utils/*.ts");

const exports = await Source.exports(files);

const result = sources
    .map((source) => Source.importFrom(source, "./utils/index.ts"))
    .map((source) => Source.removeExtension(source));

// import { foo } from "./foo";
// import { bar } from "./bar";
// import { baz } from "./baz";
//
// export const Foo = {
//     foo,
//     bar,
//     baz,
// }
Barrel.record(exports, { name: "Foo" });
```

## Options

### name

```ts
interface Options {
    name?: string;
}
```

Defines the name of the namespace. If omitted, the output file name will be used, or the output directory name if the file name was `index`.

### indentation

```ts
interface Options {
    indentation?: number;
}
```

Controls how many spaces to use for indenting, by default `4`.
