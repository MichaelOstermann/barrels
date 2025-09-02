import { $, Glob } from "bun"
import prompts from "prompts"

await $`bun run bundles`

const packages = Array.from(new Glob("packages/*/package.json").scanSync())
const files = new Map()
let nextVersion

for (const file of ["bun.lock", ...packages]) {
    const contents = await Bun.file(file).text()
    files.set(file, contents)
}

for await (const [file, contents] of files) {
    const lines = contents.split("\n")
    const prevVersion = contents.match(/"version": "(.+?)"/)[1]
    nextVersion ??= (await prompts({
        message: `Version (Current: ${prevVersion})`,
        name: "version",
        type: "text",
    }, { onCancel })).version

    for (let i = 0; i < lines.length; i++) {
        const prevLine = lines[i]
        const nextLine = prevLine.replace(`"version": "${prevVersion}"`, `"version": "${nextVersion}"`)
        if (prevLine === nextLine) continue
        console.log(`\x1B[34m${file}\x1B[0m`)
        console.log(lines.slice(i - 2, i).join("\n"))
        console.log(`\x1B[31m${prevLine}\x1B[0m → \x1B[32m${nextLine.trim()}\x1B[0m`)
        console.log(lines.slice(i + 1, i + 3).join("\n"))
        const { replace } = await prompts({
            initial: true,
            message: "Replace?",
            name: "replace",
            type: "confirm",
        }, { onCancel })
        if (replace) lines[i] = nextLine
    }

    await Bun.write(file, lines.join("\n"))
}

const { commit } = await prompts({
    initial: true,
    message: "Commit?",
    name: "commit",
    type: "confirm",
}, { onCancel })

if (commit) {
    const { commitMsg } = await prompts({
        initial: `chore: release v${nextVersion}`,
        message: "Commit message",
        name: "commitMsg",
        type: "text",
    }, { onCancel })

    await $`git commit --all --message ${commitMsg}`
    await $`git tag --annotate --message ${commitMsg} v${nextVersion}`
}

const { publish } = await prompts({
    initial: true,
    message: "Publish?",
    name: "publish",
    type: "confirm",
}, { onCancel })

if (publish) {
    await $`bun run -F '*' release`
}

const { push } = await prompts({
    initial: true,
    message: "Push?",
    name: "push",
    type: "confirm",
}, { onCancel })

if (push) {
    await $`git push`
    await $`git push --tags`
}

function onCancel() {
    process.exit(0)
}
