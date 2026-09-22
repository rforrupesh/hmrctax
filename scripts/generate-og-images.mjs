// scripts/generate-og-images.mjs
//
// Generates one PNG (1200x630) per salary page, saved to /public/og/{salary}-annually.png
// Run this BEFORE `astro build` — see package.json "build" script.
//
// Requires: npm install @napi-rs/canvas

import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';
import { getSalaryList, calculateTax, fmt } from '../src/lib/tax.js';

const salaries = getSalaryList();

function drawImage(salary) {
  const result = calculateTax(salary);
  const W = 1200, H = 630;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#00703c';
  ctx.fillRect(0, 0, W, H);

  const pad = 70;

  ctx.fillStyle = '#e8f3ec';
  ctx.font = '30px sans-serif';
  ctx.fillText(`${fmt(salary)} After Tax UK`, pad, 100);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 88px sans-serif';
  ctx.fillText(fmt(result.net), pad, 220);

  ctx.fillStyle = '#cfe8da';
  ctx.font = '30px sans-serif';
  ctx.fillText('take-home per year', pad, 262);

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pad, 300);
  ctx.lineTo(W - pad, 300);
  ctx.stroke();

  const items = [
    ['Income Tax', fmt(result.tax)],
    ['National Insurance', fmt(result.ni)],
    ['Per month', fmt(result.monthly)],
  ];
  const colW = (W - 2 * pad) / 3;
  items.forEach(([label, val], i) => {
    const x = pad + i * colW;
    ctx.fillStyle = '#cfe8da';
    ctx.font = '28px sans-serif';
    ctx.fillText(label, x, 355);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 38px sans-serif';
    ctx.fillText(val, x, 400);
  });

  ctx.fillStyle = '#0b0c0c';
  ctx.fillRect(0, H - 90, W, 90);

  ctx.fillStyle = '#ffdd00';
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText('hmrctax.co.uk', pad, H - 32);

  ctx.fillStyle = '#ffffff';
  ctx.font = '26px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('2025/26 tax year', W - pad, H - 32);
  ctx.textAlign = 'left';

  return canvas;
}

const outDir = path.join(process.cwd(), 'public', 'og');
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

for (const salary of salaries) {
  const canvas = drawImage(salary);
  const png = canvas.encodeSync('png');
  writeFileSync(path.join(outDir, `${salary}-annually.png`), png);
  console.log(`✓ og/${salary}-annually.png`);
}

console.log(`\nDone. Generated ${salaries.length} OG images in /public/og/`);
