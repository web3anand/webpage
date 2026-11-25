# Category Photos (Static Git-Push Upload)

Drop project photos into the matching service folder below:

- `modular-kitchens/`
- `false-ceiling/`
- `blinds-and-curtains/`
- `upvc-windows-and-doors/`
- `aluminium-works/`
- `glass-partitions-and-railings/`
- `flooring/`
- `mosquito-nets/`

## How to publish new photos

1. Name the file descriptively (the filename becomes the photo caption), e.g. `l-shaped-pvc-kitchen.jpg`.
   Allowed formats: `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif` (`.svg` is intentionally ignored for security).
2. Run:
   ```bash
   npm run sync
   ```
   This automatically converts photos to responsive WebP variants, strips EXIF/GPS metadata for client privacy, updates the manifests, rebuilds all pages, and runs link + security checks.
3. Commit and `git push` — Vercel deploys the updated gallery automatically.
