/**
 * Sync real Google Reviews into tools/google-reviews.json (static build-time).
 *
 *   npm run reviews:sync
 *
 * Supports two zero-backend sources (reads from process.env or local .env):
 *   1. Featurable (free, no Google Cloud billing):
 *        FEATURABLE_WIDGET_ID=your-widget-id
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

const featurableId = (process.env.FEATURABLE_WIDGET_ID || "").trim();
const googleApiKey = (process.env.GOOGLE_PLACES_API_KEY || "").trim();
const googlePlaceId = (process.env.GOOGLE_PLACE_ID || site.googlePlaceId || "").trim();

const existing = fs.existsSync(outPath)
  ? JSON.parse(fs.readFileSync(outPath, "utf8"))
  : {};

async function syncFromFeaturable(widgetId) {
  const url = `https://featurable.com/api/v1/widgets/${encodeURIComponent(widgetId)}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Featurable API returned HTTP ${res.status}`);
  const data = await res.json();
  const rawReviews = Array.isArray(data.reviews) ? data.reviews : [];

  const reviews = rawReviews
    .map((r) => ({
      name: String(r.reviewer?.displayName || r.authorName || "Google Customer").trim(),
      rating: Math.max(1, Math.min(5, Number(r.starRating || r.rating) || 5)),
      text: String(r.comment || r.text || "").trim(),
      date: String(r.createTime || r.relativeTime || "").slice(0, 10),
      source: "Google",
      url: String(r.reviewUrl || "").trim(),
    }))
    .filter((r) => r.text.length > 0);

  return {
    source: "Google",
    placeId: googlePlaceId || existing.placeId || "",
    profileUrl: String(data.profileUrl || existing.profileUrl || site.mapsLink),
    rating: Number(data.averageRating ?? data.rating) || null,
    totalReviews: Number(data.totalReviewCount ?? data.reviewCount) || reviews.length || null,
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
      rating: Math.max(1, Math.min(5, Number(r.rating) || 5)),
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

if (!featurableId && !(googleApiKey && googlePlaceId)) {
  console.log(
    "No sync credentials configured (FEATURABLE_WIDGET_ID or GOOGLE_PLACES_API_KEY + GOOGLE_PLACE_ID).",
  );
  console.log("Keeping existing tools/google-reviews.json as-is.");
  process.exit(0);
}

const payload = featurableId
  ? await syncFromFeaturable(featurableId)
  : await syncFromGooglePlaces(googleApiKey, googlePlaceId);

const fingerprint = (d) =>
  JSON.stringify({
    placeId: d?.placeId || "",
    profileUrl: d?.profileUrl || "",
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
