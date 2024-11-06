# Import-from-string

[![NPM version](https://img.shields.io/npm/v/import-from-string)](https://www.npmjs.com/package/import-from-string)
[![Downloads](https://img.shields.io/npm/dw/import-from-string)](https://www.npmjs.com/package/import-from-string)
[![License](https://img.shields.io/npm/l/import-from-string)](https://github.com/condorheroblog/import-from-string/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/condorheroblog/import-from-string)](https://github.com/condorheroblog/import-from-string/blob/main/packages/import-from-string)

Load module from string using require or import.

## Features

- Support ESM and CJS environments
- Support dynamic import
- Support `import.meta.url`
- Support access to global variables
- No asynchronous IO operations
- No module cache

## Install

```bash
npm install import-from-string
```

## Usage

### ESM

```mjs
import { importFromString, requireFromString } from "import-from-string";

const cjs = requireFromString("module.exports = 'Hi World!'");
console.log(cjs); // Hi World!

const esm = await importFromString("export default 'Hello World!'");
console.log(esm.default); // Hello World!
```

### CJS

```cjs
const { requireFromString, importFromString } = require("import-from-string");

async function main() {
	const cjs = requireFromString("module.exports = 'Hi World!'");
	console.log(cjs); // Hi World!

	const esm = await importFromString("export default 'Hello World!'");
	console.log(esm.default); // Hello World!
}

main();
```

## API

### importFromString(code, options?)

#### code

Type: `string`

The code to import.

#### options

##### filename

Type: `string`\
Default: `{Date.now()}.js`

The virtual file name of the code to import.

##### dirname

Type: `string`\
Default: `The directory where the function is called`

The virtual directory to import the code into.

##### transformOptions

Type: `TransformOptions`

esbuild transform options.

##### esbuildOptions

Type: `BuildOptions`

esbuild options.

##### skipBuild

Type: `boolean`\
Default: `false`

skip esbuild build.

### requireFromString(code, options?)

#### code

Type: `string`

The code to import.

#### options

##### filename

Type: `string`\
Default: `{Date.now()}.js`

The virtual file name of the code to import.

##### dirname

Type: `string`\
Default: `The directory where the function is called`

The virtual directory to import the code into.

##### appendPaths

Type: `string[]`\
Default: `[]`

An array of additional paths to append when resolving modules.

##### prependPaths

Type: `string[]`\
Default: `[]`

An array of additional paths to prepend when resolving modules.

## Appreciation

- [bundle-require](https://github.com/egoist/bundle-require)
- [module-from-string](https://github.com/exuanbo/module-from-string)
- [require-from-string](https://github.com/floatdrop/require-from-string)

## License

[MIT](https://github.com/condorheroblog/import-from-string/blob/main/LICENSE) License © 2023-Present [Condor Hero](https://github.com/condorheroblog)
