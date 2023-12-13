const { resolve } = require("node:path");

const project = resolve(process.cwd(), "tsconfig.json");

/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:sort/recommended",
    "plugin:unicorn/all",
    "turbo",
    "prettier",
  ],
  env: {
    node: true,
    browser: true,
  },
  overrides: [{ files: ["*.js?(x)", "*.ts?(x)"] }],
  plugins: ["sort", "unused-imports"],
  rules: {
    "import/order": [
      "error",
      {
        alphabetize: {
          order: "asc",
        },
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
        ],
        "newlines-between": "always",
        pathGroups: [
          {
            group: "internal",
            pattern: "~/**",
            position: "before",
          },
        ],
      },
    ],
    "no-restricted-imports": [
      "warn",
      {
        patterns: [
          {
            group: ["../*"],
            message:
              "Imports are only allowed as siblings ('./') or as absolute imports",
          },
        ],
      },
    ],
    "sort/import-members": "off",
    "sort/imports": "off",
    "sort/type-properties": "error",
    "sort-imports": [
      "error",
      {
        ignoreCase: false,
        ignoreDeclarationSort: true,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ["none", "all", "multiple", "single"],
      },
    ],
    "unicorn/filename-case": [
      "error",
      {
        case: "kebabCase",
      },
    ],
    "unicorn/no-await-expression-member": "warn",
    "unicorn/no-keyword-prefix": "off",
    "unicorn/no-null": "off",
    "unicorn/no-useless-undefined": "off",
    "unicorn/prefer-module": "off",
    "unicorn/prevent-abbreviations": "off",
    "unused-imports/no-unused-imports": "error",
  },
  settings: {
    "import/resolver": {
      typescript: {
        project,
      },
    },
  },
  ignorePatterns: [
    // Ignore dotfiles
    ".*.js",
    "node_modules/",
  ],
};
