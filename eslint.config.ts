import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import gitignore from 'eslint-config-flat-gitignore';
import eslintPluginSvelte from 'eslint-plugin-svelte';
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';
import * as svelteParser from 'svelte-eslint-parser';

export default tseslint.config(
  gitignore(),
  {
    ignores: ['**/*.cjs'],
  },
  eslint.configs.recommended,
  eslintPluginSvelte.configs['flat/recommended'],
  eslintPluginSvelte.configs['flat/prettier'],
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.svelte'],
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
    },
  },
  eslintPluginPrettier,
);
