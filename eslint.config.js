import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    // Scripts, tests and config run on Node (tests also use browser globals under jsdom).
    files: ['scripts/**/*.{js,mjs,cjs}', 'vite-plugins/**/*.js', 'src/**/*.test.{js,jsx}', 'vite.config.js'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
  {
    // Vercel functions run on Node / edge, not in the browser.
    files: ['api/**/*.js'],
    languageOptions: { globals: { ...globals.node } },
  },
])
