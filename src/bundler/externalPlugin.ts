import { name } from "../../package.json";
import type { Plugin } from "esbuild";
import { isAbsolute, join } from "node:path";
import { pathToFileURL } from "node:url";

export function externalPlugin(): Plugin {
	return {
		name: `[${name}]:external-plugin`,
		setup(ctx) {
			ctx.onResolve({ filter: /.*/ }, async (args) => {
				if (args.path[0] === "." || isAbsolute(args.path)) {
					// Fallback to default
					return;
				}

				// https://esbuild.github.io/plugins/#on-resolve-arguments
				if (args.kind === "import-statement" || args.kind === "dynamic-import") {
					/**
					 * Limitations of `data: imports`
					 * 1. Resolving relative specifiers does not work because `data:` is not a special scheme
					 * 2. Cannot resolve external third-party modules
					 * So you need to use import-meta-resolve to convert them to absolute paths
					 * @link https://nodejs.org/api/esm.html#data-imports
					 *
					 * In addition, import-meta-resolve is a pure ESM package
					 * but it can be dynamically imported and used in the CJS environment
					 */
					const { resolve } = await import("import-meta-resolve");
					return {
						path: resolve(args.path, pathToFileURL(join(args.resolveDir, "__TEMP__.js")).href),
						// Most like importing from node_modules and builtin modules, mark external
						external: true,
					};
				} else {
					return {
						external: true,
					};
				}
			});
		},
	};
}
