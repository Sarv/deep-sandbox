const js = require('@eslint/js');
const securityPlugin = require('eslint-plugin-security');

module.exports = [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'script',
      globals: {
        // Add any global variables used in your script
        console: 'readonly',
        Math: 'readonly',
        JSON: 'readonly',
        Date: 'readonly',
        RegExp: 'readonly',
        Error: 'readonly',
        TypeError: 'readonly',
        RangeError: 'readonly',
        SyntaxError: 'readonly',
        util: 'readonly',
        main: 'writable',
        Object: 'writable'
      },
    },
    plugins: {
      security: securityPlugin,
    },
    rules: {
      // ESLint core rules
      "curly": ["error", "all"],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      //'no-unused-vars': ['off', { 'argsIgnorePattern': '^_', 'varsIgnorePattern': '^main$' }],
      'no-unused-vars' : 'off',
      'no-redeclare': ['error', { builtinGlobals: false }],
  

      // Security plugin rules
     // 'security/detect-object-injection': 'warn', // Keep as warning for now
      'security/detect-non-literal-regexp': 'error',
      'security/detect-unsafe-regex': 'error',
      'security/detect-buffer-noassert': 'error',
      'security/detect-child-process': 'error',
      'security/detect-disable-mustache-escape': 'error',
      'security/detect-eval-with-expression': 'error',
      'security/detect-no-csrf-before-method-override': 'error',
      'security/detect-non-literal-fs-filename': 'error',
      'security/detect-pseudoRandomBytes': 'error',
      'security/detect-possible-timing-attacks': 'error',
    },
  },
];