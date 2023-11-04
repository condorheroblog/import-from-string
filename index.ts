import { requireFromString, importFromString } from "#src";

const cjs = requireFromString("module.exports = 'Hi World!'");
console.log(cjs); // Hi World!

const esm = await importFromString("export default 'Hello World!'");
console.log(esm.default); // Hello World!
