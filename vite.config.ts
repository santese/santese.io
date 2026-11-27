// Vite+ configuration for formatting (Oxfmt) and linting (Oxlint) only.
// Astro does not read this file: it builds its own Vite config from astro.config.mjs.
import { defineConfig } from 'vite-plus';

export default defineConfig({
  fmt: {
    singleQuote: true,
    printWidth: 100,
    astro: true,
    ignorePatterns: ['dist/**', '.astro/**', 'pnpm-lock.yaml'],
  },
  lint: {
    ignorePatterns: ['dist/**', '.astro/**'],
  },
});
