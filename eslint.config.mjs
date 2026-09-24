import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Variables
      // The core rules don't understand TypeScript (types, overloads,
      // enums) and report false positives, so use the typescript-eslint
      // versions instead and turn the core ones off.
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-undef': 'off',
      'no-use-before-define': 'off',
      '@typescript-eslint/no-use-before-define': 'error',
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'warn',

      // Code quality
      eqeqeq: 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'no-duplicate-case': 'error',
      'no-empty': 'warn',
      curly: 'error',

      // Console
      'no-console': 'warn',
    },
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
