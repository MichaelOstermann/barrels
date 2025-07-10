# property

```ts
function Barrel.property(options: {
    key: string
    value: string
}): string
```

Creates a `key: value,` string, used for record barrel files.

## Example

```ts
import { Barrel } from "@monstermann/barrels";

// foo: bar,
Barrel.property({ key: "foo", value: "bar" });

// foo,
Barrel.property({ key: "foo", value: "foo" });
```
