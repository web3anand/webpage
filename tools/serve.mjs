/**
 * Local preview server for the generated site.
 *
 *   npm start
 *
 * Serves /public the way Vercel does: clean URLs (/services), directory
 * indexes (/services/), security headers, and 404.html for anything missing.
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const root = path.join(projectRoot, "public");
const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT) || 3000;

const vercelConfig = JSON.parse(
  fs.readFileSync(path.join(projectRoot, "vercel.json"), "utf8"),
);
const globalRule = vercelConfig.headers?.find((rule) => rule.source === "/(.*)");
const securityHeaders = Object.fromEntries(
  (globalRule?.headers || [])
    .filter((h) => h.key.toLowerCase() !== "strict-transport-security")
    .map((h) => [
      h.key,
      h.key.toLowerCase() === "content-security-policy"
        ? h.value.replace(/;\s*upgrade-insecure-requests\b/i, "")
        : h.value,
    ]),
);

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
  let clean;
  try {
    clean = decodeURIComponent(urlPath.split("?")[0]);
  } catch {
    return { badRequest: true };
  }

  const normalized = path.posix.normalize(`/${clean}`);
  const base = path.resolve(root, `.${normalized}`);
  if (base !== root && !base.startsWith(root + path.sep)) return { file: null };

  const candidates = [
    path.join(base, "index.html"),
    base,
    `${base}.html`,
  ];
  for (const candidate of candidates) {
    const resolved = path.resolve(candidate);
    if ((resolved === root || resolved.startsWith(root + path.sep)) && isFile(resolved)) {
      return { file: resolved };
    }
  }
  return { file: null };
}

const server = http.createServer((req, res) => {
  // Vercel injects the Web Analytics script at the platform level. Locally
  // there is nothing to serve, so answer quietly instead of logging a 404.
  if (req.url && req.url.startsWith("/_vercel/")) {
    res.writeHead(204, securityHeaders).end();
    return;
  }

  const result = resolve(req.url || "/");

  if (result.badRequest) {
    res.writeHead(400, { ...securityHeaders, "Content-Type": "text/plain; charset=utf-8" });
    res.end("Bad Request");
    return;
  }

  if (!result.file) {
    const notFound = path.join(root, "404.html");
    res.writeHead(404, { ...securityHeaders, "Content-Type": types[".html"] });
    res.end(fs.readFileSync(notFound));
    return;
  }

  res.writeHead(200, {
    ...securityHeaders,
    "Content-Type": types[path.extname(result.file).toLowerCase()] || "application/octet-stream",
    "Cache-Control": "no-cache",
  });
  fs.createReadStream(result.file).pipe(res);
});

server.listen(port, host, () => {
  console.log(`AV Interior Decoration running at http://${host}:${port}`);
});
