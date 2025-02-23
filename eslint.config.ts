import eslint from '@eslint/js';
import query from '@tanstack/eslint-plugin-query';
import gitignore from 'eslint-config-flat-gitignore';
import perfectionist from 'eslint-plugin-perfectionist';
import prettier from 'eslint-plugin-prettier/recommended';
import svelte from 'eslint-plugin-svelte';
import * as svelteParser from 'svelte-eslint-parser';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  gitignore(),
  {
    ignores: ['**/*.cjs'],
  },
  eslint.configs.recommended,
  svelte.configs['flat/recommended'],
  svelte.configs['flat/prettier'],
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  query.configs['flat/recommended'],
  {
    plugins: { perfectionist },
    rules: {
      'perfectionist/sort-imports': [
        'warn',
        { type: 'natural', sortSideEffects: true, internalPattern: ['^\\$.*'] },
      ],
      'perfectionist/sort-named-imports': ['warn', { type: 'natural' }],
      'perfectionist/sort-exports': ['warn', { type: 'natural' }],
      'perfectionist/sort-named-exports': ['warn', { type: 'natural' }],
    },
  },
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        extraFileExtensions: ['.svelte'],
        parser: tseslint.parser,
      },
    },
  },
  {
    files: ['**/*.{ts,mts,cts,svelte}'],
    rules: {
      'no-undef': 'off',
      semi: ['error', 'always'],
      quotes: [
        'error',
        'single',
        {
          avoidEscape: true,
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^(\\$\\$|_)',
        },
      ],
      '@typescript-eslint/no-non-null-assertion': 'off',
      'svelte/no-at-html-tags': 'off',
      'svelte/valid-compile': 'off',
    },
  },
  prettier,
  {
    rules: {
      'prettier/prettier': 'warn',
    },
  },
);
