import { defineConfig } from "vitepress"
import { groupIconMdPlugin, groupIconVitePlugin } from "vitepress-plugin-group-icons"

export default defineConfig({
    base: "/barrels/",
    description: "Tools for managing barrel files.",
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
                base: "/Config/",
                text: "Config",
                items: [
                    { link: "flat", text: "flat" },
                    { link: "namespace", text: "namespace" },
                    { link: "record", text: "record" },
                ],
            },
            {
                text: "API",
                items: [
                    {
                        base: "/API/",
                        link: "Guide",
                        text: "Guide",
                    },
                    {
                        base: "/API/Source/",
                        collapsed: true,
                        text: "Source",
                        items: [
                            { link: "file", text: "file" },
                            { link: "files", text: "files" },
                            { link: "default", text: "default" },
                            { link: "named", text: "named" },
                            { link: "wildcard", text: "wildcard" },
                            { link: "exports", text: "exports" },
                            { link: "matches", text: "matches" },
                            { link: "setImportAlias", text: "setImportAlias" },
                            { link: "remapExtension", text: "remapExtension" },
                            { link: "removeExtension", text: "removeExtension" },
                            { link: "importFrom", text: "importFrom" },
                            { link: "importName", text: "importName" },
                            { link: "importPath", text: "importPath" },
                            { link: "isTypeExport", text: "isTypeExport" },
                            { link: "isTypeImport", text: "isTypeImport" },
                            { link: "toTypeImport", text: "toTypeImport" },
                            { link: "walkAst", text: "walkAst" },
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
                    {
                        base: "/API/Barrel/",
                        collapsed: true,
                        text: "Barrel",
                        items: [
                            { link: "write", text: "write" },
                            { link: "watch", text: "watch" },
                            { link: "isWatching", text: "isWatching" },
                            { link: "export", text: "export" },
                            { link: "import", text: "import" },
                            { link: "flat", text: "flat" },
                            { link: "namespace", text: "namespace" },
                            { link: "record", text: "record" },
                            { link: "defaultExport", text: "defaultExport" },
                            { link: "defaultImport", text: "defaultImport" },
                            { link: "namedExport", text: "namedExport" },
                            { link: "namedImport", text: "namedImport" },
                            { link: "wildcardExport", text: "wildcardExport" },
                            { link: "wildcardImport", text: "wildcardImport" },
                            { link: "constExport", text: "constExport" },
                            { link: "property", text: "property" },
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
