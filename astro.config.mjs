// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://santese.io',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
});
