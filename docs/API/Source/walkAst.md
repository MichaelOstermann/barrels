# walkAst

```ts
function Source.walkAst(source: Source, options: {
    enter: (node: Node) => void | Promise<void>
    leave: (node: Node) => void | Promise<void>
}): Promise<void>
```

Takes a `Source`, reads its file contents, parses it to an AST via [`oxc-parser`](https://oxc.rs/docs/guide/usage/parser.html) and finally allows you to walk through it via [`oxc-walker`](https://github.com/oxc-project/oxc-walker). This is what is used to collect export declarations.

## Example

```ts
import { Source } from "@monstermann/barrels";

const source = await Source.file("./source.ts");

await Source.walkAst(source, {
    enter(node) {
        console.log("Entering node:", node);
    },
    leave(node) {
        console.log("Leaving node:", node);
    },
});
```
