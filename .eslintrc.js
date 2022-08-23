module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'nestjs'],
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:nestjs/recommended'
  ],
  root: true,
  env: {
    node: true,
    jest: true
  },
  rules: {
    "@typescript-eslint/no-explicit-any": ["off"],
    "@typescript-eslint/no-unused-vars": ["warn"],
    "@typescript-eslint/ban-ts-comment": ["error"],
    "@typescript-eslint/no-empty-function": ["error"],
    "@typescript-eslint/ban-types": ["error"],
    "@typescript-eslint/no-var-requires": ["error"],
    "@typescript-eslint/no-inferrable-types": ["error"],
    "require-await": ["error"],
    "@typescript-eslint/no-floating-promises": ["error"],
    "max-len": ["off"],
    'semi': [1, 'always'],
    "comma-dangle": ["error", "always-multiline"],
    "eol-last": ["error"]
  },
  ignorePatterns: [
    '/apps/**/*.e2e-spec.ts',
    '/apps/**/*.e2e-spe!.ts'
  ]
};
