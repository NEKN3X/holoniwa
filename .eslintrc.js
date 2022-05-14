/**
 * @type {import('@types/eslint').Linter.BaseConfig}
 */
module.exports = {
  extends: [
    "@remix-run/eslint-config",
    "@remix-run/eslint-config/node",
    "prettier",
    "plugin:import/errors",
  ],
  plugins: ["@typescript-eslint", "import"],
  parser: "@typescript-eslint/parser",
  env: {
    node: true,
    es6: true,
  },
  rules: {
    "no-unused-vars": 0,
    "@typescript-eslint/no-unused-vars": 1,
    "sort-imports": 0, // ESLint標準のsort-importsは、import文のソート順を指定できないため、無効化
    "import/no-unresolved": 2, // turn on errors for missing imports
    "import/order": [
      2,
      {
        alphabetize: {
          order: "asc",
        },
        groups: [
          "index",
          "sibling",
          "parent",
          "internal",
          "external",
          "builtin",
          "object",
          "type",
        ],
      },
    ],
  },
  settings: {
    "import/resolver": {
      node: {
        extensions: [".ts", ".tsx"],
      },
    },
  },
}
