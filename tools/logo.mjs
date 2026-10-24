/**
 * Brand asset generator — uses the supplied logo artwork.
 *
 *   npm run logo
 *
 * Source: assets-src/logo-actual.png (beige AV monogram on near-black).
 * Writes a transparent beige mark for dark surfaces, an ink mark for light
 * surfaces, the app icons/favicon and the site-wide OG fallback mark.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const out = path.join(root, "public");
const source = path.join(root, "assets-src", "logo-actual.png");

const BEIGE = { r: 0xd9, g: 0xbc, b: 0x94 };
const INK = { r: 0x2e, g: 0x1b, b: 0x12 };
const WOOD = { r: 0x1b, g: 0x10, b: 0x0b };

const { data, info } = await sharp(source)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height } = info;
const pixels = new Uint8Array(width * height * 4);
let minX = width;
let minY = height;
let maxX = 0;
let maxY = 0;

for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const i = (y * width + x) * 4;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    // The artwork is beige on #0b0b0c. Turn the background into alpha,
    // keeping the antialiased edge soft instead of a hard cut-out.
    const alpha = Math.max(0, Math.min(1, (luma - 14) / 68));
    const a = Math.round(alpha * 255);

    if (a > 10) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }

    pixels[i] = BEIGE.r;
    pixels[i + 1] = BEIGE.g;
    pixels[i + 2] = BEIGE.b;
    pixels[i + 3] = a;
  }
}

const pad = 12;
const crop = {
  left: Math.max(0, minX - pad),
  top: Math.max(0, minY - pad),
  width: Math.min(width - Math.max(0, minX - pad), maxX - minX + pad * 2 + 1),
  height: Math.min(height - Math.max(0, minY - pad), maxY - minY + pad * 2 + 1),
};

const mark = sharp(pixels, { raw: { width, height, channels: 4 } })
  .extract(crop)
  .resize({ width: 800, withoutEnlargement: false });

fs.mkdirSync(path.join(out, "assets", "img"), { recursive: true });

const lightBuffer = await mark.png().toBuffer();
fs.writeFileSync(path.join(out, "assets", "img", "logo-mark.png"), lightBuffer);

const inkPixels = Buffer.from(pixels);
for (let i = 0; i < inkPixels.length; i += 4) {
  inkPixels[i] = INK.r;
  inkPixels[i + 1] = INK.g;
  inkPixels[i + 2] = INK.b;
}
const inkBuffer = await sharp(inkPixels, { raw: { width, height, channels: 4 } })
  .extract(crop)
  .resize({ width: 800 })
  .png()
  .toBuffer();
fs.writeFileSync(path.join(out, "assets", "img", "logo-mark-ink.png"), inkBuffer);

// App icon: the beige mark centred on the warm wood chip.
const iconMark = await sharp(lightBuffer).resize({ width: 330 }).toBuffer();
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"></svg>`;
const iconBase = await sharp(Buffer.from(iconSvg))
  .resize(512, 512)
  .composite([{ input: Buffer.from(`<svg width="512" height="512"><rect width="512" height="512" rx="112" fill="#1B100B"/><rect x="14" y="14" width="484" height="484" rx="100" fill="none" stroke="#3A2419" stroke-width="2"/></svg>`) }])
  .png()
  .toBuffer();

const icon = await sharp(iconBase)
  .composite([{ input: iconMark, gravity: "centre" }])
  .png()
  .toBuffer();

for (const size of [512, 192, 180]) {
  await sharp(icon).resize(size, size).png({ compressionLevel: 9 }).toFile(path.join(out, `icon-${size}.png`));
}
await sharp(icon).resize(64, 64).png({ compressionLevel: 9 }).toFile(path.join(out, "favicon.png"));
await sharp(icon).resize(32, 32).png({ compressionLevel: 9 }).toFile(path.join(out, "favicon-32x32.png"));
await sharp(icon).resize(16, 16).png({ compressionLevel: 9 }).toFile(path.join(out, "favicon-16x16.png"));

// Generate standard multi-resolution favicon.ico
const icoSizes = [16, 32, 48];
const pngBuffers = [];
for (const s of icoSizes) {
  const buf = await sharp(icon).resize(s, s).png({ compressionLevel: 9 }).toBuffer();
  pngBuffers.push({ size: s, buf });
}

const count = pngBuffers.length;
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // ICO type 1 = icon
header.writeUInt16LE(count, 4); // number of images

let offset = 6 + count * 16;
const entries = [];
for (const item of pngBuffers) {
  const entry = Buffer.alloc(16);
  entry.writeUInt8(item.size >= 256 ? 0 : item.size, 0); // width
  entry.writeUInt8(item.size >= 256 ? 0 : item.size, 1); // height
  entry.writeUInt8(0, 2); // color palette count
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(item.buf.length, 8); // size of image data
  entry.writeUInt32LE(offset, 12); // offset of image data
  entries.push(entry);
  offset += item.buf.length;
}

const icoBuffer = Buffer.concat([header, ...entries, ...pngBuffers.map((p) => p.buf)]);
fs.writeFileSync(path.join(out, "favicon.ico"), icoBuffer);

// Dark, low-contrast wood chip used by the OG image if it is regenerated.
void WOOD;

console.log("wrote transparent logo marks, favicon.ico, favicons and app icons");
