import { name } from "../../package.json";
import type { Plugin, Loader } from "esbuild";
import { promises } from "node:fs";
import { extname } from "node:path";
import { pathToFileURL } from "node:url";

export const IMPORT_META_URL_VAR_NAME = "__injected_import_meta_url__";
export const JS_EXT_RE = /\.([mc]?[tj]s|[tj]sx)$/;

export function inferLoader(ext: string): Loader {
	if (ext === ".mjs" || ext === ".cjs") return "js";
	if (ext === ".mts" || ext === ".cts") return "ts";
	return ext.slice(1) as Loader;
}

export function injectFileScopePlugin(): Plugin {
	return {
		name: `[${name}]:inject-file-scope`,
		setup(build) {
			build.initialOptions.define = {
				...build.initialOptions.define,
				"import.meta.url": IMPORT_META_URL_VAR_NAME,
			};

			build.onLoad({ filter: JS_EXT_RE }, async (args) => {
				const contents = await promises.readFile(args.path, "utf-8");
				const injectLines = [`const ${IMPORT_META_URL_VAR_NAME} = ${JSON.stringify(pathToFileURL(args.path).href)};`];
				return {
					contents: injectLines.join("") + contents,
					loader: inferLoader(extname(args.path)),
				};
			});
		},
	};
}
