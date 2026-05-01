import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import importX from 'eslint-plugin-import-x'
import prettier from 'eslint-plugin-prettier/recommended'
import promise from 'eslint-plugin-promise'
import sonarjs from 'eslint-plugin-sonarjs'
import unusedImports from 'eslint-plugin-unused-imports'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
  globalIgnores(['dist', 'generated']),
  {
    files: ['**/*.{ts,js}'],
    plugins: {
      'import-x': importX,
      'unused-imports': unusedImports,
    },
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      sonarjs.configs.recommended,
      promise.configs['flat/recommended'],
      prettier,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.node,
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'arrow-body-style': ['error', 'as-needed'],
      'no-empty': ['error', { allowEmptyCatch: true }],

      'import-x/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
          ],
          pathGroups: [
            { pattern: '@/**', group: 'internal', position: 'before' },
          ],
          pathGroupsExcludedImportTypes: ['builtin', 'type'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import-x/no-duplicates': 'warn',
      'import-x/default': 'off',
      'import-x/no-named-as-default-member': 'off',
      'import-x/no-named-as-default': 'off',

      'sonarjs/no-duplicate-string': 'off',
      'sonarjs/prefer-immediate-return': 'off',

      'promise/no-return-wrap': 'off',
      'promise/always-return': 'off',
      'promise/no-promise-in-callback': 'off',
      'promise/prefer-await-to-then': 'warn',

      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',

      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      'prettier/prettier': [
        'error',
        { usePrettierrc: true, endOfLine: 'auto' },
      ],
    },
  },
])
