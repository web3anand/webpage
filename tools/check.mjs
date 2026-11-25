/**
 * Post-build & security checks.
 *
 *   npm test        (builds first, then runs these checks)
 *   npm run check   (checks the current public/ output)
 *
 * Catches broken links/assets, missing root files, and security regressions
 * (CSP hash drift, missing headers, unsafe target="_blank", raw JSON-LD tags,
 * or sensitive files accidentally shipped in public/).
 */
import crypto from "node:crypto";
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

/* ----------------------------------------------------- security header check */

const vercelPath = path.join(root, "vercel.json");
let cspScriptHashes = new Set();

if (!isFile(vercelPath)) {
  errors.push("vercel.json is missing");
} else {
  const vercelConfig = JSON.parse(fs.readFileSync(vercelPath, "utf8"));
  const globalRule = vercelConfig.headers?.find((r) => r.source === "/(.*)");
  const headerMap = new Map(
    (globalRule?.headers || []).map((h) => [h.key.toLowerCase(), h.value]),
  );

  for (const requiredHeader of [
    "strict-transport-security",
    "x-content-type-options",
    "referrer-policy",
    "x-frame-options",
    "cross-origin-opener-policy",
    "permissions-policy",
    "content-security-policy",
  ]) {
    if (!headerMap.get(requiredHeader)) {
      errors.push(`vercel.json: missing global security header "${requiredHeader}"`);
    }
  }

  const csp = headerMap.get("content-security-policy") || "";
  if (/script-src[^;]*'unsafe-inline'/i.test(csp)) {
    errors.push("vercel.json: CSP script-src must not allow 'unsafe-inline'");
  }
  for (const match of csp.matchAll(/'(sha256-[A-Za-z0-9+/=]+)'/g)) {
    cspScriptHashes.add(match[1]);
  }
}

/* --------------------------------------------------------- HTML & link checks */

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
    if (!raw.startsWith("/")) continue;

    const [pathname] = raw.split("#");
    const found = fileFor(pathname);
    if (!found) {
      errors.push(`${where}: ${raw} does not resolve to a generated file`);
      continue;
    }
    referenced.add(rel(path.relative(out, found)));
  }

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

  // Security check: every target="_blank" link must include rel="noopener noreferrer"
  for (const match of html.matchAll(/<a\b[^>]*\btarget="_blank"[^>]*>/gi)) {
    const tag = match[0];
    const relMatch = tag.match(/\brel="([^"]*)"/i);
    const relTokens = new Set((relMatch?.[1] || "").toLowerCase().split(/\s+/).filter(Boolean));
    if (!relTokens.has("noopener") || !relTokens.has("noreferrer")) {
      errors.push(`${where}: target="_blank" link missing rel="noopener noreferrer" -> ${tag}`);
    }
  }

  // SEO/AEO checks on every HTML page
  if (!/<title>[^<]+<\/title>/i.test(html)) errors.push(`${where}: missing <title>`);
  if (!/<meta\s+name="description"\s+content="[^"]+"/i.test(html)) {
    errors.push(`${where}: missing meta description`);
  }
  if (!/<link\s+rel="canonical"\s+href="https?:\/\/[^"]+"/i.test(html)) {
    errors.push(`${where}: missing canonical link`);
  }
  if (!/<h1\b[^>]*>[\s\S]*?<\/h1>/i.test(html)) errors.push(`${where}: missing <h1>`);
  if (/abacus\.jasoncameron\.dev|data-visits|data-visit-count/i.test(html)) {
    errors.push(`${where}: leftover visitor counter markup found`);
  }

  // Security check: every inline executable <script> must match a SHA-256 hash in CSP
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const attrs = match[1];
    const content = match[2];
    if (/\bsrc=/i.test(attrs)) continue;
    if (/\btype="application\/ld\+json"/i.test(attrs)) {
      if (/<\/script/i.test(content)) {
        errors.push(`${where}: unescaped </script> inside JSON-LD block`);
      }
      try {
        JSON.parse(content);
      } catch (err) {
        errors.push(`${where}: invalid JSON-LD (${err.message})`);
      }
      continue;
    }
    const digest = `sha256-${crypto.createHash("sha256").update(content).digest("base64")}`;
    if (!cspScriptHashes.has(digest)) {
      errors.push(
        `${where}: inline <script> hash ${digest} is not allowlisted in vercel.json Content-Security-Policy`,
      );
    }
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
  "llms.txt",
  "llms-full.txt",
  "favicon.ico",
  "favicon.svg",
  "favicon.png",
  "favicon-32x32.png",
  "favicon-16x16.png",
  "icon-48.png",
  "icon-96.png",
  "icon-144.png",
  "icon-180.png",
  "icon-192.png",
  "icon-512.png",
  "404.html",
]) {
  if (!isFile(path.join(out, required))) errors.push(`public/${required} is missing`);
}

/* Security check: ensure tools/google-reviews.json has valid shape and no leaked API keys. */
const googleReviewsFile = path.join(root, "tools", "google-reviews.json");
if (isFile(googleReviewsFile)) {
  const raw = fs.readFileSync(googleReviewsFile, "utf8");
  if (/AIza[0-9A-Za-z_-]{20,}/.test(raw)) {
    errors.push("tools/google-reviews.json: looks like a Google API key was written into the repo");
  }
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.reviews)) {
      errors.push("tools/google-reviews.json: reviews must be an array");
    }
  } catch (err) {
    errors.push(`tools/google-reviews.json: invalid JSON (${err.message})`);
  }
}

/* Security check: ensure no sensitive or unauthenticated admin files ship in public/. */
for (const file of walk(out)) {
  const relFile = rel(path.relative(out, file));
  if (/(^|\/)(\.env|\.git|admin\.html$)|(\.(pem|key|sqlite|db|bak)$)/i.test(relFile)) {
    errors.push(`public/${relFile}: sensitive or forbidden file must not be deployed`);
  }
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
  `checked ${htmlFiles.length} pages — all links, assets, required files and security checks pass.` +
    (warnings.length ? ` (${warnings.length} warning(s))` : ""),
);
