import antfu from "@antfu/eslint-config";

export default antfu({
	// type: "lib",
	rules: {
		"style/quotes": ["error", "double"],
		"style/semi": ["error", "always"],
		"style/indent": ["error", "tab"],
		"jsonc/indent": ["error", "tab"],
		"style/no-tabs": "off",

		// https://github.com/antfu/eslint-config/issues/456#issuecomment-2066528760
		"perfectionist/sort-imports": "off",
		"perfectionist/sort-named-imports": "off",
		"perfectionist/sort-exports": "off",
		"node/no-path-concat": "off",
	},
});
