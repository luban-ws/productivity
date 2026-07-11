import eslint from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import globals from "globals";

const sharedLanguageOptions = {
    parser: tsparser,
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
    },
    globals: {
        ...globals.node,
        ...globals.es2021,
    },
};

const sharedRules = {
    ...eslint.configs.recommended.rules,
    ...tseslint.configs.recommended.rules,
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
};

export default [
    {
        ignores: ["dist/**", "coverage/**"],
    },
    {
        files: ["**/*.ts"],
        languageOptions: sharedLanguageOptions,
        plugins: {
            "@typescript-eslint": tseslint,
        },
        rules: sharedRules,
    },
    {
        files: ["**/*.tsx"],
        languageOptions: {
            ...sharedLanguageOptions,
            parserOptions: {
                ...sharedLanguageOptions.parserOptions,
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        plugins: {
            "@typescript-eslint": tseslint,
        },
        rules: sharedRules,
    },
];
