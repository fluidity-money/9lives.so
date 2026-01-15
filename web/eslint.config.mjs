import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import prettier from 'eslint-config-prettier/flat'
import jest from "eslint-plugin-jest";
import playwright from "eslint-plugin-playwright";
import tailwind from "eslint-plugin-tailwindcss";
import pluginQuery from '@tanstack/eslint-plugin-query'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  ...tailwind.configs["flat/recommended"],
  ...pluginQuery.configs['flat/recommended'],
  // ======================
  // Jest (__tests__)
  // ======================
  {
    files: ["__tests__/**/*.{js,jsx,ts,tsx}"],
    ...jest.configs['flat/recommended'],
    rules: {
      ...jest.configs['flat/recommended'].rules,
      'jest/prefer-expect-assertions': 'off',
    },
  },
  // ======================
  // Playwright (e2e)
  // ======================
  {
    files: ["e2e/**/*.{js,jsx,ts,tsx}"],
    extends: [playwright.configs['flat/recommended']]
  },
  globalIgnores([
    "out",
    ".next",
    "node_modules",
    // testing
    "coverage",
    "jest-coverage",
    ".v8-coverage",
    "playwright-coverage",
    "test-results",
    "monocart-report",
    "src/gql",
    "src/graffle/accounts/*/**",
    "src/graffle/lives9/*/**",
    "src/graffle/points/*/**"
  ]),
])

export default eslintConfig