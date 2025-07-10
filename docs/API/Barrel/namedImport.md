# namedImport

```ts
function Barrel.namedImport(options: {
    type?: boolean
    name: string
    alias?: string
    path: string
}): string
```

Creates a named import string.

## Example

```ts
import { Barrel } from "@monstermann/barrels";

// import { foo } from "bar";
Barrel.namedImport({ name: "foo", path: "bar" });

// import { foo as baz } from "bar";
Barrel.namedImport({ name: "foo", path: "bar", alias: "baz" });

// import type { foo } from "bar";
Barrel.namedImport({ name: "foo", path: "bar", type: true });
```
