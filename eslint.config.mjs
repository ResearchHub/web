import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier/flat';
import workDocumentTracking from './eslint-rules/work-document-tracking.js';

const researchHubPlugin = {
  rules: {
    'work-document-tracking': workDocumentTracking,
  },
};

export default defineConfig([
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    linterOptions: {
      reportUnusedDisableDirectives: false,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'react/no-unescaped-entities': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      'react-hooks/exhaustive-deps': 'off',
      '@next/next/no-async-client-component': 'off',
      'react-hooks/rules-of-hooks': 'off',
      'prefer-const': 'off',
      '@next/next/no-img-element': 'off',
    },
  },
  {
    files: ['app/{paper,post,proposal,question,report}/[[]id[]]/[[]slug[]]/**/page.tsx'],
    plugins: {
      researchhub: researchHubPlugin,
    },
    rules: {
      'researchhub/work-document-tracking': 'error',
    },
  },
  prettier,
  globalIgnores([
    'public/**',
    '.next/**',
    'out/**',
    'build/**',
    'coverage/**',
    'external_references/**',
    '.pnp.*',
    '.yarn/**',
    '.vercel/**',
    '.cursor/**',
    '.claude/**',
    'next-env.d.ts',
  ]),
]);
