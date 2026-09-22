// scripts/generate-sitemaps.mjs
//
// Generates:
//   /public/sitemap-index.xml   -> index referencing the two files below
//   /public/sitemap-pages.xml   -> home, about, contact, blog, privacy, terms
//   /public/tax-calculator.xml  -> /tax-calculator/ + every /tax-calculator/{salary}-annually/ page
//
// Run this BEFORE `astro build` — see package.json "build" script.

import { writeFileSync, readdirSync } from 'fs';
import { getSalaryList } from '../src/lib/tax.js';

const SITE = 'https://rforrupesh.github.io';
const BASE = '/hmrctax/';

const url = (p) => `${SITE}${BASE}${p}`;

// Blog slugs are read straight from src/content/blog/ so a new .md file
// shows up in the sitemap automatically — nothing to update here.
const blogSlugs = readdirSync('src/content/blog')
  .filter((f) => f.endsWith('.md'))
  .map((f) => f.replace(/\.md$/, ''));

// ---- 1. Static / content pages ----
const pages = [
  '',
  'about/',
  'contact/',
  'privacy-policy/',
  'terms/',
  'blog/',
  ...blogSlugs.map((slug) => `blog/${slug}/`),
];

const pagesXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${url(p)}</loc></url>`).join('\n')}
</urlset>
`;

// ---- 2. Tax calculator pages (salary list) ----
const salaries = getSalaryList();

const calcPages = [
  'tax-calculator/',
  ...salaries.map((s) => `tax-calculator/${s}-annually/`),
];

const calcXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${calcPages.map((p) => `  <url><loc>${url(p)}</loc></url>`).join('\n')}
</urlset>
`;

// ---- 3. Sitemap index ----
const indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${url('sitemap-pages.xml')}</loc></sitemap>
  <sitemap><loc>${url('tax-calculator.xml')}</loc></sitemap>
</sitemapindex>
`;

writeFileSync('public/sitemap-pages.xml', pagesXml);
writeFileSync('public/tax-calculator.xml', calcXml);
writeFileSync('public/sitemap-index.xml', indexXml);

console.log(`✓ sitemap-pages.xml (${pages.length} urls)`);
console.log(`✓ tax-calculator.xml (${calcPages.length} urls)`);
console.log('✓ sitemap-index.xml');
