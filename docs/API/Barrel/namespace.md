# namespace

```ts
function Barrel.namespace(sources: Source[], options: {
    name: string
    indentation?: number
    types?: "merge" | "nested" | "flat"
}): string
```

Takes a list of `sources` and creates a TypeScript namespace barrel file.

## Example

```ts
import { Source, Barrel } from "@monstermann/barrels";

const files = await Source.files("./utils/*.ts");

const exports = await Source.exports(files);

const result = sources
    .map((source) => Source.importFrom(source, "./utils/index.ts"))
    .map((source) => Source.removeExtension(source));

// import { foo as _foo } from "./foo";
// import { bar as _bar } from "./bar";
// import { baz as _baz } from "./baz";
//
// export namespace Foo {
//     export const foo = _foo;
//     export const bar = _bar;
//     export const baz = _baz;
// }
Barrel.namespace(exports, { name: "Foo" });
```

## Options

### name

```ts
interface Options {
    name?: string;
}
```

Defines the name of the namespace. If omitted, the output file name will be used, or the output directory name if the file name was `index`.

### type

```ts
interface Options {
    types?: "merge" | "nested" | "flat";
}
```

This defines how type definitions should be handled, `flat` by default.

#### nested

Using this option will result with all type exports being included in the namespace.

```ts
import type { Foo as _Foo } from "./foo";
import type { Bar as _Bar } from "./bar";
import type { Baz as _Baz } from "./baz";

export namespace Foo {
    export type Foo = _Foo;
    export type Bar = _Bar;
    export type Baz = _Baz;
}
```

#### flat

Using this option will result with all type exports being re-exported as-is, including only values in the namespace.

```ts
export type { Foo } from "./foo";
export type { Bar } from "./bar";
export type { Baz } from "./baz";

export namespace Foo {}
```

While this might look like a conflict, TypeScript is smart in figuring out whether `Foo` is the type definition or the namespace, depending on your usage.

#### merge

A mixture between `nested` and `flat` - Using this option will result with type exports that have the same name as the namespace being re-exported as-is, and all others are included in the namespace.

```ts
export type { Foo } from "./foo";
import type { Bar as _Bar } from "./bar";
import type { Baz as _Baz } from "./baz";

export namespace Foo {
    export type Bar = _Bar;
    export type Baz = _Baz;
}
```

While this might look like a conflict, TypeScript is smart in figuring out whether `Foo` is the type definition or the namespace, depending on your usage.

### indentation

```ts
interface Options {
    indentation?: number;
}
```

Controls how many spaces to use for indenting, by default `4`.
