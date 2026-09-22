// src/lib/dominantColor.js
//
// Computes an approximate dominant color for a (remote) image at build time,
// so the post-hero background can match the post's thumbnail instead of
// always using the fixed brand gradient.
//
// Works by downscaling the image to a tiny canvas and averaging pixels,
// weighted towards more saturated pixels so a strong color (e.g. red
// jacket on a grey background) actually "wins" instead of being diluted
// into a flat grey average.

import { createCanvas, loadImage } from '@napi-rs/canvas';
import path from 'node:path';

const cache = new Map();
// Astro serves everything in /public/ as-is from the site root, so an
// image field like "/images/foo.jpg" in frontmatter maps to this folder
// on disk at build time.
const PUBLIC_DIR = path.join(process.cwd(), 'public');

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r: h = ((g - b) / d) % 6; break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, s, l];
}

/**
 * @param {string} src - image URL (or local path) to sample
 * @returns {Promise<{r:number,g:number,b:number,css:string}|null>}
 */
export async function getDominantColor(src) {
  if (!src) return null;
  if (cache.has(src)) return cache.get(src);

  const result = await (async () => {
    try {
      let img;
      if (/^https?:\/\//i.test(src)) {
        // @napi-rs/canvas's own URL loader has no User-Agent and no
        // timeout, so some CDNs (Unsplash included) silently hang or
        // refuse it. Fetch it ourselves first, with a real UA and a
        // timeout, then hand loadImage a raw buffer instead of a URL.
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        try {
          const res = await fetch(src, {
            signal: controller.signal,
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; hmrctax-build/1.0)' },
          });
          if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText} for ${src}`);
          const buf = Buffer.from(await res.arrayBuffer());
          img = await loadImage(buf);
        } finally {
          clearTimeout(timeout);
        }
      } else {
        // Accept any local path form ("/images/x.jpg", "./images/x.jpg",
        // "images/x.jpg") — all of these mean "relative to /public" in
        // this project, not a real filesystem path, so strip any leading
        // "/" or "./" before joining with PUBLIC_DIR.
        const relPath = src.replace(/^\.?\//, '');
        img = await loadImage(path.join(PUBLIC_DIR, relPath));
      }
      const SIZE = 32;
      const canvas = createCanvas(SIZE, SIZE);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, SIZE, SIZE);
      const { data } = ctx.getImageData(0, 0, SIZE, SIZE);

      // Bucket pixels by hue (15° wide, 24 buckets) and let the bucket
      // with the most saturation-weighted "votes" win, then average only
      // within that bucket. This picks ONE vivid dominant color (e.g.
      // "the yellow") instead of blending yellow + brown + grey into a
      // muddy average, which is what a single running sum does.
      const BUCKETS = 24;
      const bucketWeight = new Array(BUCKETS).fill(0);
      const bucketR = new Array(BUCKETS).fill(0);
      const bucketG = new Array(BUCKETS).fill(0);
      const bucketB = new Array(BUCKETS).fill(0);

      let rSumFallback = 0, gSumFallback = 0, bSumFallback = 0, wSumFallback = 0;
      let maxSat = 0;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
        if (a < 128) continue;
        const [h, s, l] = rgbToHsl(r, g, b);
        if (s > maxSat) maxSat = s;

        // Vote weight: saturation squared (so vivid pixels dominate),
        // pulled down a bit at extreme darks/lights where hue is unreliable.
        const weight = Math.pow(s, 2) * (1 - Math.abs(l - 0.5) * 1.1);
        const bucket = Math.floor(h / (360 / BUCKETS)) % BUCKETS;
        bucketWeight[bucket] += weight;
        bucketR[bucket] += r * weight;
        bucketG[bucket] += g * weight;
        bucketB[bucket] += b * weight;

        // Neutral-tolerant fallback average, used only if the whole
        // image turns out to be genuinely grayscale.
        const fw = 0.15 + s * (1 - Math.abs(l - 0.5) * 1.4);
        rSumFallback += r * fw;
        gSumFallback += g * fw;
        bSumFallback += b * fw;
        wSumFallback += fw;
      }

      // Too little saturated color anywhere (a true grayscale photo) —
      // fall back to the soft neutral average instead of picking noise.
      if (maxSat < 0.12) {
        if (wSumFallback === 0) return null;
        const r = Math.round(rSumFallback / wSumFallback);
        const g = Math.round(gSumFallback / wSumFallback);
        const b = Math.round(bSumFallback / wSumFallback);
        const [h, s, l] = rgbToHsl(r, g, b);
        return { r, g, b, h, s, l, css: `rgb(${r}, ${g}, ${b})` };
      }

      let winner = 0;
      for (let i = 1; i < BUCKETS; i++) {
        if (bucketWeight[i] > bucketWeight[winner]) winner = i;
      }
      const r = Math.round(bucketR[winner] / bucketWeight[winner]);
      const g = Math.round(bucketG[winner] / bucketWeight[winner]);
      const b = Math.round(bucketB[winner] / bucketWeight[winner]);
      const [h, s, l] = rgbToHsl(r, g, b);
      return { r, g, b, h, s, l, css: `rgb(${r}, ${g}, ${b})` };
    } catch (err) {
      // Network/format issue — fall back to the default brand gradient,
      // but log so it's visible in the build output instead of silently
      // showing the wrong hero color.
      console.warn(`[dominantColor] Could not sample "${src}":`, err?.message || err);
      return null;
    }
  })();

  cache.set(src, result);
  return result;
}

/**
 * Builds a vivid, readable hero gradient anchored to the image's dominant
 * hue. Works in HSL and forces saturation up rather than just darkening
 * the sampled RGB — darkening alone mutes a bright yellow/red toward a
 * muddy brown, which isn't what "vivid" should look like. Lightness is
 * still kept low enough that white text stays legible.
 */
export function heroGradientFrom(color) {
  if (!color) return null;
  const { h, s } = color;
  // Grayscale-fallback colors have near-zero saturation — don't force
  // those vivid, or a genuinely neutral photo gets a weird tinted hero.
  if (s < 0.08) {
    const { r, g, b } = color;
    const dark = `rgb(${Math.round(r * 0.18)}, ${Math.round(g * 0.18)}, ${Math.round(b * 0.18)})`;
    const mid = `rgb(${Math.round(r * 0.55)}, ${Math.round(g * 0.55)}, ${Math.round(b * 0.55)})`;
    return `linear-gradient(135deg, ${dark}, ${mid})`;
  }
  const sat = Math.max(65, Math.round(s * 100));
  const dark = `hsl(${Math.round(h)}, ${sat}%, 14%)`;
  const mid = `hsl(${Math.round(h)}, ${sat}%, 32%)`;
  return `linear-gradient(135deg, ${dark}, ${mid})`;
}
