// prettier.config.js, .prettierrc.js, prettier.config.cjs, or .prettierrc.cjs

/** @type {import("prettier").Config} */
const config = {
  trailingComma: 'es5',
  tabWidth: 2,
  semi: false,
  singleQuote: true,
  overrides: [
    {
      files: ['*.html', '*.component.html', '*.layout.html'],
      options: {
        parser: 'angular',
        printWidth: 100,
      },
    },
  ],
}

module.exports = config
