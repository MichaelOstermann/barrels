import type { Source, SourceExport } from "@monstermann/barrels"
import type { ImportDeclaration, ImportDeclarationSpecifier, Node, TSInterfaceDeclaration, TSTypeAliasDeclaration } from "oxc-parser"
import Fs from "node:fs/promises"
import { SourceModule } from "@monstermann/barrels"
import { parseAndWalk, walk } from "oxc-walker"

export async function embeds(sources: Source[]): Promise<{ contents: string[], imports: Source[] }> {
    let imports: Source[] = []
    let contents: string[] = []

    for (const source of sources) {
        const result = await embed(source)
        imports = imports.concat(result.imports)
        contents = contents.concat(result.contents)
    }

    return {
        contents,
        imports,
    }
}

async function embed(source: Source): Promise<{ contents: string[], imports: Source[] }> {
    const code = await Fs.readFile(source.module.filePath, "utf8")

    const importNodes = new Set<ImportDeclaration>()
    const typeNodes = new Set<TSTypeAliasDeclaration | TSInterfaceDeclaration>()

    parseAndWalk(code, source.module.filePath, {
        enter(node) {
            if (node.type === "TSTypeAliasDeclaration" || node.type === "TSInterfaceDeclaration") {
                typeNodes.add(node)
            }

            else if (node.type === "ImportDeclaration") {
                for (const specifier of node.specifiers) {
                    importNodes.add({ ...node, specifiers: [specifier] })
                }
            }
        },
    })

    removeUnusedImports(importNodes, typeNodes)

    const imports = await collectImports(importNodes, source)
    const contents = collectContents(typeNodes, code)

    return { contents, imports }
}

function removeUnusedImports(
    importNodes: Set<ImportDeclaration>,
    typeNodes: Set<TSTypeAliasDeclaration | TSInterfaceDeclaration>,
): void {
    const references = new Set<string>()

    for (const node of typeNodes) {
        walk(node, {
            enter(node) {
                if (node.type === "Identifier") references.add(node.name)
            },
        })
    }

    for (const node of importNodes) {
        let hasBinding = false
        walk(node, {
            enter(node) {
                if (node.type === "Identifier") hasBinding ||= references.has(node.name)
            },
        })
        if (!hasBinding) importNodes.delete(node)
    }
}

function collectContents(nodes: Set<Node>, code: string): string[] {
    return Array
        .from(nodes)
        .map(node => code.slice(node.start, node.end))
}

async function collectImports(importNodes: Set<ImportDeclaration>, source: Source): Promise<Source[]> {
    const imports: Source[] = []
    for (const node of importNodes) {
        const module = await SourceModule.resolve(node.source.value, source.module.filePath)
            ?? verbatimModule(node.source.value, source.module)
        for (const specifier of node.specifiers) {
            imports.push({
                alias: getAlias(specifier),
                dirPath: module.dirPath,
                export: getExport(specifier),
                extName: module.extName,
                isType: node.importKind === "type",
                module,
            })
        }
    }
    return imports
}

function verbatimModule(specifier: string, from: SourceModule): SourceModule {
    return {
        allowImportingTsExtensions: from.allowImportingTsExtensions,
        dirPath: "",
        extName: "",
        fileName: specifier,
        filePath: specifier,
        isExternal: true,
        moduleResolution: from.moduleResolution,
        tsconfigPath: from.tsconfigPath,
    }
}

function getAlias(node: ImportDeclarationSpecifier): string {
    if (node.type === "ImportSpecifier") {
        if (node.imported.type !== "Identifier") return node.local.name
        return node.imported.name === node.local.name ? "" : node.local.name
    }
    return node.local.name
}

function getExport(node: ImportDeclarationSpecifier): SourceExport | undefined {
    if (node.type === "ImportDefaultSpecifier") {
        return {
            identifier: "",
            isType: false,
            type: "Default",
        }
    }

    if (node.type === "ImportNamespaceSpecifier") {
        return {
            identifier: node.local.name,
            isType: false,
            type: "Wildcard",
        }
    }

    if (node.imported.type !== "Identifier") return

    return {
        identifier: node.imported.name,
        isType: false,
        type: "Named",
    }
}
