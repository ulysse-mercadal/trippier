import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import header from 'eslint-plugin-header';
import prettier from 'eslint-plugin-prettier/recommended';

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

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    plugins: {
      header,
    },
    rules: {
      'header/header': [
        'error',
        'line',
        [
                    "  Trippier Project - Web App",
                    "",
                    "  By: Ulysse Mercadal",
                    "  Email: ulyssemercadal@kakao.com",
                    "",
                    " **************************************************************************",        ],
        2,
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'eslint.config.mjs',
  ]),
]);

export default eslintConfig;
