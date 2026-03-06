import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
    {
        ignores: ["node_modules/**", "dist/**", ".angular/**", "coverage/**", "out-tsc/**"]
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ["src/**/*.ts"],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node
            }
        },
        rules: {
            "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
            "@typescript-eslint/no-explicit-any": "off"
        }
    },
    {
        files: ["**/*.js"],
        rules: {
            "@typescript-eslint/no-require-imports": "off",
            "@typescript-eslint/no-explicit-any": "off"
        }
    },
    {
        files: ["src/**/*.spec.ts"],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.jasmine
            }
        }
    },
    {
        files: ["scripts/**/*.js"],
        languageOptions: {
            globals: {
                ...globals.node
            }
        }
    }
);
