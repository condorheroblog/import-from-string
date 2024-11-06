import type { BuildOptions } from "esbuild";
import { build } from "esbuild";
import { externalPlugin } from "./externalPlugin";
import { injectFileScopePlugin } from "./injectFileScopePlugin";

export async function buildBundler(esbuildOptions: BuildOptions = {}) {
	const bundledResult = await build({
		bundle: true,
		platform: "node",
		format: "esm",
		write: false,
		legalComments: "none",
		logLevel: "silent",
		metafile: true,
		plugins: [externalPlugin(), injectFileScopePlugin()],
		...esbuildOptions,
	});

	return bundledResult;
}
