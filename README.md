# AV Interior Decoration — website

A hand-built static site for AV Interior Decoration (Thoothukudi, Tamil Nadu).
No framework and no runtime dependencies: `tools/content.mjs` holds the copy and
`tools/build.mjs` generates every page into `public/`. Those generated files are
what gets deployed.

## Commands

| Command | What it does |
| --- | --- |
| `npm install` | Install the image tooling (`sharp`). Only needed for `optimize` / `logo`. |
| `npm run build` | Regenerate every page, `sitemap.xml`, `robots.txt` and `site.webmanifest`. |
| `npm start` | Preview `public/` at <http://localhost:3000> with clean URLs and the custom 404. |
| `npm run check` | Build, then verify every internal link, image and required root file resolves. |
| `npm test` | Same as `npm run check` (used by CI / pre-deploy). |
| `npm run optimize` | Re-cut WebP variants from `assets-src/` and rewrite `tools/image-manifest.json`. |
| `npm run logo` | Regenerate the logo marks, favicons and app icons. |

Node 20.11 or newer is required (`import.meta.dirname`).

## Structure

```
tools/
  content.mjs          all copy, services, FAQs, NAP details, site config
  build.mjs            page templates + generator (SEO, JSON-LD, srcset, sitemap)
  check.mjs            post-build link/asset checker
  optimize-images.mjs  sharp-based image pipeline (writes the manifest)
  logo.mjs             brand mark, favicon and app icon generator
  serve.mjs            local preview server
  image-manifest.json  generated: real width/height of every image variant
public/                build output — committed, deployed as-is
assets-src/            untouched originals for the image pipeline
```

Pages: home, services index, eight service pages, contact, privacy, terms, 404.

## Editing content

Everything customer-facing lives in `tools/content.mjs`:

- `site` — domain, phone, WhatsApp, address, geo, map links. Fill in
  `postalCode`, `openingHours` and `sameAs` when available; empty values are
  omitted from the structured data rather than published as placeholders.
- `services` — one entry per service page. `slug`, `name`, `title`,
  `description`, `h1`, `intro`, `includes`, `types`, `notes` and `faqs` all feed
  the generated page and its schema.
- `gallery`, `homeFaqs`, `whyPoints`, `processSteps`, `trustPoints` — home page
  sections.

After editing, run `npm run build` and commit the regenerated `public/` files.

## Images

`npm run optimize` reads originals from `assets-src/`, writes WebP variants to
`public/assets/img/` and records each file's **actual** pixel size in
`tools/image-manifest.json`. The build uses that manifest for `width`/`height`
and `srcset`, so a small source that cannot be enlarged is never advertised at a
width it does not have. The generator also de-duplicates variants that resolve
to the same actual width.

To add a photo: drop the original in `assets-src/`, add it to the `plan` (or
`thumbs`) map in `tools/optimize-images.mjs`, run `npm run optimize`, then
reference the base name (e.g. `modular-900`) from `content.mjs`.

## Deployment

Vercel, configured entirely in `vercel.json`:

- `buildCommand: npm run build`, `outputDirectory: public`
- `cleanUrls: true`, `trailingSlash: false` — `/services/modular-kitchens`
  serves `public/services/modular-kitchens.html`; `/sitemap.xml`, `/robots.txt`,
  the manifest and icons are deployed from the output root.
- `404.html` is used for unmatched routes.
- Long-lived immutable caching for `/assets/*` and `/fonts/*`; CSS and JS
  revalidate so a deploy is picked up immediately.

No other routing rules are needed. If you change the build output layout, update
`vercel.json` and `tools/serve.mjs` together — the local server intentionally
mirrors the production URL behaviour.

## Checks before deploying

```bash
npm test
```

The checker fails the build if a link points at a page that was not generated, an
image is missing, or `robots.txt` / `sitemap.xml` / icons are absent. It also
warns about images that ship but are never referenced.
