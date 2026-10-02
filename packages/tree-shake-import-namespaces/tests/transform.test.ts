import type { TreeShakeImportData, TreeShakeImportResolver } from "../src"
import { describe, expect, it } from "bun:test"
import { transform } from "../src"

const resolve: TreeShakeImportResolver = function (data) {
    return `import { ${data.propertyName} as ${data.importAlias} } from "${data.importPath}/${data.propertyName}";`
}

function run(code: string, resolver = resolve, filePath = "source.tsx"): string | undefined {
    return transform(dedent(code), filePath, { resolve: resolver })?.code
}

function inspect(code: string): TreeShakeImportData {
    let result: TreeShakeImportData
    run(code, (data) => {
        result = data
        return resolve(data)
    })
    return result!
}

function dedent(code: string): string {
    const lines = code.split("\n").filter((line, i, lines) => line.trim() || (i > 0 && i < lines.length - 1))
    const indent = Math.min(...lines.filter(line => line.trim()).map(line => line.match(/^ */)![0].length))
    return lines.map(line => line.slice(indent)).join("\n")
}

describe("transform", () => {
    it("should tree-shake named imports", () => {
        const code = `
            import { Foo } from "foo";
            Foo.bar;
        `
        expect(inspect(code)).toEqual({
            filePath: "source.tsx",
            importAlias: "_bar",
            importName: "Foo",
            importPath: "foo",
            localName: "Foo",
            propertyName: "bar",
            scope: new Set(["Foo", "bar", "_bar"]),
        })
        expect(run(code)).toBe(dedent(`
            import { bar as _bar } from "foo/bar";
            _bar;
        `))
    })

    it("should tree-shake aliased imports", () => {
        const code = `
            import { Foo as Bar } from "foo";
            Bar.bar;
        `
        expect(inspect(code)).toMatchObject({ importName: "Foo", localName: "Bar" })
        expect(run(code)).toBe(dedent(`
            import { bar as _bar } from "foo/bar";
            _bar;
        `))
    })

    it("should tree-shake default imports", () => {
        const code = `
            import Foo from "foo";
            Foo.bar;
        `
        expect(inspect(code)).toMatchObject({ importName: undefined, localName: "Foo" })
        expect(run(code)).toBe(dedent(`
            import { bar as _bar } from "foo/bar";
            _bar;
        `))
    })

    it("should tree-shake wildcard imports", () => {
        const code = `
            import * as Foo from "foo";
            Foo.bar;
        `
        expect(inspect(code)).toMatchObject({ importName: "*", localName: "Foo" })
        expect(run(code)).toBe(dedent(`
            import { bar as _bar } from "foo/bar";
            _bar;
        `))
    })

    it("should transform JSX", () => {
        expect(run(`
            import { Foo } from "foo";
            const Component = (
                <Foo.Bar>
                </Foo.Bar>
            );
        `)).toBe(dedent(`
            import { Bar as _Bar } from "foo/Bar";
            const Component = (
                <_Bar>
                </_Bar>
            );
        `))
    })

    it("should tree-shake multiple references", () => {
        expect(run(`
            import { Foo } from "foo";
            Foo.bar;
            Foo.bar;
            Foo.baz();
            Foo?.baz;
        `)).toBe(dedent(`
            import { bar as _bar } from "foo/bar";
            import { baz as _baz } from "foo/baz";
            _bar;
            _bar;
            _baz();
            _baz;
        `))
    })

    it("should not tree-shake nested members", () => {
        expect(run(`
            import { Foo } from "foo";
            Foo.bar.baz;
        `)).toBe(dedent(`
            import { bar as _bar } from "foo/bar";
            _bar.baz;
        `))
    })

    it("should keep the namespace when a member is not resolved", () => {
        expect(run(`
            import { A } from "a";
            import { B } from "b";
            A.a;
            B.c;
            B.d;
        `, (data) => {
            if (data.importName === "B" && data.propertyName === "d") return
            return resolve(data)
        })).toBe(dedent(`
            import { a as _a } from "a/a";
            import { B } from "b";
            _a;
            B.c;
            B.d;
        `))
    })

    it("should try resolvers in order", () => {
        expect(transform(`import { Foo } from "foo";\nFoo.bar;`, "source.ts", {
            resolve: [() => undefined, () => `import _bar from "second";`, () => `import _bar from "third";`],
        })?.code).toBe(`import _bar from "second";\n_bar;`)
    })

    it("should use the local name of the resolved import", () => {
        expect(run(`
            import { Foo } from "foo";
            Foo.bar;
        `, () => `import { bar as custom } from "foo/bar";`)).toBe(dedent(`
            import { bar as custom } from "foo/bar";
            custom;
        `))
    })

    it("should create unique identifiers", () => {
        expect(run(`
            import { Foo } from "foo";
            Foo.bar;
            const bar = true;
            const _bar = true;
        `)).toBe(dedent(`
            import { bar as _bar1 } from "foo/bar";
            _bar1;
            const bar = true;
            const _bar = true;
        `))
    })

    it("should create unique identifiers across scopes", () => {
        expect(run(`
            import { Foo } from "foo";
            Foo.bar;
            const example = function (_bar) {
                Foo.bar;
            };
        `)).toBe(dedent(`
            import { bar as _bar1 } from "foo/bar";
            _bar1;
            const example = function (_bar) {
                _bar1;
            };
        `))
    })

    it("should create unique identifiers across namespaces", () => {
        expect(run(`
            import { Foo } from "foo";
            import { Bar } from "bar";
            Foo.baz;
            Bar.baz;
        `)).toBe(dedent(`
            import { baz as _baz } from "foo/baz";
            import { baz as _baz1 } from "bar/baz";
            _baz;
            _baz1;
        `))
    })

    it("should skip shadowed namespaces", () => {
        expect(run(`
            import { Foo } from "foo";
            function a() {
                const Foo = {};
                return Foo.bar;
            }
            function b(Foo) {
                return Foo.bar;
            }
            function c() {
                return Foo.bar;
                function Foo() {}
            }
            function d() {
                if (true) { var Foo = {}; }
                return Foo.bar;
            }
            try {} catch (Foo) { Foo.bar; }
            for (const Foo of []) Foo.bar;
            const e = ({ Foo }) => Foo.bar;
        `)).toBe(undefined)
    })

    it("should not confuse block scoped declarations with the namespace", () => {
        expect(run(`
            import { Foo } from "foo";
            { const Foo = {}; }
            Foo.bar;
        `)).toBe(dedent(`
            import { bar as _bar } from "foo/bar";
            { const Foo = {}; }
            _bar;
        `))
    })

    it("should keep namespaces that are accessed dynamically", () => {
        expect(run(`
            import { Foo } from "foo";
            Foo.bar;
            Foo["bar"];
        `)).toBe(undefined)
    })

    it("should keep namespaces that are used as a value", () => {
        for (const usage of [
            "const x = Foo;",
            "export { Foo };",
            "export default Foo;",
            "call(Foo);",
            "const x = { Foo };",
            "const x = <Foo />;",
            "Foo.bar = 1;",
            "Foo.bar++;",
            "delete Foo.bar;",
            "[Foo.bar] = [1];",
            "({ a: Foo.bar } = {});",
            "for (Foo.bar of []);",
            "typeof Foo;",
        ]) {
            expect(run(`import { Foo } from "foo";\nFoo.bar;\n${usage}`)).toBe(undefined)
        }
    })

    it("should tree-shake members that are read while assigning", () => {
        expect(run(`
            import { Foo } from "foo";
            Foo.refs.current = 1;
            acc[Foo.key()] = 1;
            Foo.count.value++;
        `)).toBe(dedent(`
            import { refs as _refs } from "foo/refs";
            import { key as _key } from "foo/key";
            import { count as _count } from "foo/count";
            _refs.current = 1;
            acc[_key()] = 1;
            _count.value++;
        `))
    })

    it("should ignore identifiers that are not references", () => {
        expect(run(`
            import { Foo } from "foo";
            Foo.bar;
            const x = { Foo: 1 };
            x.Foo;
            class X { Foo() {} }
            Foo: for (;;) break Foo;
            export { x as Foo };
            const y = <div Foo="a" />;
        `)).toStartWith(`import { bar as _bar } from "foo/bar";\n_bar;`)
    })

    it("should keep other specifiers", () => {
        expect(run(`
            import Default, { Foo, Bar as Baz } from "foo" with { type: "x" };
            Foo.bar;
        `)).toBe(dedent(`
            import Default, { Bar as Baz } from "foo" with { type: "x" };
            import { bar as _bar } from "foo/bar";
            _bar;
        `))
    })

    it("should keep type specifiers as a type import", () => {
        expect(run(`
            import { Foo, type Bar, type Baz as Qux } from "foo";
            Foo.bar;
        `)).toBe(dedent(`
            import type { Bar, Baz as Qux } from "foo";
            import { bar as _bar } from "foo/bar";
            _bar;
        `))
    })

    it("should keep namespaces that are used as a type", () => {
        expect(run(`
            import { Foo } from "foo";
            const a: Foo = Foo.create<Foo>();
            const b = a as Foo.Options;
            type C = typeof Foo.create;
            export type { Foo };
        `)).toBe(dedent(`
            import { create as _create } from "foo/create";
            import type { Foo } from "foo";
            const a: Foo = _create<Foo>();
            const b = a as Foo.Options;
            type C = typeof Foo.create;
            export type { Foo };
        `))
    })

    it("should ignore type imports", () => {
        expect(run(`
            import type { Foo } from "foo";
            import { type Bar } from "bar";
            let x: Foo.bar | Bar.baz;
        `)).toBe(undefined)
    })

    it("should create sourcemaps", () => {
        const result = transform(`import { Foo } from "foo";\nFoo.bar;`, "source.ts", { resolve })
        expect(result!.map.sources).toEqual(["source.ts"])
        expect(result!.map.mappings).toBeTruthy()
    })
})
