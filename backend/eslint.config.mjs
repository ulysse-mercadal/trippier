// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import header from 'eslint-plugin-header';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Workaround for eslint-plugin-header not having a schema, which is required by ESLint 9
header.rules.header.meta = {
  ...header.rules.header.meta,
  schema: [
    {
      oneOf: [
        { type: 'string', enum: ['line', 'block'] },
        {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['line', 'block'] },
            content: { type: 'string' },
            alt: { type: 'string' },
          },
          required: ['type', 'content'],
          additionalProperties: false,
        },
      ],
    },
    {
      oneOf: [
        { type: 'string' },
        {
          type: 'array',
          items: { type: 'string' },
        },
      ],
    },
    {
      type: 'number',
      minimum: 1,
    },
  ],
};

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    plugins: {
      header,
    },
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
      'header/header': [
        'error',
        'line',
        [
          ' **************************************************************************',
          '',
          '  Trippier Project - API',
          '',
          '  By: Ulysse Mercadal',
          '  Email: ulyssemercadal@kakao.com',
          '',
          ' **************************************************************************',
        ],
        2,
      ],
    },
  },
);
