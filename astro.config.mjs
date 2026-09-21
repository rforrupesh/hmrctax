import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://rforrupesh.github.io',
  base: '/hmrctax',
  integrations: [sitemap()],
  build: {
    format: 'directory'
  }
});
