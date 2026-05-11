/**
 * ESLint configuration for mw-node-js.
 * Enforces alphabetical sorting, private method prioritization, and strict formatting.
 * @type {import('eslint').Linter.Config[]}
 */
import perfectionist from 'eslint-plugin-perfectionist';
import jsdoc from 'eslint-plugin-jsdoc';
import stylistic from '@stylistic/eslint-plugin';

export default [
  { ignores: [ '**/node_modules/**', '**/logs/**', 'wikiconfig.json', 'package-lock.json', '.env' ] },
  {
    plugins: { perfectionist, jsdoc, '@stylistic': stylistic },
    rules: {
      '@stylistic/no-trailing-spaces': 'error',
      '@stylistic/brace-style': [ 'error', 'stroustrup', { allowSingleLine: true } ],
      '@stylistic/space-in-parens': [ 'error', 'always', { exceptions: [ 'empty' ] } ],
      '@stylistic/object-curly-spacing': [ 'error', 'always' ],
      '@stylistic/array-bracket-spacing': [ 'error', 'always' ],
      'perfectionist/sort-classes': [ 'error', {
        type: 'alphabetical', order: 'asc',
        groups: [ 'private-methods',  'constructor', 'method' ],
        'custom-groups': { groupName: 'private-methods', selector: 'method', 'element-name-pattern': '^_' }
      } ],
      '@stylistic/quotes': [ 'error', 'single' ],
      'no-template-curly-in-string': 'error',
      'jsdoc/require-jsdoc': [ 'error', { require: { ClassDeclaration: true, MethodDefinition: true } } ],
      'jsdoc/require-description': 'error',
      'jsdoc/require-param': 'error',
      'jsdoc/require-returns': 'error',
      'jsdoc/require-example': 'warn'
    }
  }
];