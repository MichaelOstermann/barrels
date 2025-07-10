# isWatching

```ts
function Barrel.isWatching(output: BarrelsOutput, path: string): boolean
```

Takes the result of `defineConfig([…])()` and checks whether the given `path` was marked with [`Barrel.watch`](./watch).

## Example

```ts
import { defineConfig, Barrel } from "@monstermann/barrels";

const createBarrels = defineConfig([
    () => {
        Barrel.watch("./src/*.ts");
    },
]);

const output = await createBarrels();

Barrel.isWatching(output, "./src/example.ts"); // true
```
