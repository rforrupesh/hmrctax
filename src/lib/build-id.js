// src/lib/build-id.js
//
// A single version string computed once per build. Append this as a
// `?v=` query param to any static asset (OG images, etc.) so that when
// you deploy an update, browsers fetch the new file instead of serving
// a stale cached copy — without requiring the visitor to hard-reload.
//
// In GitHub Actions, GITHUB_SHA (the commit hash) is used so the same
// build always produces the same version id. Locally it falls back to
// the current timestamp.

export const BUILD_ID = process.env.GITHUB_SHA
  ? process.env.GITHUB_SHA.slice(0, 8)
  : String(Date.now());
