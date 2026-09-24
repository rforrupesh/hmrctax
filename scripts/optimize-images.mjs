// public/images ki har image ke responsive WebP variants banata hai: name-480w.webp, name-800w.webp, name-<full>w.webp
// Originals untouched. Variants gitignored hain, har build pe regenerate hote hain.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const DIR = path.join(process.cwd(), 'public', 'images');
const WIDTHS = [480, 800, 1200];

for (const f of fs.readdirSync(DIR)) {
  if (!/\.(png|jpe?g|webp)$/i.test(f) || /-\d+w\.webp$/.test(f)) continue;
  const name = f.replace(/\.[^.]+$/, '');
  const { width } = await sharp(path.join(DIR, f)).metadata();
  const sizes = [...new Set([...WIDTHS.filter((w) => w < width), Math.min(width, 1200)])];
  for (const w of sizes) {
    await sharp(path.join(DIR, f)).resize(w).webp({ quality: 78 }).toFile(path.join(DIR, `${name}-${w}w.webp`));
  }
}
