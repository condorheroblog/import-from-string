import { describe, it, expect } from "vitest";

const { dirname, join, relative } = require("node:path");
const { homedir } = require("node:os");

const { requireFromString } = require("#dist/index.cjs");

describe(requireFromString.name + "in CommonJS Module", () => {
	it("should work with `module.exports`", () => {
		const res = requireFromString("module.exports = 'hi'");
		expect(res).toBe("hi");
	});

	it("should work with exports shortcut", () => {
		const res = requireFromString("exports.hello = 'hello'\nexports.hi = 'hi'");
		expect(res.hello).toBe("hello");
		expect(res.hi).toBe("hi");
	});

	it("should work with relative path require", () => {
		const modulePath = "./fixtures/defaultExport.cjs";
		const res = requireFromString(`module.exports = require('${modulePath}')`);
		expect(res).toBe("hi");
	});

	it("should resolve correctly if option `dirname` is provided", () => {
		const modulePath = "./cjs/fixtures/namedExport.cjs";
		const res = requireFromString(`exports.greet = require('${modulePath}').greet`, {
			dirname: dirname(__dirname),
		});
		expect(res.greet).toBe("hi");
	});

	it("should work with absolute path require", () => {
		const modulePath = join(__dirname, "fixtures/defaultExport.cjs");
		const res = requireFromString(`module.exports = require(${JSON.stringify(modulePath)})`);
		expect(res).toBe("hi");
	});

	it("should work with subpath imports", () => {
		const modulePath = "#__tests__/cjs/fixtures/defaultExport.cjs";
		const res = requireFromString(`module.exports = require('${modulePath}')`);
		expect(res).toBe("hi");
	});

	it("should work with require external module", () => {
		const code = `const { transformSync } = require('esbuild')
const { code } = transformSync('enum Greet { Hi }', { loader: 'ts' })
exports.greet = code
`;
		const res = requireFromString(code);
		expect(res).toMatchInlineSnapshot(`
		{
		  "greet": "var Greet = /* @__PURE__ */ ((Greet2) => {
		  Greet2[Greet2[\\"Hi\\"] = 0] = \\"Hi\\";
		  return Greet2;
		})(Greet || {});
		",
		}
	`);
	});

	it("should work with dynamic import module", async () => {
		const code = `
	async function getCode() {
		const { transformSync } = await import('esbuild');
		const { code } = transformSync('enum Greet { Hi }', { loader: 'ts' });
		return code;
	}
	module.exports = getCode();
	`;
		const res = await requireFromString(code);
		expect(res).toMatchInlineSnapshot(`
		"var Greet = /* @__PURE__ */ ((Greet2) => {
		  Greet2[Greet2[\\"Hi\\"] = 0] = \\"Hi\\";
		  return Greet2;
		})(Greet || {});
		"
	`);
	});

	it("should access globals", () => {
		const res = requireFromString("module.exports = process.cwd()");
		expect(res).toBe(process.cwd());
	});

	it("should access __dirname", () => {
		const res = requireFromString("module.exports = __dirname");
		expect(res).toBe(__dirname);
	});

	it("should access __filename", () => {
		const res = requireFromString("module.exports = __filename", { filename: "x.js" });
		expect(res).toBe(__dirname + "/x.js");
	});

	it("should use relative filename in error stack trace", () => {
		const filename = "foo.js";
		const relativeDirname = relative(process.cwd(), __dirname);
		const relativeFilename = join(relativeDirname, filename);
		try {
			requireFromString('throw new Error("boom")', {
				filename,
			});
		} catch (error) {
			if (error instanceof Error) {
				expect(error.stack).toMatch(`${relativeFilename}:`);
			} else {
				throw error;
			}
		}
	});

	it("should use absolute filename in error stack trace", () => {
		const filename = join(homedir(), "foo", "bar", "baz.js");
		try {
			requireFromString('throw new Error("boom")', {
				filename,
			});
		} catch (error) {
			if (error instanceof Error) {
				expect(error.stack).toMatch(`${filename}:`);
			} else {
				throw error;
			}
		}
	});

	it("should does't work ESM module", () => {
		const res = () => requireFromString(`export default 111`);
		expect(res).toThrowErrorMatchingInlineSnapshot("\"Unexpected token 'export'\"");
	});
});
