/**
 * Sync real Google Reviews into tools/google-reviews.json (static build-time).
 *
 *   npm run reviews:sync
 *
 * Supports two zero-backend sources (reads from process.env or local .env):
 *   1. Featurable (free, no Google Cloud billing):
 *        FEATURABLE_WIDGET_ID=your-widget-id   (UUID or full API URL)
 *   2. Google Places API (New):
 *        GOOGLE_PLACES_API_KEY=your-server-key
 *        GOOGLE_PLACE_ID=ChIJ...
 *
 * Never commits API keys — .env* is gitignored and only public review data
 * is written to tools/google-reviews.json.
 */
import fs from "node:fs";
import path from "node:path";
import { site } from "./content.mjs";

const root = path.resolve(import.meta.dirname, "..");
const outPath = path.join(import.meta.dirname, "google-reviews.json");
const envPath = path.join(root, ".env");

if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed
      .slice(eq + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (key && !(key in process.env)) process.env[key] = val;
  }
}

const featurableRaw = (process.env.FEATURABLE_WIDGET_ID || site.featurableWidgetId || "").trim();
const googleApiKey = (process.env.GOOGLE_PLACES_API_KEY || "").trim();
const googlePlaceId = (process.env.GOOGLE_PLACE_ID || site.googlePlaceId || "").trim();

const existing = fs.existsSync(outPath)
  ? JSON.parse(fs.readFileSync(outPath, "utf8"))
  : {};

const STAR_ENUM = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };
const parseRating = (val) => {
  if (typeof val === "string" && STAR_ENUM[val.toUpperCase()]) return STAR_ENUM[val.toUpperCase()];
  const num = Number(val);
  return Number.isFinite(num) && num > 0 ? Math.max(1, Math.min(5, Math.round(num))) : 5;
};

async function fetchFeaturableJson(rawIdOrUrl) {
  const urls = /^https?:\/\//i.test(rawIdOrUrl)
    ? [rawIdOrUrl]
    : [
        `https://featurable.com/api/v2/widgets/${encodeURIComponent(rawIdOrUrl)}`,
        `https://featurable.com/api/v1/widgets/${encodeURIComponent(rawIdOrUrl)}`,
      ];

  let lastErr = null;
  for (const url of urls) {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (res.ok) return await res.json();
    lastErr = new Error(`Featurable API (${url}) returned HTTP ${res.status}`);
  }
  throw lastErr;
}

async function syncFromFeaturable(rawIdOrUrl) {
  const data = await fetchFeaturableJson(rawIdOrUrl);
  // Support both v2 ({ success, widget: { ... } }) and v1 ({ reviews, averageRating, ... })
  const container = data?.widget && typeof data.widget === "object" ? data.widget : data;
  const rawReviews = Array.isArray(container?.reviews) ? container.reviews : [];

  const reviews = rawReviews
    .map((r) => ({
      name: String(
        r.author?.name ||
          r.reviewer?.displayName ||
          r.authorName ||
          r.name ||
          "Google Customer",
      ).trim(),
      rating: parseRating(r.rating ?? r.starRating),
      text: String(r.text || r.comment || r.snippet || "").trim(),
      date: String(
        r.relativeTimeDescription ||
          r.relativeTime ||
          (r.publishedAt ? String(r.publishedAt).slice(0, 10) : "") ||
          (r.createTime ? String(r.createTime).slice(0, 10) : ""),
      ).trim(),
      source: "Google",
      url: String(r.reviewUrl || r.url || "").trim(),
    }))
    .filter((r) => r.text.length > 0);

  const summary = container?.gbpLocationSummary || data?.gbpLocationSummary || {};
  const avgRaw =
    summary?.rating ??
    container?.averageRating ??
    container?.rating ??
    data?.averageRating ??
    data?.rating;
  const countRaw =
    summary?.reviewsCount ??
    container?.totalReviewCount ??
    container?.reviewCount ??
    data?.totalReviewCount ??
    data?.reviewCount;

  const rating = Number.isFinite(Number(avgRaw)) && Number(avgRaw) > 0
    ? Number(Number(avgRaw).toFixed(1))
    : null;
  const totalReviews = Number.isFinite(Number(countRaw)) && Number(countRaw) > 0
    ? Number(countRaw)
    : reviews.length || null;

  return {
    source: "Google",
    placeId: googlePlaceId || existing.placeId || "",
    profileUrl: String(
      container?.profileUrl || data?.profileUrl || existing.profileUrl || site.mapsLink,
    ),
    writeReviewUrl: String(
      summary?.writeAReviewUri || existing.writeReviewUrl || "",
    ).trim(),
    rating,
    totalReviews,
    syncedAt: new Date().toISOString().slice(0, 10),
    reviews,
  };
}

async function syncFromGooglePlaces(apiKey, placeId) {
  const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`;
  const res = await fetch(url, {
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "rating,userRatingCount,reviews,googleMapsUri",
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Google Places API returned HTTP ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  const rawReviews = Array.isArray(data.reviews) ? data.reviews : [];

  const reviews = rawReviews
    .map((r) => ({
      name: String(r.authorAttribution?.displayName || "Google Customer").trim(),
      rating: parseRating(r.rating),
      text: String(r.text?.text || r.originalText?.text || "").trim(),
      date: String(r.relativePublishTimeDescription || r.publishTime?.slice(0, 10) || "").trim(),
      source: "Google",
      url: String(r.googleMapsUri || r.authorAttribution?.uri || "").trim(),
    }))
    .filter((r) => r.text.length > 0);

  return {
    source: "Google",
    placeId,
    profileUrl: String(data.googleMapsUri || existing.profileUrl || site.mapsLink),
    rating: typeof data.rating === "number" ? Number(data.rating.toFixed(1)) : null,
    totalReviews: typeof data.userRatingCount === "number" ? data.userRatingCount : null,
    syncedAt: new Date().toISOString().slice(0, 10),
    reviews,
  };
}

if (!featurableRaw && !(googleApiKey && googlePlaceId)) {
  const msg =
    "Missing sync credentials: set FEATURABLE_WIDGET_ID or (GOOGLE_PLACES_API_KEY + GOOGLE_PLACE_ID).";
  if (process.env.GITHUB_ACTIONS === "true") {
    console.error(`::error::${msg} Add them in GitHub Repo -> Settings -> Secrets and variables -> Actions.`);
    process.exit(1);
  }
  console.log(msg);
  console.log("Keeping existing tools/google-reviews.json as-is.");
  process.exit(0);
}

const payload = featurableRaw
  ? await syncFromFeaturable(featurableRaw)
  : await syncFromGooglePlaces(googleApiKey, googlePlaceId);

const fingerprint = (d) =>
  JSON.stringify({
    placeId: d?.placeId || "",
    profileUrl: d?.profileUrl || "",
    writeReviewUrl: d?.writeReviewUrl || "",
    rating: d?.rating ?? null,
    totalReviews: d?.totalReviews ?? null,
    reviews: Array.isArray(d?.reviews) ? d.reviews : [],
  });

if (fingerprint(payload) === fingerprint(existing)) {
  console.log("Google reviews unchanged — skipping write.");
  process.exit(0);
}

fs.writeFileSync(outPath, JSON.stringify(payload, null, 2) + "\n");
console.log(
  `synced ${payload.reviews.length} Google review(s)` +
    (payload.rating ? ` (${payload.rating}/5 across ${payload.totalReviews ?? "?"} reviews)` : "") +
    " -> tools/google-reviews.json",
);
