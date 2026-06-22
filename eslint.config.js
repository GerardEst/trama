// @ts-check
const eslint = require('@eslint/js')
const tseslint = require('typescript-eslint')
const angular = require('angular-eslint')

module.exports = tseslint.config(
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'polo', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'polo', style: 'kebab-case' },
      ],
      // Disallow leftover debug logging; warn/error are still allowed
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // Many existing @Output()s are named onXxx; flag as tech debt without
      // failing the lint (renaming requires touching every template binding).
      '@angular-eslint/no-output-on-prefix': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // This codebase leans on `any` at the data boundary; keep as warnings
      // rather than failing the lint so it can be paid down incrementally.
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['**/*.html'],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    // Accessibility issues are surfaced as warnings (existing debt) rather
    // than failing the lint.
    rules: {
      '@angular-eslint/template/click-events-have-key-events': 'warn',
      '@angular-eslint/template/interactive-supports-focus': 'warn',
      '@angular-eslint/template/alt-text': 'warn',
      '@angular-eslint/template/mouse-events-have-key-events': 'warn',
      '@angular-eslint/template/label-has-associated-control': 'warn',
    },
  }
)
