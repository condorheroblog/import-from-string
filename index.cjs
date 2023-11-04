const { requireFromString, importFromString } = require("#dist/index.cjs");

async function main() {
	const cjs = requireFromString("module.exports = 'Hi World!'");
	console.log(cjs); // Hi World!

	const esm = await importFromString("export default 'Hello World!'");
	console.log(esm.default); // Hello World!
}

main();
