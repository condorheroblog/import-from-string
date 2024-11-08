import type { BuildOptions, TransformOptions } from "esbuild";
import { Buffer } from "node:buffer";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { transformSync } from "esbuild";

import { name } from "../package.json";
import { buildBundler, IMPORT_META_URL_VAR_NAME } from "./bundler";
import { getCallerDirname } from "./utils";

/**
 * Options for importing code from a string.
 */
export interface ImportFromStringOptions {
	/**
	 * The virtual file name of the code to import.
	 * @default `${Date.now()}.js`
	 */
	filename?: string
	/**
	 * The directory name to resolve dependencies relative to.
	 * @default The directory where the function is called
	 */
	dirname?: string
	/**
	 * esbuild transform options.
	 */
	transformOptions?: TransformOptions
	/**
	 * esbuild options.
	 */
	esbuildOptions?: BuildOptions
	/**
	 * skip esbuild build.
	 * @default false
	 */
	skipBuild?: boolean
}

/**
 * Asynchronously import module from string.
 *
 * @param code - The code to import.
 * @param options - Options for importing the code.
 * @returns A promise that resolves to the imported module.
 * @throws If the import or transformation process encounters an error.
 */
export async function importFromString(code: string, options: ImportFromStringOptions = {}) {
	if (!code.length) {
		throw new Error("code cannot be empty");
	}

	const filename = options?.filename ?? `${Date.now()}.js`;
	const dirname = options?.dirname ?? getCallerDirname();
	const skipBuild = options?.skipBuild ?? false;

	const absolutePath = join(dirname, filename);

	let result = code;
	if (!skipBuild) {
		const bundledResult = await buildBundler({
			...options?.esbuildOptions,
			stdin: {
				contents: code,
				resolveDir: dirname,
				loader: "js",
				...options?.esbuildOptions?.stdin,
			},
		});

		if (!bundledResult.outputFiles) {
			throw new Error(`[${name}] no output files`);
		}

		const bundled = bundledResult.outputFiles[0].text;

		const transformCode = transformSync(bundled, {
			format: "esm",
			...options.transformOptions,
			define: {
				[IMPORT_META_URL_VAR_NAME]: JSON.stringify(pathToFileURL(absolutePath).href),
				...options.transformOptions?.define,
			},
		});

		result = transformCode.code;
	}

	try {
		return import(`data:text/javascript;base64,${Buffer.from(result).toString("base64")}`);
	}
	catch {
		throw new Error(result);
	}
}
