import perfectionist from 'eslint-plugin-perfectionist';
import jsdoc from 'eslint-plugin-jsdoc';
import stylistic from '@stylistic/eslint-plugin';

export default [
  {
    plugins: { perfectionist, jsdoc, '@stylistic': stylistic },
    rules: {
      // 1. Grouping Structures (catch on new line)
      '@stylistic/brace-style': [ 'error', 'stroustrup' ], // Enforces catch/else on new lines

      // 2. Internal Whitespace (Spaces inside non-empty containers)
      '@stylistic/space-in-parens': [ 'error', 'always', { exceptions: [ 'empty' ] } ], // ( params ) vs ()
      '@stylistic/object-curly-spacing': [ 'error', 'always' ], // { key: 'value' } vs {}
      '@stylistic/array-bracket-spacing': [ 'error', 'always' ], // [ 'value' ] vs []

      // 3. Alphabetical Sorting & Private Methods at Top
      'perfectionist/sort-classes': [ 'error', {
        type: 'alphabetical', order: 'asc',
        groups: [ 'private-methods',  'constructor', 'method' ],// Underscore methods first
        customGroups: [ { groupName: 'private-methods', selector: 'method', elementNamePattern: '^_' } ] // Specifically targets your underscore methods
      } ],

      // 4. Strings (Single quotes, no template literals)
      '@stylistic/quotes': [ 'error', 'single' ],
      'no-template-curly-in-string': 'error',

      // 5. JSDoc Headers
      'jsdoc/require-jsdoc': [ 'error', { require: { ClassDeclaration: true, MethodDefinition: true } } ],
      'jsdoc/require-description': 'error',
      'jsdoc/require-param': 'error',
      'jsdoc/require-returns': 'error',
      'jsdoc/require-example': 'warn'
    }
  }
];
