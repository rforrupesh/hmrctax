// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
//
// Currently deployed at: https://rforrupesh.github.io/hmrctax/
// When you add a custom domain later, change this to:
//   site: 'https://hmrctax.co.uk',
//   base: '/',   (or remove base entirely)
//
// Sitemaps (sitemap-index.xml, sitemap-pages.xml, tax-calculator.xml) are
// generated manually by scripts/generate-sitemaps.mjs (see package.json
// "build" script) so the tax-calculator pages get their own sitemap file.
export default defineConfig({
  site: 'https://rforrupesh.github.io',
  base: '/hmrctax/',
});
