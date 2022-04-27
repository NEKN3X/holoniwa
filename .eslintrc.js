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
  plugins: ["@typescript-eslint", "import", "ramda"],
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
    "ramda/always-simplification": "error",
    "ramda/any-pass-simplification": "error",
    "ramda/both-simplification": "error",
    "ramda/complement-simplification": "error",
    "ramda/compose-simplification": "error",
    "ramda/cond-simplification": "error",
    "ramda/either-simplification": "error",
    "ramda/eq-by-simplification": "error",
    "ramda/filter-simplification": "error",
    "ramda/if-else-simplification": "error",
    "ramda/map-simplification": "error",
    "ramda/merge-simplification": "error",
    "ramda/no-redundant-and": "error",
    "ramda/no-redundant-not": "error",
    "ramda/no-redundant-or": "error",
    "ramda/pipe-simplification": "error",
    "ramda/prefer-both-either": "error",
    "ramda/prefer-complement": "error",
    "ramda/prefer-ramda-boolean": "error",
    "ramda/prop-satisfies-simplification": "error",
    "ramda/reduce-simplification": "error",
    "ramda/reject-simplification": "error",
    "ramda/set-simplification": "error",
    "ramda/unless-simplification": "error",
    "ramda/when-simplification": "error",
  },
  settings: {
    "import/resolver": {
      node: {
        extensions: [".ts", ".tsx"],
      },
    },
  },
}
