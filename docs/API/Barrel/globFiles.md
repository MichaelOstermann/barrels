# globFiles

```ts
function Barrel.globFiles(
    pattern: string | string[] | undefined,
    options?: GlobOptions
): Promise<string[]>
```

Takes glob patterns and returns a list of files as absolute paths, `options` are forwarded to [`tinyglobby`](https://github.com/SuperchupuDev/tinyglobby?tab=readme-ov-file#options).

The result can be passed to [`Source.file`](../Source/file) or [`Source.files`](../Sources/files) to start creating barrel files.

## Example

```ts
import { Barrel } from "@monstermann/barrels";

const filePaths = await Barrel.globFiles("*.ts");
```
