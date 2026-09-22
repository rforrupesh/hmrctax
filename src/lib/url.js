// src/lib/url.js
//
// Always use this helper to build internal links/asset paths instead of
// manually concatenating `base + path`. It guarantees exactly one slash
// between the base and the path, no matter what BASE_URL looks like
// (with or without a trailing slash) — this is the fix for bugs like
// "/salarycalcog/..." or "/salarycalctax-calculator/..." showing up in links.

export function withBase(path = '') {
  const base = import.meta.env.BASE_URL || '/';
  const normalizedBase = base.endsWith('/') ? base : base + '/';
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return normalizedBase + cleanPath;
}
