import { defineConfig } from "vitepress"
import { groupIconMdPlugin, groupIconVitePlugin } from "vitepress-plugin-group-icons"

export default defineConfig({
    base: "/barrels/",
    description: "Tools for creating barrel files.",
    title: "barrels",
    markdown: {
        theme: {
            dark: "catppuccin-macchiato",
            light: "github-light-default",
        },
        config(md) {
            md.use(groupIconMdPlugin)
        },
    },
    themeConfig: {
        aside: false,
        outline: "deep",
        docFooter: {
            next: false,
            prev: false,
        },
        search: {
            provider: "local",
        },
        sidebar: [
            {
                text: "API",
                items: [
                    {
                        base: "/API/",
                        link: "Guide",
                        text: "Guide",
                    },
                    {
                        base: "/API/Barrel/",
                        collapsed: true,
                        text: "Barrel",
                        items: [
                            { link: "banner", text: "banner" },
                            { link: "globFiles", text: "globFiles" },
                            { link: "globDirectories", text: "globDirectories" },
                            { link: "watch", text: "watch" },
                            { link: "write", text: "write" },
                            { link: "isWatching", text: "isWatching" },
                        ],
                    },
                    {
                        base: "/API/Source/",
                        collapsed: true,
                        text: "Source",
                        items: [
                            { link: "file", text: "file" },
                            { link: "exports", text: "exports" },
                            { link: "matches", text: "matches" },
                            { link: "setAlias", text: "setAlias" },
                            { link: "toExport", text: "toExport" },
                            { link: "toImport", text: "toImport" },
                            { link: "importFrom", text: "importFrom" },
                            { link: "importName", text: "importName" },
                            { link: "importPath", text: "importPath" },
                            { link: "remapExtension", text: "remapExtension" },
                            { link: "removeExtension", text: "removeExtension" },
                            { link: "resolveExtension", text: "resolveExtension" },
                            { link: "isType", text: "isType" },
                            { link: "asType", text: "asType" },
                            { link: "asValue", text: "asValue" },
                            { link: "walkAst", text: "walkAst" },
                        ],
                    },
                    {
                        base: "/API/Sources/",
                        collapsed: true,
                        text: "Sources",
                        items: [
                            { link: "files", text: "files" },
                            { link: "exports", text: "exports" },
                            { link: "exclude", text: "exclude" },
                            { link: "include", text: "include" },
                            { link: "filterNamed", text: "filterNamed" },
                            { link: "filterTypes", text: "filterTypes" },
                            { link: "filterValues", text: "filterValues" },
                            { link: "toExports", text: "toExports" },
                            { link: "toImports", text: "toImports" },
                            { link: "importFrom", text: "importFrom" },
                            { link: "importNames", text: "importNames" },
                            { link: "remapExtensions", text: "remapExtensions" },
                            { link: "removeExtensions", text: "removeExtensions" },
                            { link: "resolveExtensions", text: "resolveExtensions" },
                            { link: "asTypes", text: "asTypes" },
                            { link: "asValues", text: "asValues" },
                        ],
                    },
                    {
                        base: "/API/SourceModule/",
                        collapsed: true,
                        text: "SourceModule",
                        items: [
                            { link: "resolve", text: "resolve" },
                            { link: "exports", text: "exports" },
                            { link: "matches", text: "matches" },
                            { link: "walkAst", text: "walkAst" },
                        ],
                    },
                ],
            },
        ],
        socialLinks: [
            { icon: "github", link: "https://github.com/MichaelOstermann/barrels" },
        ],
    },
    vite: {
        plugins: [
            groupIconVitePlugin(),
        ],
    },
})
