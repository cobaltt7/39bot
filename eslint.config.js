import path from "node:path";
import { fileURLToPath } from "node:url";

import cobaltConfigs, { globals } from "eslint-config-cobaltt7";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig(
	{ files: ["**/*.ts"] },
	globalIgnores(["dist"]),
	...cobaltConfigs,
	{
		languageOptions: {
			ecmaVersion: 2025,
			globals: globals.nodeBuiltin,
			parserOptions: {
				projectService: true,
				tsconfigRootDir: path.dirname(fileURLToPath(import.meta.url)),
			},
		},
	},
	{
		rules: {
			"@typescript-eslint/naming-convention": [
				"error",
				{
					format: ["camelCase", "PascalCase", "UPPER_CASE"],
					selector: ["import", "variable"],
				},
				{ format: ["camelCase"], selector: ["function", "method", "parameterProperty"] },
				{ format: ["camelCase"], leadingUnderscore: "allow", selector: "parameter" },
				{ format: ["camelCase", "UPPER_CASE"], selector: "classProperty" },
				{ format: ["PascalCase"], selector: ["enumMember", "typeLike"] },
				{
					custom: { match: false, regex: /^T[A-Z]/u.source },
					format: ["PascalCase"],
					leadingUnderscore: "allow",
					selector: ["typeParameter"],
				},
			],
		},
	},
	{ files: ["./common/typedefs/**"], rules: { "unicorn/filename-case": "off" } },
	{
		files: ["./common/constants.ts"],
		rules: { "sort-keys": ["error", "asc", { caseSensitive: false, natural: true }] },
	},
);

