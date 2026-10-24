/**
 * Post-build checks.
 *
 *   npm test        (builds first, then runs these checks)
 *   npm run check   (checks the current public/ output)
 *
 * Catches the class of bug that only shows up in production: a link to a page
 * that was never generated, an image that does not exist, or a required root
 * file (robots.txt, sitemap.xml, icons) missing from the deploy.
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const out = path.join(root, "public");

const errors = [];
const warnings = [];

const rel = (p) => p.replace(/\\/g, "/");
const isFile = (p) => {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
};
const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });

if (!isFile(path.join(out, "index.html"))) {
  console.error("public/index.html is missing — run `npm run build` first.");
  process.exit(1);
}

/** Map a site URL to the file Vercel's cleanUrls would serve. */
function fileFor(urlPath) {
  const clean = decodeURIComponent(urlPath.split("#")[0].split("?")[0]);
  if (clean === "/" || clean === "") return path.join(out, "index.html");

  const relPath = clean.replace(/^\/+/, "").replace(/\/+$/, "");
  const candidates = [
    path.join(out, `${relPath}.html`),
    path.join(out, relPath, "index.html"),
    path.join(out, relPath),
  ];
  return candidates.find(isFile) || null;
}

const htmlFiles = walk(out).filter((f) => f.endsWith(".html"));
const referenced = new Set();

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const where = rel(path.relative(root, file));
  const urls = [];

  for (const match of html.matchAll(/\b(?:href|src)="([^"]*)"/g)) urls.push(match[1]);
  for (const match of html.matchAll(/\b(?:srcset|imagesrcset)="([^"]*)"/g)) {
    match[1]
      .split(",")
      .map((part) => part.trim().split(/\s+/)[0])
      .filter(Boolean)
      .forEach((url) => urls.push(url));
  }

  for (const raw of urls) {
    if (!raw || raw.startsWith("#")) continue;
    if (/^(https?:|mailto:|tel:|data:|javascript:)/i.test(raw)) continue;
    if (raw.startsWith("/_vercel/")) continue;
    if (!raw.startsWith("/")) continue; // fragment-relative links are not used here

    const [pathname] = raw.split("#");
    const found = fileFor(pathname);
    if (!found) {
      errors.push(`${where}: ${raw} does not resolve to a generated file`);
      continue;
    }
    referenced.add(rel(path.relative(out, found)));
  }

  // Absolute URLs in meta tags (og:image, twitter:image) count as references
  // when they point at a file we ship, but external hosts are not errors.
  for (const match of html.matchAll(/content="(https?:\/\/[^"]+)"/g)) {
    let url;
    try {
      url = new URL(match[1]);
    } catch {
      continue;
    }
    const found = fileFor(url.pathname);
    if (found) referenced.add(rel(path.relative(out, found)));
  }
}

/* Sitemap URLs must all resolve too. */
const sitemap = path.join(out, "sitemap.xml");
if (isFile(sitemap)) {
  const xml = fs.readFileSync(sitemap, "utf8");
  for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    let url;
    try {
      url = new URL(match[1]);
    } catch {
      errors.push(`sitemap.xml: invalid URL ${match[1]}`);
      continue;
    }
    if (!fileFor(url.pathname)) {
      errors.push(`sitemap.xml: ${match[1]} does not resolve to a generated file`);
    }
  }
} else {
  errors.push("public/sitemap.xml is missing");
}

/* Files the deploy expects at the domain root. */
for (const required of [
  "robots.txt",
  "sitemap.xml",
  "site.webmanifest",
  "favicon.png",
  "icon-180.png",
  "icon-192.png",
  "icon-512.png",
  "404.html",
]) {
  if (!isFile(path.join(out, required))) errors.push(`public/${required} is missing`);
}

/* Images and fonts that ship but nothing references. */
const referencedAll = new Set(referenced);
for (const css of walk(out).filter((f) => f.endsWith(".css"))) {
  const text = fs.readFileSync(css, "utf8");
  for (const match of text.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
    const raw = match[1];
    if (!raw.startsWith("/")) continue;
    const found = fileFor(raw);
    if (found) referencedAll.add(rel(path.relative(out, found)));
  }
}

for (const dir of ["assets/img", "fonts"]) {
  const base = path.join(out, dir);
  if (!fs.existsSync(base)) continue;
  for (const file of walk(base)) {
    const key = rel(path.relative(out, file));
    if (!referencedAll.has(key)) warnings.push(`unused asset: public/${key}`);
  }
}

for (const warning of warnings) console.warn(`warn  ${warning}`);

if (errors.length) {
  for (const error of errors) console.error(`error ${error}`);
  console.error(`\n${errors.length} problem(s) found.`);
  process.exit(1);
}

console.log(
  `checked ${htmlFiles.length} pages — all internal links, assets and required files resolve.` +
    (warnings.length ? ` (${warnings.length} warning(s))` : ""),
);
