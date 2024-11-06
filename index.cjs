const { requireFromString, importFromString } = require("#dist/index.cjs");

async function main() {
	const cjs = requireFromString("module.exports = 'Hi World!'");
	// eslint-disable-next-line no-console
	console.log(cjs); // Hi World!

	const esm = await importFromString("export default 'Hello World!'");
	// eslint-disable-next-line no-console
	console.log(esm.default); // Hello World!
}

main();
