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
        // A frontmatter value like "/images/foo.jpg" is a public-folder
        // path, not a filesystem path — resolve it before handing it to
        // loadImage, which only understands real file paths/URLs.
        const localPath = src.startsWith('/') ? path.join(PUBLIC_DIR, src) : src;
        img = await loadImage(localPath);
      }
      const SIZE = 32;
      const canvas = createCanvas(SIZE, SIZE);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, SIZE, SIZE);
      const { data } = ctx.getImageData(0, 0, SIZE, SIZE);

      let rSum = 0, gSum = 0, bSum = 0, wSum = 0;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
        if (a < 128) continue;
        const [, s, l] = rgbToHsl(r, g, b);
        // Weight saturated, mid-brightness pixels higher so a dominant
        // color (e.g. a red jacket) outweighs flat grey/black background.
        const weight = 0.15 + s * (1 - Math.abs(l - 0.5) * 1.4);
        rSum += r * weight;
        gSum += g * weight;
        bSum += b * weight;
        wSum += weight;
      }
      if (wSum === 0) return null;
      const r = Math.round(rSum / wSum);
      const g = Math.round(gSum / wSum);
      const b = Math.round(bSum / wSum);
      return { r, g, b, css: `rgb(${r}, ${g}, ${b})` };
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
 * Builds a dark, readable hero gradient anchored to the image's dominant
 * color (kept dark enough that white text stays legible).
 */
export function heroGradientFrom(color) {
  if (!color) return null;
  const { r, g, b } = color;
  // Darken towards black on one end, keep a muted version of the dominant
  // color on the other — same visual shape as the original brand gradient.
  const dark = `rgb(${Math.round(r * 0.18)}, ${Math.round(g * 0.18)}, ${Math.round(b * 0.18)})`;
  const mid = `rgb(${Math.round(r * 0.55)}, ${Math.round(g * 0.55)}, ${Math.round(b * 0.55)})`;
  return `linear-gradient(135deg, ${dark}, ${mid})`;
}
