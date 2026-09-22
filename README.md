# hmrctax-site

Free UK Income Tax calculator, built with Astro. Homepage has the interactive
calculator; `/tax-calculator/[salary]-annually/` pages are pre-rendered,
SEO-friendly landing pages for specific salary amounts (fully static HTML,
visible in view-source, no JS required to read the numbers).

## Structure

```
src/
  layouts/Layout.astro          shared header, footer, GOV.UK-style theme
  components/Calculator.astro   the interactive calculator (used on homepage
                                 and on every salary page, pre-filled)
  lib/tax.js                    tax calculation logic + master salary list
                                 (shared between pages AND the OG image script)
  pages/
    index.astro                 homepage
    tax-calculator/
      index.astro                /tax-calculator/  (browse by salary, hub page)
      [salary]-annually.astro    /tax-calculator/55000-annually/ etc, generated
                                  from the salary list in lib/tax.js
    blog/
      index.astro
      2025-26-tax-year-changes/  example post -- copy this folder for new posts
    about/, contact/, privacy-policy/, terms/

scripts/
  generate-og-images.mjs        generates one share-preview PNG per salary
                                 page, saved to public/og/{salary}-annually.png
```

## Setup

```bash
npm install
npm run dev        # http://localhost:4321
```

## Adding / changing salary pages

Edit `getSalaryList()` in `src/lib/tax.js` -- every page AND every OG image
is generated from this one list, so you only need to change it in one place.

## Build & deploy

```bash
npm run build       # runs the OG image script, then astro build
```

This generates OG images into `public/og/`, then builds the static site into
`dist/`. Point your GitHub Pages / hosting provider at `dist/`.

Before going live, set the real domain in `astro.config.mjs` (`site:` field) --
this is what the sitemap and canonical URLs are built from.

## Tax rates

Figures use published 2025/26 UK thresholds (Personal Allowance GBP 12,570,
Basic/Higher/Additional rate bands, Class 1 NI). Rates change every tax year --
update `src/lib/tax.js` when HMRC publishes new thresholds.
