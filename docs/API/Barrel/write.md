# write

```ts
function Barrel.write(path: string, barrel: string): Promise<void>
```

Wrapper around `fs.writeFile` which:

- Trims `barrel` and ensures a trailing newline
- Aborts mission if `barrel` didn't change, helps prevent file watchers from going into infinite loops, including the ones present in modern bundlers
- Pretty prints to terminals
- Runs `mkdir` to create folders leading up to `path` as necessary
