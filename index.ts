import { importFromString, requireFromString } from "#src";

const cjs = requireFromString("module.exports = 'Hi World!'");
// eslint-disable-next-line no-console
console.log(cjs); // Hi World!

// eslint-disable-next-line antfu/no-top-level-await
const esm = await importFromString("export default 'Hello World!'");
// eslint-disable-next-line no-console
console.log(esm.default); // Hello World!
