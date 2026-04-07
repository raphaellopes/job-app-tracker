import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier";
import reactCompiler from "eslint-plugin-react-compiler";
import simpleImportSort from "eslint-plugin-simple-import-sort";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
      "react-compiler": reactCompiler,
    },
    rules: {
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // External libraries.
            ["^react$", "^next", "^@?\\w"],
            // Internal groups in desired order.
            ["^@/components(/.*|$)"],
            ["^@/db(/.*|$)"],
            ["^@/actions(/.*|$)"],
            ["^@/lib(/.*|$)"],
            // Relative imports.
            ["^\\.\\.(?!/?$)", "^\\.\\./?$", "^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
          ],
        },
      ],
      "simple-import-sort/exports": "error",
      "react-compiler/react-compiler": "error",
    },
  },
  eslintConfigPrettier,
]);

export default eslintConfig;
