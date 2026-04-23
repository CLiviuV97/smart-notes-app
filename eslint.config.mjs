import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';
import testingLibrary from 'eslint-plugin-testing-library';
import jestDom from 'eslint-plugin-jest-dom';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    name: 'prettier',
    ...prettier,
  },
  {
    name: 'testing-library',
    files: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**'],
    ...testingLibrary.configs['flat/react'],
  },
  {
    name: 'jest-dom',
    files: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**'],
    ...jestDom.configs['flat/recommended'],
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;
