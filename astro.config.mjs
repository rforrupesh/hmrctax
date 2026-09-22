// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
//
// Currently deployed at: https://rforrupesh.github.io/hmrctax/
// When you add a custom domain later, change this to:
//   site: 'https://hmrctax.co.uk',
//   base: '/',   (or remove base entirely)
export default defineConfig({
  site: 'https://rforrupesh.github.io',
  base: '/hmrctax/',
  integrations: [sitemap()],
});
