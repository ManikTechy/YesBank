module.exports = {
  extends: 'airbnb-base',

  parser: 'babel-eslint',
  plugins: ['flowtype'],

  env: {
    browser: true,
    jest: true,
    jasmine: true,
  },

  globals: {
    fetch: true,
    __DEV__: true,
    __VERSION__: true,
    __: true,
    ga: true,
    __RAVEN_ENV__: true,
  },

  plugins: [
    'react',
    'flowtype',
  ],

  rules: {
    'arrow-body-style': 0,
    'arrow-parens': 0,
    'class-methods-use-this': 0,
    // I disable this line because prettier will enforce this
    'comma-dangle': 0,
    'flowtype/define-flow-type': 1,
    'flowtype/use-flow-type': 1,
    'function-paren-newline': 0, // prettier enforced
    'import/no-extraneous-dependencies': 0,
    'import/prefer-default-export': 0,
    'indent': 0,
    'jsx-a11y/no-noninteractive-element-interactions': 0,
    'max-len': 0,
    'new-cap': 0,
    'newline-per-chained-call': 0,
    'no-confusing-arrow': 0,
    'no-duplicate-imports': 0,
    'no-mixed-operators': 0,
    'no-return-assign': 0,
    'no-template-curly-in-string': 0,
    'no-underscore-dangle': 0,
    'no-unused-vars': [
      2,
      {
        varsIgnorePattern: 'debug',
      },
    ],
    'no-use-before-define': 0,
    'no-void': 0,
    'object-curly-spacing': 0,
    'object-curly-newline': 0, // prettier enforced
    'react/forbid-prop-types': 0,
    'react/jsx-closing-bracket-location': 0,
    'react/jsx-filename-extension': 0,
    'react/jsx-indent-props': 0,
    'react/jsx-indent': 0,
    'react/jsx-wrap-multilines': 0,
    'react/jsx-uses-react': 2,
    'react/jsx-uses-vars': 2,
    'react/no-array-index-key': 0,
    'react/prefer-stateless-function': 0,
    'react/require-default-props': 0,
    'react/sort-comp': 0,
    'space-in-parens': 0,
    'quotes': 0, // prettier enforced
    'operator-linebreak': 0, // prettier enforced
    'implicit-arrow-linebreak': 0, // prettier enforced
    'no-else-return': 0,
  },
};
