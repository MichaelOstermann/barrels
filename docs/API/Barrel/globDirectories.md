# globDirectories

```ts
function Barrel.globDirectories(
    pattern: string | string[] | undefined,
    options?: GlobOptions
): Promise<string[]>
```

Takes glob patterns and returns a list of directories as absolute paths, `options` are forwarded to [`tinyglobby`](https://github.com/SuperchupuDev/tinyglobby?tab=readme-ov-file#options).

Returns `[process.cwd()]` if empty.

## Example

```ts
import { Barrel } from "@monstermann/barrels";

const directoryPaths = await Barrel.globDirectories("./packages/*");
```
