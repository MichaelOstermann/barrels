# filterNamed

```ts
function Sources.filterNamed(sources: Source[]): Source[]
```

Takes a list of sources and returns the ones that have an importable name, based on [`Source.importName`](../Source/importName).

Essentially this removes default exports (`export default …`) and wildcard exports (`export * from "…"`), while keeping any kind of named exports (`export foo …`, `export * as foo …`, etc.).
