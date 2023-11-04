import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const FILE_URL_PROTOCOL = "file:";

/**
 * Checks if a given URL is a file URL.
 *
 * @param value - The URL to check.
 * @returns `true` if the URL is a file URL, `false` otherwise.
 */
export const isFileURL = (value: string) => value.startsWith(FILE_URL_PROTOCOL);

/**
 * Ensures that a given value is a file URL. If the value is not a file URL,
 * it converts it to a file URL using `pathToFileURL`.
 *
 * @param value - The value to ensure as a file URL.
 * @returns The file URL.
 */
export const ensureFileURL = (value: string) => (isFileURL(value) ? value : pathToFileURL(value).href);

/**
 * Ensures that a given value is a file path. If the value is a file URL,
 * it converts it to a file path using `fileURLToPath`.
 *
 * @param value - The value to ensure as a file path.
 * @returns The file path.
 */
export const ensurePath = (value: string) => (isFileURL(value) ? fileURLToPath(value) : value);

/**
 * Checks if the current execution context is in an ECMAScript module scope.
 *
 * @returns `true` if the current context is in an ES module scope, `false` otherwise.
 */
export const isInESModuleScope = () => {
	try {
		return module === undefined;
	} catch {
		return true;
	}
};

/**
 * Internal function names used to filter call sites when determining the caller's directory name.
 */
const internalFunctionNames = ["getCallerDirname", "requireFromString", "importFromString"];

/**
 * Retrieves the directory name of the caller function.
 *
 * @returns The directory name of the caller.
 */
export const getCallerDirname = (): string => {
	const __prepareStackTrace = Error.prepareStackTrace;
	Error.prepareStackTrace = (_err, stackTraces) => stackTraces;
	// @ts-expect-error: safe to ignore
	const callSites = (new Error().stack as NodeJS.CallSite[]).filter((callSite) => {
		const functionName = callSite.getFunctionName();
		return functionName === null || !internalFunctionNames.includes(functionName);
	});
	Error.prepareStackTrace = __prepareStackTrace;
	const caller = callSites[0];
	const callerFilename = caller.getFileName() ?? process.argv[1];
	return dirname(ensurePath(callerFilename));
};

/**
 * Retrieves an array of node_modules paths starting from the given file path and going up the directory tree.
 *
 * @param filePath - The file path to start from.
 * @returns An array of node_modules paths.
 */
export function getNodeModulesPaths(filePath: string) {
	const nodeModulesPaths = [];

	let currentDir = dirname(filePath);

	while (true) {
		const nodeModulesPath = resolve(currentDir, "node_modules");
		nodeModulesPaths.push(nodeModulesPath);

		const parentDir = resolve(currentDir, "..");
		if (parentDir === currentDir) {
			break;
		}

		currentDir = parentDir;
	}

	return nodeModulesPaths;
}
