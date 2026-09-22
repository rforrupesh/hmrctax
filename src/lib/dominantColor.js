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
      const primary = { r, g, b, h, s, l, css: `rgb(${r}, ${g}, ${b})` };

      // Look for a genuine second color (e.g. a teal shirt next to a
      // yellow background, green grass next to a red jacket) instead of
      // only ever surfacing the single winning bucket. A bucket only
      // qualifies if its hue is far enough from the winner's to actually
      // read as a different color, and it carries a real share of the
      // vote — not just noise a few pixels away from the winning hue.
      const bucketAngle = 360 / BUCKETS;
      let runnerUp = -1;
      for (let i = 0; i < BUCKETS; i++) {
        if (i === winner) continue;
        const angDist = Math.min(
          Math.abs(i - winner) * bucketAngle,
          360 - Math.abs(i - winner) * bucketAngle
        );
        if (angDist < 45) continue; // too close to the winner's hue
        if (bucketWeight[i] < bucketWeight[winner] * 0.35) continue; // too minor
        if (runnerUp === -1 || bucketWeight[i] > bucketWeight[runnerUp]) runnerUp = i;
      }

      let secondary = null;
      if (runnerUp !== -1) {
        const r2 = Math.round(bucketR[runnerUp] / bucketWeight[runnerUp]);
        const g2 = Math.round(bucketG[runnerUp] / bucketWeight[runnerUp]);
        const b2 = Math.round(bucketB[runnerUp] / bucketWeight[runnerUp]);
        const [h2, s2, l2] = rgbToHsl(r2, g2, b2);
        secondary = { r: r2, g: g2, b: b2, h: h2, s: s2, l: l2, css: `rgb(${r2}, ${g2}, ${b2})` };
      }

      return { ...primary, secondary };
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

// Unlike red or blue, yellow physically stops looking "yellow" once you
// push its lightness down much past ~25-30% — it reads as olive/brown
// instead, because yellow's own hue band is inherently high-lightness
// (pure #FFFF00 is already L=50%, versus L=50% pure blue/red looking
// "normal"). A flat 14% floor for every hue is what made the yellow
// swatch look muddy while red/blue kept their character at the same
// lightness. Push the floor up specifically around the yellow band and
// taper back down to the normal floor away from it.
function darkLightnessForHue(h) {
  const BASE = 14;
  const YELLOW_CENTER = 55;
  const YELLOW_BOOST = 12; // up to 26% right at pure yellow
  const YELLOW_SPREAD = 35; // degrees either side where the boost tapers off
  const dist = Math.min(Math.abs(h - YELLOW_CENTER), 360 - Math.abs(h - YELLOW_CENTER));
  const boost = Math.max(0, 1 - dist / YELLOW_SPREAD);
  return BASE + boost * YELLOW_BOOST;
}

/**
 * Returns the ordered {offset, color} stops for the hero gradient, without
 * committing to any particular CSS/canvas syntax. Both the browser-facing
 * CSS gradient (heroGradientFrom, below) and the @napi-rs/canvas OG-image
 * generator (scripts/generate-og-images.mjs) build their gradient from
 * these same stops, so the yellow-lightness fix and the dual-hue fix live
 * in exactly one place instead of being reimplemented per-consumer.
 */
export function heroGradientStops(color) {
  if (!color) return null;
  const { h, s, secondary } = color;
  // Grayscale-fallback colors have near-zero saturation — don't force
  // those vivid, or a genuinely neutral photo gets a weird tinted hero.
  if (s < 0.08) {
    const { r, g, b } = color;
    const dark = `rgb(${Math.round(r * 0.18)}, ${Math.round(g * 0.18)}, ${Math.round(b * 0.18)})`;
    const mid = `rgb(${Math.round(r * 0.55)}, ${Math.round(g * 0.55)}, ${Math.round(b * 0.55)})`;
    return [
      { offset: 0, color: dark },
      { offset: 1, color: mid },
    ];
  }

  const sat = Math.max(65, Math.round(s * 100));
  const darkL = darkLightnessForHue(h);
  const midL = darkL + 18;
  const dark = `hsl(${Math.round(h)}, ${sat}%, ${Math.round(darkL)}%)`;
  const mid = `hsl(${Math.round(h)}, ${sat}%, ${Math.round(midL)}%)`;

  if (!secondary) {
    return [
      { offset: 0, color: dark },
      { offset: 1, color: mid },
    ];
  }

  // Give the secondary hue its own stops so it actually shows up in the
  // gradient rather than being averaged/overridden away.
  const sat2 = Math.max(65, Math.round(secondary.s * 100));
  const darkL2 = darkLightnessForHue(secondary.h);
  const midL2 = darkL2 + 18;
  const dark2 = `hsl(${Math.round(secondary.h)}, ${sat2}%, ${Math.round(darkL2)}%)`;
  const mid2 = `hsl(${Math.round(secondary.h)}, ${sat2}%, ${Math.round(midL2)}%)`;

  return [
    { offset: 0, color: dark },
    { offset: 0.4, color: mid },
    { offset: 0.6, color: mid2 },
    { offset: 1, color: dark2 },
  ];
}

/**
 * Builds a vivid, readable CSS hero gradient anchored to the image's
 * dominant hue (for use directly as a `background` value in Astro/CSS).
 * Works in HSL and forces saturation up rather than just darkening the
 * sampled RGB — darkening alone mutes a bright yellow/red toward a muddy
 * brown, which isn't what "vivid" should look like. The "dark" stop's
 * lightness floor also adapts to hue (see darkLightnessForHue) since
 * yellow goes muddy/brown at a lightness red and blue are still fine at.
 * When a genuine second hue was found in the image (e.g. a teal shirt
 * against a yellow wall), it gets its own stop in the gradient instead of
 * the whole hero being flattened to one color.
 */
export function heroGradientFrom(color) {
  const stops = heroGradientStops(color);
  if (!stops) return null;
  const parts = stops.map(({ offset, color }) => `${color} ${Math.round(offset * 100)}%`);
  return `linear-gradient(135deg, ${parts.join(', ')})`;
}
