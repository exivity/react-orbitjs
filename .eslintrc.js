module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  env: {
    browser: true,
  },
  plugins: [
    'prettier',
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    "prettier/typescript",
    "prettier/react"
  ],

  // 0 = off, 1 = warn, 2 = error
  rules: {
    // typescript
    '@typescript-eslint/explicit-member-accessibility': 'off', // private fields are coming to native JS classes
    '@typescript-eslint/explicit-function-return-type': 'off', // TS is pretty good at inference
    '@typescript-eslint/no-use-before-define': 'off', // this doesn't matter for side-effect-free modules
    '@typescript-eslint/interface-name-prefix': 'off', // require interfaces start with I
    '@typescript-eslint/no-non-null-assertion': 'off', // TS doesn't work with assert
    '@typescript-eslint/no-object-literal-type-assertion': 'off', // don't know enough TS, I guess

    'no-undef': 'off',
    'no-unused-vars': 'off',
    'no-fallthrough': 'off', // shorthand
    'no-case-declarations': 'off',

    // docs
    "require-jsdoc": 'off',

    // handled by prettier
    'prettier/prettier': 'error',
    '@typescript-eslint/indent': 'off',
  },
  overrides: [
    // type-defs
    {
      files: ['types/**'],
      rules: {
        '@typescript-eslint/interface-name-prefix': 'off'
      }
    },
    // node / config files
    {
      files: [
        'config/**/*.js',
        'tests/karma.conf.js',
        'tests/test-setup.js',
        'tests/karma.conf.js',
      ],
      rules: {
        'no-console': 'off',
        '@typescript-eslint/no-var-requires': 'off'
      },
      parserOptions: {
        sourceType: 'script',
        ecmaVersion: 2015
      },
      env: {
        browser: false,
        node: true
      }
    }
  ]
};
