import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ensureFileURL, ensurePath, getCallerDirname, getNodeModulesPaths, isFileURL } from "#src";
import { describe, it } from "vitest";

describe("utils", () => {
	it(isFileURL.name, async ({ expect }) => {
		expect(isFileURL("github")).toBeFalsy();
		expect(isFileURL("file:")).toBeTruthy();
	});

	it(ensureFileURL.name, async ({ expect }) => {
		expect(ensureFileURL("file:///ant/i")).toMatchInlineSnapshot("\"file:///ant/i\"");
		expect(ensureFileURL("ant/i")).toMatch("file:");
	});

	it(ensurePath.name, async ({ expect }) => {
		expect(ensurePath("file:///ant/i")).toMatchInlineSnapshot("\"/ant/i\"");
		expect(ensurePath("ant/i")).toMatchInlineSnapshot("\"ant/i\"");
	});

	it(getCallerDirname.name, async ({ expect }) => {
		const result = getCallerDirname();
		expect(result).toBe(dirname(fileURLToPath(import.meta.url)));
	});

	it(getCallerDirname.name, async ({ expect }) => {
		const result = getCallerDirname();
		expect(result).toBe(dirname(fileURLToPath(import.meta.url)));
	});

	it(getNodeModulesPaths.name, async ({ expect }) => {
		const result = getNodeModulesPaths("/antfu/vueuse");
		expect(result).toMatchInlineSnapshot(`
			[
			  "/antfu/node_modules",
			  "/node_modules",
			]
		`);
	});
});
