# constExport

```ts
function Barrel.constExport(options: {
    type?: boolean
    name: string
    value: string
}): string
```

Creates a `export name = value;` string, used for TypeScript namespace barrel files.

## Example

```ts
import { Barrel } from "@monstermann/barrels";

// export const foo = bar;
Barrel.constExport({ name: "foo", value: "bar" });

// export type foo = bar;
Barrel.constExport({ name: "foo", value: "bar", type: true });
```
