/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@fresh-pack/eslint-config/index.js"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
};
