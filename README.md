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
| `npm run reviews:sync` | Sync live Google Reviews into `tools/google-reviews.json`, rebuild pages, and run checks. |
| `npm test` | Same as `npm run check` (used by CI / pre-deploy). |
| `npm run optimize` | Re-cut WebP variants from `assets-src/` (and `assets-src/categories/<slug>/`) and update manifests. |
| `npm run sync` | Optimize new photos, rebuild all pages, and run link + security checks in one step. |
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
- `testimonials` — real client reviews for the home page (`name`, `place`,
  `rating`, `text`). It is intentionally empty: until real quotes are added, the
  reviews section shows the Google reviews link and the review form.

After editing, run `npm run build` and commit the regenerated `public/` files.
The build also generates `public/llms.txt` and `public/llms-full.txt` for AI answer engines (AEO).

## Images

`npm run optimize` reads originals from `assets-src/`, writes WebP variants to
`public/assets/img/` and records each file's **actual** pixel size in
`tools/image-manifest.json`. The build uses that manifest for `width`/`height`
and `srcset`, so a small source that cannot be enlarged is never advertised at a
width it does not have. The generator also de-duplicates variants that resolve
to the same actual width.

To add photos under a service category (static git-push workflow):

1. Drop `.jpg`, `.png`, `.webp`, or `.avif` photos into `assets-src/categories/<service-slug>/` (e.g. `assets-src/categories/modular-kitchens/l-shaped-pvc-kitchen.jpg`).
2. Run `npm run sync` — this generates responsive WebP variants, strips EXIF/GPS metadata, rebuilds the pages, and runs link + security checks.
3. Commit and `git push` to deploy.

To display Google Reviews automatically on the homepage (`#reviews`), JSON-LD (`AggregateRating` + `Review`), and `llms-full.txt`:

- **Automatic sync via GitHub Actions** (`.github/workflows/sync-reviews.yml` runs every 6 hours and on manual trigger):
  Add **either** of these in **GitHub → Repo Settings → Secrets and variables → Actions**:
  - **Free, no Google Cloud billing (Featurable)**: `FEATURABLE_WIDGET_ID` (from featurable.com connected to your Google Business Profile)
  - **Official Google Places API (New)**: `GOOGLE_PLACES_API_KEY` and `GOOGLE_PLACE_ID` (`ChIJ...`)
  Whenever a new review or rating change is detected, GitHub Actions updates `tools/google-reviews.json`, rebuilds `public/`, verifies all security/SEO checks, and pushes — triggering an automatic Vercel deploy.
- **Manual local sync**: Put the same variables in a local `.env` file and run `npm run reviews:sync`, or edit `tools/google-reviews.json` directly and run `npm test`.

To open Google's direct 5-star review popup from the "Write a Google review" button, set `googlePlaceId` (or `googleReviewLink`) in `tools/content.mjs` and run `npm run build`.

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
