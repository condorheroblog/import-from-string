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

				/**
				 * data: imports
				 * @link https://nodejs.org/api/esm.html#data-imports
				 * Resolving relative specifiers does not work because data: is not a special scheme(import-meta-resolve)
				 * Most like importing from node_modules and builtin modules , mark external
				 */
				const { resolve } = await import("import-meta-resolve");
				return {
					path: resolve(args.path, pathToFileURL(join(args.resolveDir, "__TEMP__.js")).href),
					external: true,
				};
			});
		},
	};
}
