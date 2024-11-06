import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { importFromString } from "#dist/index.mjs";
import { describe, it } from "vitest";

describe(`${importFromString.name} in ESM module`, () => {
	it("should work with named export", async ({ expect }) => {
		const res = await importFromString("export const greet = 'hi'");
		expect(res.greet).toBe("hi");
	});

	it("should work with default export", async ({ expect }) => {
		const res = await importFromString("export default 'hi'");
		expect(res.default).toBe("hi");
	});

	it("should work with relative path import", async ({ expect }) => {
		const modulePath = "./fixtures/namedExport.mjs";
		const res = await importFromString(`export { greet } from '${modulePath}'`);
		expect(res.greet).toBe("hi");
	});

	it("should resolve correctly if option `dirname` is provided", async ({ expect }) => {
		const modulePath = "./esm/fixtures/defaultExport.mjs";
		const res = await importFromString(`export { default } from '${modulePath}'`, {
			dirname: dirname(__dirname),
		});
		expect(res.default).toBe("hi");
	});

	it("should work with absolute path import", async ({ expect }) => {
		const modulePath = join(__dirname, "fixtures/namedExport.mjs");
		const res = await importFromString(`export { greet } from ${JSON.stringify(modulePath)}`);
		expect(res.greet).toBe("hi");
	});

	it("should work with subpath imports", async ({ expect }) => {
		const modulePath = "#__tests__/esm/fixtures/namedExport.mjs";
		const res = await importFromString(`export { greet } from '${modulePath}'`);
		expect(res.greet).toBe("hi");
	});

	it("should work with import external module", async ({ expect }) => {
		const code = `import { transformSync } from 'esbuild'
	const { code } = transformSync('enum Greet { Hi }', { loader: 'ts' })
	export default code
	`;
		const res = await importFromString(code);
		expect(res.default).toMatchInlineSnapshot(`
			"var Greet = /* @__PURE__ */ ((Greet2) => {
			  Greet2[Greet2["Hi"] = 0] = "Hi";
			  return Greet2;
			})(Greet || {});
			"
		`);
	});

	it("should be able to use dynamic import", async ({ expect }) => {
		const importModule = async (modulePath: string) => {
			const result = await importFromString(`export const module = import(${JSON.stringify(modulePath)})`);
			return result.module;
		};
		const modulePath = "./fixtures/namedExport.mjs";
		expect((await importModule(modulePath)).greet).toBe("hi");
		const absoluteModulePath = join(__dirname, modulePath);
		expect((await importModule(absoluteModulePath)).greet).toBe("hi");
		expect((await importModule(pathToFileURL(absoluteModulePath).href)).greet).toBe("hi");
	});

	it("should not access __dirname", async ({ expect }) => {
		const res = () => {
			return importFromString(`
	      export const dirname = __dirname
	    `);
		};
		expect(res).rejects.toThrowErrorMatchingInlineSnapshot("[ReferenceError: __dirname is not defined in ES module scope]");
	});

	it("should not access __filename", async ({ expect }) => {
		const res = () => {
			return importFromString(`
	      export const filename = __filename
	    `);
		};
		expect(res).rejects.toThrowErrorMatchingInlineSnapshot("[ReferenceError: __filename is not defined in ES module scope]");
	});

	it("should be able to access import.meta.url", async ({ expect }) => {
		const res = await importFromString("export const url = import.meta.url");
		expect(res.url).toMatch(pathToFileURL(__dirname).href);
	});

	// it("should be able to access import.meta", async ({ expect }) => {
	// 	const res = await importFromString("export const { url } = import.meta");
	// 	expect(res.url).toMatch(pathToFileURL(__dirname).href);
	// });

	// it("should be able to access import", async ({ expect }) => {
	// 	const res = await importFromString("export const { meta: { url } } = import");
	// 	expect(res.url).toMatch(pathToFileURL(__dirname).href);
	// });

	it("should access globals", async ({ expect }) => {
		const res = await importFromString("export default process.cwd()");
		expect(res.default).toBe(process.cwd());
	});

	it("should work if transformOption is provided", async ({ expect }) => {
		const res = await importFromString("export default function() { return 'hi' }", {
			transformOptions: { loader: "ts" },
		});
		expect(res.default()).toBe("hi");
	});

	it("should use relative filename in error stack trace", async ({ expect }) => {
		const filename = "foo.mjs";
		try {
			await importFromString("throw new Error(\"boom\")", {
				filename,
			});
		}
		catch (err) {
			if (err instanceof Error) {
				expect(err.stack).toMatch("data:text/javascript;");
			}
			else {
				throw err;
			}
		}
	});
});
