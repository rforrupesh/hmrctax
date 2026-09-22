// src/lib/blog.js
//
// Small shared helpers used by the blog index, tag pages, category pages,
// and author page — so date formatting and slugification stay identical
// everywhere a post is listed.

export function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
}

export function initials(title) {
  return title.trim().charAt(0).toUpperCase();
}

export function slugify(value) {
  return value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// A post's category defaults to its first tag when no explicit category is set.
export function categoryOf(post) {
  return post.data.category || post.data.tags?.[0] || 'General';
}

export function authorOf(post) {
  return post.data.author || 'hmrctax team';
}

// Simple word-count based estimate, same rough math most blogs use
// (~200 words per minute). post.body is the raw markdown string that
// Astro content-collection entries expose without needing render().
export function readTimeOf(post) {
  const words = (post.body || '').trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

const PALETTES = [
  ['#00703c', '#1d70b8'],
  ['#1d70b8', '#0b0c0c'],
  ['#0b0c0c', '#00703c'],
];

export function paletteFor(index) {
  return PALETTES[index % PALETTES.length];
}
