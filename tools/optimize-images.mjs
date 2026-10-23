/**
 * AV Interior Decoration — image pipeline.
 *
 * Reads the untouched originals from /assets-src and writes web-optimised
 * WebP derivatives (plus social/Favicon images) into /public/assets/img.
 *
 *   npm install          (installs sharp + the rest)
 *   npm run optimize
 *
 * Re-run this any time you add or replace a photo in /assets-src.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const srcDir = path.join(root, "assets-src");
const outDir = path.join(root, "public", "assets", "img");
fs.mkdirSync(outDir, { recursive: true });

const slug = (file) =>
  path
    .basename(file, path.extname(file))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// widths per source image. Cards/heroes get large variants, thumbnails stay small.
const plan = {
  "hero1.jpg": [960, 1440, 2000],
  "hero2.jpg": [640, 960, 1400],
  "a8.jpg": [640, 960],
  "modular.jpg": [600, 900, 1400],
  "a10.jpg": [700, 1000, 1500],
  "curtains.jpg": [700, 1000],
  "upvcsliding.jpg": [700, 1000, 1400],
  "normalp.jpg": [700, 900],
  "toughen.jpg": [700, 1000],
  "woodenflooring.jpg": [700, 1000, 1400],
  "mosopen.jpg": [600, 900],
  "ssg.jpg": [700, 1000],
  "zebra.jpg": [700, 1000],
  "gypsum.jpg": [700, 1000],
  "upvcopen.jpg": [700, 1000],
  "carpet.jpg": [700, 1000],
  "aluminiumcupboard.jpg": [700, 1000],
  "a12.jpg": [700, 1000],
};

const thumbs = [
  "12mm.jpg", "ss.jpg", "a6.jpg", "roller.jpg", "roman.jpg", "pvcblinds.jpg",
  "wooden.jpg", "venetian.jpg", "bamboo.jpg", "grid.jpg", "pvcceiling.jpg",
  "thermocol.jpg", "apleated.jpg", "honey.jpg", "magnet.jpg", "fiber.jpg",
  "vinyl flooring.jpg", "glassp.jpg", "a1.jpg", "windows.jpg", "aopen.jpg",
  "upvcfixed.jpg", "upvcp.jpg", "tv.jpg", "upvccupboard.jpg", "pvccupboard.jpg",
  "plywood.jpg", "mdf.jpg",
];

for (const f of thumbs) plan[f] = [480, 760];

const report = [];
const manifest = {};
for (const [file, widths] of Object.entries(plan)) {
  const input = path.join(srcDir, file);
  if (!fs.existsSync(input)) {
    console.warn(`missing: ${file}`);
    continue;
  }
  const meta = await sharp(input).metadata();
  for (const w of widths) {
    const target = Math.min(w, meta.width);
    const name = `${slug(file)}-${w}.webp`;
    const out = path.join(outDir, name);
    await sharp(input)
      .rotate()
      .resize({ width: target, withoutEnlargement: true })
      .webp({ quality: 78, effort: 5 })
      .toFile(out);
    const made = await sharp(out).metadata();
    manifest[name] = { w: made.width, h: made.height };
    report.push({ file: name, kb: Math.round(fs.statSync(out).size / 1024) });
  }
}

fs.writeFileSync(
  path.join(root, "tools", "image-manifest.json"),
  JSON.stringify(manifest, null, 2),
);

// ---------------------------------------------------------------- social card
const ogSvg = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#14110E" stop-opacity="0.94"/>
      <stop offset="0.55" stop-color="#14110E" stop-opacity="0.72"/>
      <stop offset="1" stop-color="#14110E" stop-opacity="0.30"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <rect x="72" y="86" width="64" height="2" fill="#C08A4E"/>
  <text x="72" y="128" font-family="Arial, Helvetica, sans-serif" font-size="20" letter-spacing="4" fill="#C08A4E">AV INTERIOR DECORATION</text>
  <text x="72" y="270" font-family="Georgia, 'Times New Roman', serif" font-size="72" fill="#FBF8F3">Interiors from Thoothukudi,</text>
  <text x="72" y="354" font-family="Georgia, 'Times New Roman', serif" font-size="72" fill="#FBF8F3">for homes across Tamil Nadu.</text>
  <text x="72" y="438" font-family="Arial, Helvetica, sans-serif" font-size="26" fill="#E8DFD2">Modular kitchens · False ceilings · UPVC windows · Blinds · Flooring</text>
  <text x="72" y="540" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="#FBF8F3">Thoothukudi   ·   Serving Tamil Nadu   ·   +91 97150 32513</text>
</svg>`;

await sharp(path.join(srcDir, "hero1.jpg"))
  .rotate()
  .resize({ width: 1200, height: 630, fit: "cover", position: "right" })
  .composite([{ input: Buffer.from(ogSvg), top: 0, left: 0 }])
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(path.join(outDir, "og-cover.jpg"));

// ------------------------------------------------------------------- favicons
// The mark itself lives in tools/logo.mjs (npm run logo), which also writes
// favicon.svg and the app icons. Re-run that instead of regenerating here.

const total = report.reduce((n, r) => n + r.kb, 0);
console.log(`wrote ${report.length} WebP files, ${(total / 1024).toFixed(1)} MB total`);
console.log(report.map((r) => `${r.kb} KB  ${r.file}`).join("\n"));
