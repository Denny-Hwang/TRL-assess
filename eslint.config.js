import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default tseslint.config(
  {
    ignores: [
      'dist',
      'coverage',
      'node_modules',
      'playwright-report',
      'test-results',
      'docs/spec/BUILD_SPEC.md',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      // Principle 1: client-side only — no runtime network calls.
      'no-restricted-globals': [
        'error',
        { name: 'fetch', message: 'TRL Assess is client-side only: no network calls at runtime.' },
        { name: 'XMLHttpRequest', message: 'No network calls at runtime.' },
        { name: 'WebSocket', message: 'No network calls at runtime.' },
      ],
      'no-restricted-properties': [
        'error',
        { object: 'navigator', property: 'sendBeacon', message: 'No telemetry.' },
        { object: 'window', property: 'fetch', message: 'No network calls at runtime.' },
      ],
    },
  },
  {
    files: ['scripts/**/*.ts', 'tests/**/*.{ts,tsx}', 'vite.config.ts', 'playwright.config.ts'],
    rules: {
      'no-restricted-globals': 'off',
      'no-restricted-properties': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
);
