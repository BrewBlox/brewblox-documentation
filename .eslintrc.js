module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    extraFileExtensions: ['.vue'],
  },
  extends: [
    'plugin:vue/recommended',
  ],
  plugins: [
    'vue',
  ],
  rules: {
    'quotes': ['error', 'single', { 'avoidEscape': true }],
    'class-methods-use-this': 0,
    'object-curly-newline': 0,
    'no-param-reassign': 0,
    'no-console': 'warn',
    'no-multiple-empty-lines': 'error',
    'comma-dangle': ['error', 'always-multiline'],
    'semi': ['error', 'always'],
    'max-len': [
      'error',
      120,
      2,
      {
        'ignoreUrls': true,
        'ignoreComments': false,
      },
    ],
    'vue/no-v-html': 0,
    'vue/max-attributes-per-line': ['warn', {
      'singleline': 8,
      'multiline': {
        'max': 1,
        'allowFirstLine': false,
      },
    }],
  },
  // overrides: [
  //   {
  //     files: ['*.js'],
  //     rules: {
  //       '@typescript-eslint/no-var-requires': 'off',
  //       '@typescript-eslint/explicit-function-return-type': 'off',
  //       '@typescript-eslint/explicit-module-boundary-types': 'off',
  //     },
  //   },
  // ],
};
