module.exports = {
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2020,
    "project": "./tsconfig.eslint.json"
  },
  "root": true,
  "env": {
    "node": true
  },
  "plugins": [
    "@typescript-eslint",
  ],
  "extends": [
    "eslint:recommended",
  ],
  "ignorePatterns": [
    "node_modules",
    "dist",
    "coverage",
    "lint-staged.config.js"
  ],
  "rules": {
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "argsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }
    ]
  }
}