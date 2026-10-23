/**
 * Local preview server for the generated site.
 *
 *   npm start
 *
 * Serves /public the way Vercel does: clean URLs (/services), directory
 * indexes (/services/), and 404.html for anything missing.
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..", "public");
const port = Number(process.env.PORT) || 3000;

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".ico": "image/x-icon",
};

const isFile = (p) => {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
};

function resolve(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0]);
  const base = path.join(root, clean);
  if (!base.startsWith(root)) return null;

  const candidates = [
    path.join(base, "index.html"),
    base,
    `${base}.html`,
  ];
  for (const candidate of candidates) {
    if (isFile(candidate)) return candidate;
  }
  return null;
}

const server = http.createServer((req, res) => {
  // Vercel injects the Web Analytics script at the platform level. Locally
  // there is nothing to serve, so answer quietly instead of logging a 404.
  if (req.url && req.url.startsWith("/_vercel/")) {
    res.writeHead(204).end();
    return;
  }

  const file = resolve(req.url || "/");

  if (!file) {
    const notFound = path.join(root, "404.html");
    res.writeHead(404, { "Content-Type": types[".html"] });
    res.end(fs.readFileSync(notFound));
    return;
  }

  res.writeHead(200, {
    "Content-Type": types[path.extname(file).toLowerCase()] || "application/octet-stream",
    "Cache-Control": "no-cache",
  });
  fs.createReadStream(file).pipe(res);
});

server.listen(port, () => {
  console.log(`AV Interior Decoration running at http://localhost:${port}`);
});
