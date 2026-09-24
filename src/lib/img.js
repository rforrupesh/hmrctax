import fs from 'node:fs';
import path from 'node:path';
import { withBase } from './url.js';

// Local /images/x.ext ke liye srcset (variants scripts/optimize-images.mjs banati hai).
// Remote image ya variants na hon to undefined -> normal <img src> chalega.
export function imgSrcset(src) {
  if (!src || /^https?:\/\//i.test(src)) return undefined;
  const rel = src.replace(/^\.?\//, '');
  const dir = path.dirname(rel);
  const base = path.basename(rel).replace(/\.[^.]+$/, '');
  const re = new RegExp(`^${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-(\\d+)w\\.webp$`);
  const abs = path.join(process.cwd(), 'public', dir);
  if (!fs.existsSync(abs)) return undefined;
  const list = fs.readdirSync(abs)
    .map((f) => [f, +(f.match(re)?.[1])])
    .filter(([, w]) => w)
    .sort((a, b) => a[1] - b[1])
    .map(([f, w]) => `${withBase(`${dir}/${f}`)} ${w}w`);
  return list.length ? list.join(', ') : undefined;
}
