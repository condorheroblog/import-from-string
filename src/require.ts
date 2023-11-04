import { isInESModuleScope, getCallerDirname, getNodeModulesPaths } from "./utils";
import { Module } from "node:module";
import { join } from "node:path";

/**
 * Options for requiring code from a string.
 */
export interface RequireFromStringOptions {
	/**
	 * The virtual file name of the code to import.
	 * @default `${Date.now()}.js`
	 */
	filename?: string;
	/**
	 * The directory name to resolve dependencies relative to.
	 * @default The directory where the function is called
	 */
	dirname?: string;
	/**
	 * An array of additional paths to append when resolving modules.
	 */
	appendPaths?: string[];
	/**
	 * An array of additional paths to prepend when resolving modules.
	 */
	prependPaths?: string[];
}

/**
 * Requires code from a string.
 *
 * @param code - The code to require.
 * @param options - Options for requiring the code.
 * @returns The exports object of the required module.
 * @throws If the code is empty or encounters an error during execution.
 */

export const requireFromString = (code: string, options: RequireFromStringOptions = {}) => {
	if (!code.length) {
		throw new Error(`code cannot be empty`);
	}

	const filename = options?.filename ?? `${Date.now()}.js`;
	const dirname = options?.dirname ?? getCallerDirname();

	const absolutePath = join(dirname, filename);
	let mainModule: NodeJS.Module | undefined;
	let mainModulePaths: string[] = [];

	if (isInESModuleScope()) {
		mainModule = undefined;
		mainModulePaths = getNodeModulesPaths(absolutePath);
	} else {
		mainModulePaths = mainModule?.paths ?? getNodeModulesPaths(absolutePath);
		mainModule = require.main;
	}

	const contextModule = new Module(absolutePath, mainModule);

	contextModule.filename = absolutePath;

	const appendPaths = options?.appendPaths ?? [];
	const prependPaths = options?.prependPaths ?? [];
	// const mainModulePaths = mainModule?.paths ?? [];
	contextModule.paths = [...prependPaths, ...mainModulePaths, ...appendPaths];

	// https://github.com/nodejs/node/blob/main/lib/internal/modules/cjs/loader.js#L1330
	// @ts-expect-error: safe to ignore
	contextModule._compile(code, absolutePath);

	// runInNewContext's importModuleDynamically option is experimental
	// https://nodejs.org/dist/latest-v20.x/docs/api/vm.html#vmruninnewcontextcode-contextobject-options
	// runInNewContext(code, contextObject, {
	// 	filename: moduleFilename,
	// 	// experimental
	// 	async importModuleDynamically(specifier: string) {
	// 		return await import(resolveModuleSpecifier(specifier, contextModule.path));
	// 	},
	// });

	contextModule.loaded = true;
	return contextModule.exports;
};
