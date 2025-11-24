import { globalIgnores } from "eslint/config";
import nextConfig from 'eslint-config-next';

const eslintConfig = [
  globalIgnores([
    ".contentlayer/",
    ".next/",
  ]),
  ...nextConfig,
  {
    rules: {
      '@typescript-eslint/triple-slash-reference': 'off',
    },
  },
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
]

export default eslintConfig
