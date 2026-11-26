# AV Interior Decoration

Static website for AV Interior Decoration (Thoothukudi, Tamil Nadu), generated from `tools/content.mjs` into `public/` and deployed on Vercel.

## Commands

| Command | Action |
| --- | --- |
| `npm run build` | Generate pages, minified CSS, `sitemap.xml`, `robots.txt`, `llms.txt`, and `llms-full.txt` into `public/`. |
| `npm start` | Local preview at <http://127.0.0.1:3000> with clean URLs and production security headers. |
| `npm test` | Build and run link, asset, SEO/AEO, and security checks (`tools/check.mjs`). |
| `npm run sync` | Optimize images (`assets-src/` + `assets-src/categories/<slug>/`), rebuild, and run checks. |
| `npm run reviews:sync` | Sync live Google Reviews via Featurable into `tools/google-reviews.json`, rebuild, and run checks. |
| `npm run logo` | Regenerate WebP logo marks, favicons, and app icons from `assets-src/logo-actual.png`. |

## Adding Category Photos (Git Push)

1. Drop `.jpg`, `.png`, `.webp`, or `.avif` photos into `assets-src/categories/<service-slug>/` (filename becomes the caption).
2. Run `npm run sync`, commit, and `git push`.

## Google Reviews Auto-Sync

`.github/workflows/sync-reviews.yml` runs every 6 hours using the public `featurableWidgetId` in `tools/content.mjs` (no GitHub Secrets required) and auto-commits `tools/google-reviews.json` + rebuilt `public/` whenever reviews change.
