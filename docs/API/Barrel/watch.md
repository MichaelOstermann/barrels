# watch

```ts
function Barrel.watch(patterns: string | string[], basePath?: string): void
```

This records the given paths or glob patterns while creating barrel files, used to track dependencies and rebuild barrels only when necessary.

The library itself does not come with an integrated file watcher (the CLI does), instead it collects which file paths/globs have been accessed, so you can integrate this with other tools that already come with file watchers, such as most modern bundlers.

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
