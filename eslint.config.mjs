// ESLint flat config. Strict type-checked rules run against the TypeScript 6
// compatibility package (bare `typescript` specifier), while `tsc` is
// TypeScript 7.0.2. See README for the dual-compiler setup.
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    ignores: ['dist/**', 'node_modules/**', 'docs/**']
  },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'error',
      // Project convention requires explicit annotations on variables, so
      // trivially inferrable ones (e.g. `: string = '...'`) are kept.
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        { accessibility: 'explicit' }
      ],
      '@typescript-eslint/typedef': [
        'error',
        {
          variableDeclaration: true,
          parameter: true,
          arrowParameter: true,
          propertyDeclaration: true,
          memberVariableDeclaration: true
        }
      ],
      'no-restricted-properties': [
        'error',
        {
          object: 'Math',
          property: 'random',
          message: 'Use the random namespace instead of Math.random.'
        }
      ]
    }
  },
  {
    files: ['**/*.mjs', '**/*.cjs', '**/*.d.mts'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly'
      }
    },
    // Declaration files contain no runtime code, so type-aware rules that
    // need parser services (e.g. commitlint.rules.d.mts, which is outside
    // the type-checked src/tests roots) are disabled for them.
    extends: [tseslint.configs.disableTypeChecked]
  },
  eslintPluginPrettierRecommended
]);
