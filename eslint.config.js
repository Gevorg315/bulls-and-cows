import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      'no-var': 'error',
      'prefer-const': 'error',
      'no-console': 'warn',
    },
  },
  {
    files: ['tests/**/*.ts'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['*.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
  eslintConfigPrettier,
);
