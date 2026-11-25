/**
 * Static page generator.
 *
 *   npm run build
 *
 * Writes plain HTML into /public. No runtime, no framework — the generated
 * files are what Vercel serves from /public.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  site,
  nav,
  trustPoints,
  whyPoints,
  processSteps,
  gallery,
  homeFaqs,
  services,
  serviceBySlug,
  testimonials,
} from "./content.mjs";

const root = path.resolve(import.meta.dirname, "..");
const out = path.join(root, "public");
const manifest = JSON.parse(
  fs.readFileSync(path.join(import.meta.dirname, "image-manifest.json"), "utf8"),
);
const categoryGalleryPath = path.join(import.meta.dirname, "category-gallery.json");
const categoryGallery = fs.existsSync(categoryGalleryPath)
  ? JSON.parse(fs.readFileSync(categoryGalleryPath, "utf8"))
  : {};
const googleReviewsPath = path.join(import.meta.dirname, "google-reviews.json");
const googleReviewsData = fs.existsSync(googleReviewsPath)
  ? JSON.parse(fs.readFileSync(googleReviewsPath, "utf8"))
  : { reviews: [] };
const googleReviews = Array.isArray(googleReviewsData.reviews) ? googleReviewsData.reviews : [];
const allReviews = [...googleReviews, ...testimonials];
const YEAR = String(new Date().getFullYear());
const TODAY = new Date().toISOString().slice(0, 10);
const assetHash = (relPath) =>
  crypto
    .createHash("sha256")
    .update(fs.readFileSync(path.join(out, relPath)))
    .digest("hex")
    .slice(0, 8);
const CSS_V = assetHash("css/style.css");
const JS_V = assetHash("js/main.js");

const esc = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const abs = (p) => `${site.url}${p === "/" ? "/" : p}`;

/* ------------------------------------------------------------------ images */

/**
 * Variants for one image, keyed by their *actual* pixel width from the
 * manifest — not the width in the filename. Small sources are never enlarged,
 * so several requested widths can collapse to the same file size; those are
 * deduplicated so `srcset` never repeats a descriptor.
 */
function variantsFor(name) {
  const base = name.replace(/-\d+$/, "");
  const pattern = new RegExp(`^${base}-(\\d+)$`);
  const seen = new Set();
  return Object.keys(manifest)
    .map((key) => {
      const match = key.replace(/\.webp$/, "").match(pattern);
      if (!match) return null;
      return {
        key: key.replace(/\.webp$/, ""),
        w: manifest[key]?.w || Number(match[1]),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.w - b.w)
    .filter((variant) => {
      if (seen.has(variant.w)) return false;
      seen.add(variant.w);
      return true;
    });
}

function largestVariantFor(name) {
  const variants = variantsFor(name);
  return variants.length ? variants[variants.length - 1].key : name;
}

function img(name, { alt, className = "", sizes, loading = "lazy", priority = false } = {}) {
  const meta = manifest[`${name}.webp`];
  if (!meta) throw new Error(`Unknown image: ${name}`);
  const variants = variantsFor(name);
  const srcsetAttr =
    variants.length > 1
      ? ` srcset="${variants.map((v) => `/assets/img/${v.key}.webp ${v.w}w`).join(", ")}"`
      : "";
  const sizesAttr = srcsetAttr ? ` sizes="${sizes || "(max-width: 900px) 100vw, 50vw"}"` : "";
  return `<img src="/assets/img/${name}.webp" width="${meta.w}" height="${meta.h}"${srcsetAttr}${sizesAttr}${
    className ? ` class="${className}"` : ""
  } alt="${esc(alt)}" loading="${loading}" decoding="async"${
    priority ? ' fetchpriority="high"' : ""
  }>`;
}

function srcset(name, widths) {
  const seen = new Set();
  return widths
    .map((w) => {
      const key = `${name}-${w}`;
      const meta = manifest[`${key}.webp`];
      if (!meta || seen.has(meta.w)) return null;
      seen.add(meta.w);
      return `/assets/img/${key}.webp ${meta.w}w`;
    })
    .filter(Boolean)
    .join(", ");
}

/* ---------------------------------------------------------------- helpers */

/** Service names are title-cased; keep acronyms upper-case in running text. */
const nameLower = (name) => name.toLowerCase().replace(/^upvc\b/, "UPVC");

const waHref = (text) =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;

const WA_DEFAULT = "Hello AV Interior Decoration, I would like a quotation for interior work.";

const resolvedPlaceId = site.googlePlaceId || googleReviewsData.placeId || "";
const googleProfileHref = googleReviewsData.profileUrl || site.mapsLink;
const googleReviewHref =
  site.googleReviewLink ||
  (resolvedPlaceId
    ? `https://search.google.com/local/writereview?placeid=${encodeURIComponent(resolvedPlaceId)}`
    : googleProfileHref);

/* ------------------------------------------------------------------- icons */

const icons = {
  arrow: `<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M3 10h13M11 5l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  check: `<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6.5 3h2.2l1.5 4-2 1.4a12 12 0 005.4 5.4l1.4-2 4 1.5v2.2A2.5 2.5 0 0116.5 18C9.6 17.6 6.4 14.4 6 7.5A2.5 2.5 0 016.5 3z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
  whatsapp: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3.5a8.4 8.4 0 00-7.2 12.7L3.6 20.4l4.3-1.1A8.4 8.4 0 1012 3.5z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M9 8.2c.2-.4.4-.4.7-.4h.5c.2 0 .4 0 .5.4l.7 1.6c.1.2 0 .4-.1.6l-.5.6c-.1.2-.1.3 0 .5.5.9 1.2 1.6 2.1 2.1.2.1.4.1.5 0l.6-.6c.2-.2.4-.2.6-.1l1.6.7c.3.1.4.3.4.5v.5c0 .5-.4 1-.9 1.2-.6.2-1.4.2-2.5-.2a9 9 0 01-4.7-4.7c-.4-1.1-.4-1.9-.2-2.5.1-.4.4-.6.7-.7z" fill="currentColor"/></svg>`,
  pin: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 21s7-5.6 7-11a7 7 0 10-14 0c0 5.4 7 11 7 11z" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="10" r="2.5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`,
  layers: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3.5l8.5 4.5-8.5 4.5L3.5 8 12 3.5z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M4.8 12.4L12 16.2l7.2-3.8M4.8 16.4L12 20.2l7.2-3.8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  plus: `<svg class="faq-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M10 4v12M4 10h12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  close: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  menu: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 6.5h16M4 12h16M4 17.5h16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  mail: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3" y="5.5" width="18" height="13" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M4.5 7.5l7.5 5.6 7.5-5.6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
  star: `<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M10 2.4l2.3 4.7 5.2.8-3.8 3.6.9 5.1-4.6-2.4-4.6 2.4.9-5.1L2.5 7.9l5.2-.8L10 2.4z" fill="currentColor"/></svg>`,
  googleG: `<svg class="google-g" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.54 5.54 0 01-2.4 3.63v3h3.88c2.27-2.09 3.54-5.17 3.54-8.87z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.07.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.09A12 12 0 0012 24z"/><path fill="#FBBC05" d="M5.28 14.29A7.12 7.12 0 014.9 12c0-.79.14-1.56.38-2.29V6.62H1.29A12 12 0 000 12c0 1.94.46 3.77 1.29 5.38l3.99-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A12 12 0 001.29 6.62l3.99 3.09C6.23 6.86 8.88 4.75 12 4.75z"/></svg>`,
};

/* ------------------------------------------------------------------ header */

function header(urlPath) {
  const isActive = (href) => {
    if (href === "/services") return urlPath === "/services" || urlPath.startsWith("/services/");
    if (href === "/contact") return urlPath === "/contact";
    return false;
  };
  const links = nav
    .map(
      (item) =>
        `<a href="${item.href}"${isActive(item.href) ? ' aria-current="page"' : ""}>${esc(item.label)}</a>`,
    )
    .join("");

  return `<header class="site-header" data-header>
  <div class="shell header-bar">
    <a class="brand" href="/">
      <img class="brand-mark brand-mark--header" src="/assets/img/logo-mark-ink.png" width="800" height="830" alt="" aria-hidden="true" decoding="async">
      <span class="brand-copy">
        <span class="brand-name">AV Interior Decoration</span>
        <span class="brand-sub">Thoothukudi · Tamil Nadu</span>
      </span>
    </a>

    <nav class="primary-nav" aria-label="Primary">${links}</nav>

    <div class="header-end">
      <a class="header-call" href="tel:${site.phone}" aria-label="Call ${esc(site.phoneDisplay)}">${icons.phone}<span>${esc(site.phoneDisplay)}</span></a>
      <a class="btn btn--accent btn--sm header-cta" href="/contact">Get a quote${icons.arrow}</a>
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="mobile-nav" aria-label="Open menu" data-menu-btn>
        <span class="menu-btn__lines" aria-hidden="true"><i></i><i></i></span>
      </button>
    </div>
  </div>
</header>`;
}

/* ------------------------------------------------------------------ footer */

function footer() {
  return `<footer class="site-footer">
  <div class="footer-lines" aria-hidden="true">
    <svg viewBox="0 0 1440 560" fill="none" preserveAspectRatio="xMidYMax slice">
      <path d="M-60 540V310c0-110 90-200 200-200s200 90 200 200v230" stroke="currentColor" stroke-width="1"/>
      <path d="M850 540V285c0-140 115-255 255-255s255 115 255 255v255" stroke="currentColor" stroke-width="1"/>
      <path d="M905 540V320c0-110 90-200 200-200s200 90 200 200v220" stroke="currentColor" stroke-width="1" opacity="0.55"/>
      <circle cx="1195" cy="205" r="58" stroke="currentColor" stroke-width="1" opacity="0.7"/>
      <path d="M60 430c120-18 240-18 360 0M120 470c80-10 160-10 240 0" stroke="currentColor" stroke-width="1" opacity="0.45"/>
    </svg>
  </div>

  <div class="shell footer-top">
    <div class="footer-brand">
      <a class="footer-logo" href="/" aria-label="AV Interior Decoration home">
        <img class="brand-mark brand-mark--footer" src="/assets/img/logo-mark.png" width="800" height="830" alt="" aria-hidden="true" decoding="async">
      </a>
      <p class="footer-name">AV Interior Decoration</p>
      <p class="footer-tagline">Interiors and exterior finishing for homes, offices and shops across Tamil Nadu.</p>
      <address class="footer-contact">
        <a href="tel:${site.phone}">${esc(site.phoneDisplay)}</a>
        <a href="mailto:${site.email}">${esc(site.email)}</a>
        <span>${esc(site.street)}, ${esc(site.locality)}, ${esc(site.region)}${site.postalCode ? ` ${esc(site.postalCode)}` : ""}</span>
        ${site.hoursDisplay ? `<span>${esc(site.hoursDisplay)}</span>` : ""}
      </address>
    </div>

    <nav class="footer-col" aria-label="Services">
      <h2>Services</h2>
      <ul>${services
        .map((s) => `<li><a href="/services/${s.slug}">${esc(s.name)}</a></li>`)
        .join("")}</ul>
    </nav>

    <nav class="footer-col" aria-label="Company">
      <h2>Company</h2>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/#work">Our work</a></li>
        <li><a href="/#process">How we work</a></li>
        <li><a href="/#faq">FAQs</a></li>
        <li><a href="/#reviews">Reviews</a></li>
        <li><a href="/contact">Contact</a></li>
      </ul>
    </nav>

    <div class="footer-col footer-col--cta">
      <h2>Start a project</h2>
      <p>Tell us which rooms you want to change. We will visit, measure and send you a clear quote.</p>
      <a class="btn btn--beige btn--block" href="/contact">Book a site visit${icons.arrow}</a>
      <a class="footer-wa" href="${waHref(WA_DEFAULT)}" target="_blank" rel="noopener noreferrer">${icons.whatsapp}WhatsApp ${esc(site.phoneDisplay)}</a>
    </div>
  </div>

  <div class="shell footer-signoff">
    <p class="footer-wordmark">AV Interior Decoration</p>
    <p class="footer-wordmark-sub"><span lang="ta">தூத்துக்குடி</span> · Serving Tamil Nadu</p>
  </div>

  <div class="footer-bar">
    <div class="shell footer-bar__inner">
      <p>© ${YEAR} ${esc(site.name)}</p>
      <p class="footer-legal"><a href="/privacy">Privacy</a><span aria-hidden="true">·</span><a href="/terms">Terms</a></p>
      <p>Made in Thoothukudi · Serving Tamil Nadu</p>
    </div>
  </div>
</footer>

<!-- Clean Beige Menu Card (slides up from bottom nav) -->
<div class="mobile-sheet-backdrop" data-sheet-backdrop hidden></div>
<div class="mobile-sheet" id="mobile-nav" data-mobile-nav aria-modal="true" role="dialog" aria-label="Menu" hidden>
  <div class="mobile-sheet__handle-bar">
    <span class="mobile-sheet__handle"></span>
  </div>
  <div class="mobile-sheet__head">
    <p class="mobile-sheet__title">Menu</p>
    <button class="mobile-sheet__close" type="button" aria-label="Close menu" data-sheet-close>
      ${icons.close}
    </button>
  </div>

  <nav class="mobile-sheet__nav" aria-label="Site navigation">
    <a class="mobile-sheet__link" href="/">
      <span>Home</span>
      <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M7 4l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </a>
    <a class="mobile-sheet__link" href="/services">
      <span>Services</span>
      <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M7 4l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </a>
    <a class="mobile-sheet__link" href="/#work">
      <span>Our work</span>
      <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M7 4l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </a>
    <a class="mobile-sheet__link" href="/#process">
      <span>Process</span>
      <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M7 4l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </a>
    <a class="mobile-sheet__link" href="/#faq">
      <span>FAQs</span>
      <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M7 4l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </a>
    <a class="mobile-sheet__link" href="/contact">
      <span>Contact</span>
      <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M7 4l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </a>
  </nav>
</div>

<!-- Restructured Floating Bottom Navbar -->
<nav class="mobile-bar" aria-label="Quick contact and navigation">
  <button class="mobile-bar__btn mobile-bar__btn--menu" type="button" aria-expanded="false" aria-controls="mobile-nav" aria-label="Toggle navigation menu" data-menu-btn>
    <span class="mobile-bar__icon mobile-bar__icon--hamburger">${icons.menu}</span>
    <span class="mobile-bar__icon mobile-bar__icon--close">${icons.close}</span>
    <span class="mobile-bar__label mobile-bar__label--menu">Menu</span>
    <span class="mobile-bar__label mobile-bar__label--close">Close</span>
  </button>
  <a class="mobile-bar__btn mobile-bar__btn--call" href="tel:${site.phone}">${icons.phone}<span>Call</span></a>
  <a class="mobile-bar__btn mobile-bar__btn--wa" href="${waHref(WA_DEFAULT)}" target="_blank" rel="noopener noreferrer">${icons.whatsapp}<span>WhatsApp</span></a>
  <a class="mobile-bar__cta" href="/contact">${icons.arrow}<span>Get a quote</span></a>
</nav>`;
}

/* -------------------------------------------------------------- page shell */

function jsonLd(graph) {
  const safe = JSON.stringify(graph, null, 2)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
  return `<script type="application/ld+json">${safe}</script>`;
}

function localBusiness() {
  return {
    "@type": "HomeAndConstructionBusiness",
    "@id": `${site.url}/#business`,
    additionalType: "https://en.wikipedia.org/wiki/Interior_design",
    name: site.name,
    alternateName: [
      "AV Interior",
      "AV Interior Thoothukudi",
      "AV Interior Tuticorin",
      "AV Interiors",
      "AV Interior Decoration Thoothukudi",
      "AV Interior Decoration Tuticorin",
    ],
    description:
      "Interior and exterior decoration company in Thoothukudi (Tuticorin), serving Tamil Nadu. Modular kitchens, false ceilings, blinds, curtains, UPVC windows, aluminium partitions, toughened glass railings, vinyl and wooden flooring, and mosquito nets.",
    url: `${site.url}/`,
    image: `${site.url}/assets/img/og-cover.jpg`,
    logo: {
      "@type": "ImageObject",
      "@id": `${site.url}/#logo`,
      url: `${site.url}/icon-512.png`,
      contentUrl: `${site.url}/icon-512.png`,
      width: 512,
      height: 512,
      caption: site.name,
    },
    telephone: site.phone,
    email: site.email,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      telephone: site.phone,
      email: site.email,
      areaServed: "IN",
      availableLanguage: ["en", "ta"],
    },
    priceRange: "₹₹",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.street,
      addressLocality: site.locality,
      addressRegion: site.region,
      ...(site.postalCode ? { postalCode: site.postalCode } : {}),
      addressCountry: site.country,
    },
    hasMap: site.mapsLink,
    ...(site.sameAs?.length ? { sameAs: site.sameAs } : {}),
    ...(site.openingHours?.length
      ? {
          openingHoursSpecification: site.openingHours.map((slot) => ({
            "@type": "OpeningHoursSpecification",
            dayOfWeek: slot.days,
            opens: slot.opens,
            closes: slot.closes,
          })),
        }
      : {}),
    geo: {
      "@type": "GeoCoordinates",
      latitude: site.geo.lat,
      longitude: site.geo.lng,
    },
    areaServed: [
      ...(site.serviceAreas || ["Thoothukudi", "Tuticorin", "Tamil Nadu"]).map((area) => ({
        "@type": area === "Tamil Nadu" ? "AdministrativeArea" : "City",
        name: area,
      })),
    ],
    knowsAbout: [
      "Modular Kitchens and Cupboards",
      "Gypsum, Grid and PVC False Ceilings",
      "Zebra, Roller, Roman, Venetian and Bamboo Blinds",
      "UPVC Sliding and Openable Windows and Doors",
      "Powder-Coated Aluminium Partitions and Windows",
      "12 mm Toughened Glass Partitions and Balcony Railings",
      "Vinyl, Engineered Wooden and Carpet Flooring",
      "Pleated, Honeycomb and Magnetic Mosquito Nets",
      "Coastal Humidity-Resistant Interior Materials",
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Interior and exterior services",
      itemListElement: services.map((s) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: s.name,
          url: abs(`/services/${s.slug}`),
        },
      })),
    },
    ...(typeof googleReviewsData.rating === "number" &&
    typeof googleReviewsData.totalReviews === "number" &&
    googleReviewsData.totalReviews > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: googleReviewsData.rating,
            reviewCount: googleReviewsData.totalReviews,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    ...(allReviews.length
      ? {
          review: allReviews.map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.name },
            reviewRating: {
              "@type": "Rating",
              ratingValue: Math.max(1, Math.min(5, Number(r.rating) || 5)),
              bestRating: 5,
            },
            reviewBody: r.text,
          })),
        }
      : {}),
  };
}

function breadcrumbSchema(items) {
  return {
    "@type": "BreadcrumbList",
    "@id": `${site.url}${items[items.length - 1].href}#breadcrumb`,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      item: abs(item.href),
    })),
  };
}

function breadcrumbs(items) {
  return `<nav class="breadcrumbs" aria-label="Breadcrumb"><ol>${items
    .map(
      (item, i) =>
        `<li>${
          i === items.length - 1
            ? `<span aria-current="page">${esc(item.label)}</span>`
            : `<a href="${item.href}">${esc(item.label)}</a>`
        }</li>`,
    )
    .join("")}</ol></nav>`;
}

function reviewStars(rating) {
  const score = Math.max(0, Math.min(5, Number(rating) || 0));
  return `<span class="review-card__stars" role="img" aria-label="${score} out of 5">${Array.from(
    { length: 5 },
    (_, i) => `<span class="${i < score ? "is-on" : ""}">${icons.star}</span>`,
  ).join("")}</span>`;
}

function reviewCard(r, i) {
  const isGoogle = String(r.source || "").toLowerCase() === "google";
  const initial = (String(r.name || "C").trim().charAt(0) || "C").toUpperCase();
  const metaParts = [r.place, r.date].filter(Boolean);
  const safeReviewUrl = /^https:\/\//i.test(String(r.url || "")) ? r.url : "";
  const sourceBadge = isGoogle
    ? safeReviewUrl
      ? `<a class="review-card__source" href="${esc(safeReviewUrl)}" target="_blank" rel="noopener noreferrer" aria-label="View review on Google">${icons.googleG}<span>Google</span></a>`
      : `<span class="review-card__source">${icons.googleG}<span>Google</span></span>`
    : r.source
      ? `<span class="review-card__source">${esc(r.source)}</span>`
      : "";

  return `<figure class="review-card" data-reveal style="--i:${i % 3}">
    <div class="review-card__top">
      ${reviewStars(r.rating)}
      ${sourceBadge}
    </div>
    <blockquote><p>${esc(r.text)}</p></blockquote>
    <figcaption>
      <span class="review-card__avatar" aria-hidden="true">${esc(initial)}</span>
      <span class="review-card__author">
        <span class="review-card__name">${esc(r.name)}</span>
        ${metaParts.length ? `<span class="review-card__place">${esc(metaParts.join(" · "))}</span>` : ""}
      </span>
    </figcaption>
  </figure>`;
}

function reviewsBlock() {
  const ratingInputs = [5, 4, 3, 2, 1]
    .map(
      (n) =>
        `<input type="radio" id="review-rating-${n}" name="rating" value="${n}"${n === 5 ? " checked" : ""}>
        <label for="review-rating-${n}" title="${n} out of 5"><span aria-hidden="true">&#9733;</span><span class="sr-only">${n} out of 5</span></label>`,
    )
    .join("");

  const hasDirectReviewLink = googleReviewHref !== googleProfileHref;
  const hasGoogleSummary =
    typeof googleReviewsData.rating === "number" &&
    typeof googleReviewsData.totalReviews === "number" &&
    googleReviewsData.totalReviews > 0;

  const summaryBanner = hasGoogleSummary
    ? `<div class="reviews-summary" data-reveal>
      <div class="reviews-summary__score">
        <span class="reviews-summary__brand">${icons.googleG}<span>Google Reviews</span></span>
        <div class="reviews-summary__row">
          <strong class="reviews-summary__num">${esc(googleReviewsData.rating.toFixed(1))}</strong>
          <div>
            ${reviewStars(Math.round(googleReviewsData.rating))}
            <p class="reviews-summary__count">Based on ${esc(googleReviewsData.totalReviews)} Google review${googleReviewsData.totalReviews === 1 ? "" : "s"}</p>
          </div>
        </div>
      </div>
      <div class="reviews-summary__actions">
        <a class="btn btn--ink btn--sm" href="${esc(googleReviewHref)}" target="_blank" rel="noopener noreferrer">Write a Google review${icons.arrow}</a>
        <a class="link-arrow" href="${esc(googleProfileHref)}" target="_blank" rel="noopener noreferrer">View all on Google${icons.arrow}</a>
      </div>
    </div>`
    : "";

  const googleAttribution = googleReviews.length
    ? `<p class="reviews-attribution">${icons.googleG}<span>Verified customer reviews from our <a href="${esc(googleProfileHref)}" target="_blank" rel="noopener noreferrer">Google Business Profile</a>${googleReviewsData.syncedAt ? ` · Updated ${esc(googleReviewsData.syncedAt)}` : ""}.</span></p>`
    : "";

  return `<section class="section reviews-section" id="reviews" aria-labelledby="reviews-title">
  <div class="shell">
    <header class="section-head" data-reveal>
      <p class="eyebrow">Reviews</p>
      <div class="section-head__row">
        <h2 id="reviews-title">What clients say.</h2>
        <p class="section-lead">Read verified reviews on Google, or tell us how your own project went. Real feedback helps the next family choose with confidence.</p>
      </div>
    </header>

    ${summaryBanner}
    ${allReviews.length ? `<div class="review-grid">${allReviews.map(reviewCard).join("")}</div>` : ""}
    ${googleAttribution}

    <div class="reviews-layout">
      <div class="reviews-google" data-reveal>
        <p class="reviews-google__kicker">${icons.googleG} Google reviews</p>
        <div>
          <h3>See what others say.</h3>
          <p>Our reviews live on our Google Business profile, from homes, offices and shops across Thoothukudi and Tamil Nadu.</p>
        </div>
        <div class="reviews-google__actions">
          <a class="btn btn--ink" href="${esc(googleReviewHref)}" target="_blank" rel="noopener noreferrer">${
            hasDirectReviewLink ? "Write a Google review" : "Read &amp; place reviews on Google"
          }${icons.arrow}</a>
          ${
            hasDirectReviewLink
              ? `<a class="link-arrow" href="${esc(googleProfileHref)}" target="_blank" rel="noopener noreferrer">Read all reviews on Google${icons.arrow}</a>`
              : ""
          }
        </div>
      </div>

      <form class="review-form" data-review-form data-whatsapp="${site.whatsapp}" data-reveal>
        <h3>Leave a review</h3>
        <p class="review-form__lead">Tell us how the work went. We may publish it here with your name.</p>
        <div class="field">
          <label for="review-name">Your name <span aria-hidden="true">*</span></label>
          <input id="review-name" name="name" type="text" autocomplete="name" maxlength="60" required placeholder="e.g. Priya Raman">
        </div>
        <fieldset class="review-rating">
          <legend>Your rating</legend>
          <div class="review-stars">${ratingInputs}</div>
        </fieldset>
        <div class="field">
          <label for="review-message">Your review <span aria-hidden="true">*</span></label>
          <textarea id="review-message" name="review" rows="4" maxlength="600" required placeholder="What did we fit, how did it go, and would you recommend us?"></textarea>
        </div>
        <div class="form-actions">
          <button class="btn btn--accent" type="submit">Send review${icons.whatsapp}</button>
          <p class="form-note" data-review-status role="status" aria-live="polite">Opens WhatsApp with your review. We may publish it with your name.</p>
          <noscript>
            <p class="form-note form-note--noscript">This form needs JavaScript to compose the message. You can still <a href="${waHref("Hello AV Interior Decoration, I would like to leave a review.")}" target="_blank" rel="noopener noreferrer">send your review on WhatsApp</a> or <a href="mailto:${site.email}?subject=Review%20for%20AV%20Interior%20Decoration">email it</a>.</p>
          </noscript>
        </div>
      </form>
    </div>
  </div>
</section>`;
}

function faqBlock(faqs, { title = "Questions, answered", lead } = {}) {
  return `<section class="section section--sand" id="faq" aria-labelledby="faq-title">
  <div class="shell faq-layout">
    <header class="faq-intro" data-reveal>
      <p class="eyebrow">FAQ</p>
      <h2 id="faq-title">${esc(title)}</h2>
      ${lead ? `<p class="section-lead">${esc(lead)}</p>` : ""}
      <p class="faq-intro__note">Still unsure? Call <a href="tel:${site.phone}">${esc(site.phoneDisplay)}</a> — we are happy to talk it through before you commit to anything.</p>
    </header>
    <div class="faq-list">${faqs
      .map(
        (f, i) => `<details class="faq-item" data-reveal style="--i:${i % 5}">
        <summary><span>${esc(f.q)}</span>${icons.plus}</summary>
        <div class="faq-answer"><p>${esc(f.a)}</p></div>
      </details>`,
      )
      .join("")}</div>
  </div>
</section>`;
}

function ctaBlock({ title = "Tell us about your space.", body } = {}) {
  return `<section class="cta-band" aria-labelledby="cta-title">
  <div class="shell cta-band__inner" data-reveal>
    <div>
      <p class="eyebrow eyebrow--light">Next step</p>
      <h2 id="cta-title">${esc(title)}</h2>
      <p>${esc(
        body ||
          "Tell us which rooms you want to change. We will visit, measure and send you a clear quote.",
      )}</p>
    </div>
    <div class="cta-band__actions">
      <a class="btn btn--beige btn--lg" href="/contact">Book a site visit${icons.arrow}</a>
      <a class="cta-phone" href="tel:${site.phone}">${icons.phone}<span><small>Or call us directly</small>${esc(site.phoneDisplay)}</span></a>
    </div>
  </div>
</section>`;
}

function page({
  urlPath,
  title,
  description,
  body,
  className = "",
  graph = [],
  preload,
  primaryImage,
  robots = "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
  ogType = "website",
}) {
  const canonical = abs(urlPath);
  const pageImage = primaryImage || `${site.url}/assets/img/og-cover.jpg`;
  const fullGraph = {
    "@context": "https://schema.org",
    "@graph": [
      localBusiness(),
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: `${site.url}/`,
        name: site.name,
        alternateName: [
          "AV Interior",
          "AV Interior Thoothukudi",
          "AV Interior Tuticorin",
          "AV Interiors",
          "AV Interior Decoration Thoothukudi",
        ],
        inLanguage: "en-IN",
        publisher: { "@id": `${site.url}/#business` },
      },
      {
        "@type": "WebPage",
        "@id": `${canonical}#webpage`,
        url: canonical,
        name: title,
        description,
        isPartOf: { "@id": `${site.url}/#website` },
        about: { "@id": `${site.url}/#business` },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: pageImage,
        },
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: ["h1", ".hero-lead", ".page-hero__lead", ".aeo-facts", ".faq-answer"],
        },
        inLanguage: "en-IN",
      },
      ...graph,
    ],
  };

  return `<!DOCTYPE html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
<meta name="robots" content="${robots}">
<meta name="theme-color" content="#1B100B">
<meta name="format-detection" content="telephone=yes">
<meta name="geo.region" content="IN-TN">
<meta name="geo.placename" content="${esc(site.locality)}">
<meta name="geo.position" content="${site.geo.lat};${site.geo.lng}">
<meta name="ICBM" content="${site.geo.lat}, ${site.geo.lng}">

<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:locale" content="en_IN">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${site.url}/assets/img/og-cover.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Warm living room with wooden flooring and blinds, by AV Interior Decoration, Thoothukudi, serving Tamil Nadu">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${site.url}/assets/img/og-cover.jpg">
<meta name="twitter:image:alt" content="AV Interior Decoration, Thoothukudi, serving Tamil Nadu">

<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png">
<link rel="icon" type="image/png" sizes="96x96" href="/icon-96.png">
<link rel="icon" type="image/png" sizes="48x48" href="/icon-48.png">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="apple-touch-icon" sizes="180x180" href="/icon-180.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="alternate" type="text/plain" title="LLMs.txt" href="/llms.txt">
<link rel="alternate" hreflang="en-in" href="${canonical}">
<link rel="alternate" hreflang="x-default" href="${canonical}">
<link rel="preload" href="/fonts/geist-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/fraunces-latin.woff2" as="font" type="font/woff2" crossorigin>
${preload || ""}
<script>document.documentElement.classList.add("js");</script>
<link rel="stylesheet" href="/css/style.css?v=${CSS_V}">
${jsonLd(fullGraph)}
</head>
<body class="${className}">
<a class="skip-link" href="#main">Skip to content</a>
<div class="top-shell">
  <div class="local-strip">
    <div class="shell local-strip__inner">
      <p><span class="local-strip__tamil" lang="ta">தூத்துக்குடி</span><span class="local-strip__dot" aria-hidden="true"></span>Thoothukudi, Tamil Nadu</p>
      <p class="local-strip__note">Vanakkam. Site visits across Tamil Nadu.</p>
    </div>
  </div>
  ${header(urlPath)}
</div>
<main id="main">
${body}
</main>
${footer()}
<div class="lightbox" data-lightbox hidden>
  <div class="lightbox__inner" role="dialog" aria-modal="true" aria-label="Project photo">
    <button class="lightbox__close" type="button" data-lightbox-close aria-label="Close photo">${icons.close}</button>
    <img alt="" data-lightbox-img>
    <p class="lightbox__caption" data-lightbox-caption></p>
  </div>
</div>
<script src="/js/main.js?v=${JS_V}" defer></script>
<script defer src="/_vercel/insights/script.js"></script>
</body>
</html>
`;
}

/* -------------------------------------------------------------------- home */

function serviceCard(s, index, options = {}) {
  const titleId = `service-card-${s.slug}`;
  const cardId = options.id ? ` id="${esc(options.id)}"` : "";
  const href = `/services/${s.slug}`;

  return `<article class="service-card"${cardId} data-reveal style="--i:${index % 4}">
    <div class="service-card__media">
      ${img(s.cardImg, {
        alt: s.heroAlt,
        className: "service-card__img",
        sizes: "(max-width: 720px) 50vw, (max-width: 1024px) 33vw, 25vw",
      })}
    </div>
    <div class="service-card__scrim" aria-hidden="true"></div>
    <a class="service-card__cover" href="${href}" aria-labelledby="${titleId}"></a>
    <div class="service-card__content">
      <h3 id="${titleId}" class="service-card__title">${esc(s.name)}</h3>
    </div>
  </article>`;
}

const galleryCategories = [...new Set(gallery.map((item) => item.category).filter((slug) => slug && serviceBySlug[slug]))];

const homeGalleryHtml = `
    ${
      galleryCategories.length > 1
        ? `<div class="chip-row gallery-filters" role="group" aria-label="Filter work by category" data-gallery-filters>
      <button class="chip" type="button" data-gallery-filter="all" aria-pressed="true">All</button>
      ${galleryCategories
        .map(
          (slug) =>
            `<button class="chip" type="button" data-gallery-filter="${esc(slug)}" aria-pressed="false">${esc(serviceBySlug[slug].name)}</button>`,
        )
        .join("")}
    </div>`
        : ""
    }
    <div class="gallery" data-gallery-grid>
      ${gallery
        .map(
          (item, i) => `<a class="gallery__item" href="/assets/img/${largestVariantFor(item.img)}.webp" data-lightbox-item data-caption="${esc(item.caption)}" data-category="${esc(item.category || "")}" data-reveal style="--i:${i % 3}">
        ${img(item.img, {
          alt: item.alt,
          sizes: "(max-width: 700px) 100vw, 33vw",
        })}
        <span class="gallery__label">${esc(item.caption)}</span>
      </a>`,
        )
        .join("")}
    </div>`;

const homeBody = `
<section class="hero">
  <div class="shell hero-grid">
    <div class="hero-copy">
      <p class="eyebrow">Vanakkam · Thoothukudi · Tamil Nadu</p>
      <h1>Interiors in Thoothukudi, made for the way you <em>live</em>.</h1>
      <p class="hero-lead">We fit modular kitchens, false ceilings, UPVC windows, blinds and flooring. Our office is in Thoothukudi and we work across Tamil Nadu. Ten years, 500 homes and shops. The same people answer the phone from the first call to the final fitting.</p>
      <div class="hero-actions">
        <a class="btn btn--accent btn--lg" href="/contact">Get a free quote${icons.arrow}</a>
        <a class="link-arrow" href="/services">Explore the services${icons.arrow}</a>
      </div>
      <p class="hero-local"><span lang="ta">நம்ம ஊரு, நம்ம வீடு.</span> Our town, our homes.</p>
      <div class="hero-stats">
        <div><strong>10+</strong><span>years on site</span></div>
        <div><strong>500+</strong><span>projects delivered</span></div>
        <div><strong>8</strong><span>service lines</span></div>
      </div>
    </div>

    <div class="hero-media" data-parallax>
      <span class="hero-doodle" aria-hidden="true">
        <svg viewBox="0 0 136 86" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 76c22-7 45-22 70-47" stroke-dasharray="2 7"/>
          <path d="M66 24l14-3-2 14"/>
          <path d="M112 66c6-4 12-9 17-15" opacity="0.6"/>
        </svg>
      </span>
      <figure>
        ${img("hero1-1440", {
          alt: "Living and dining room with wooden flooring, window blinds and warm pendant lights",
          sizes: "(max-width: 960px) 100vw, 46vw",
          loading: "eager",
          priority: true,
        })}
        <figcaption class="hero-badge">
          <span class="hero-badge__num">10+ years</span>
          <span class="hero-badge__text">interior &amp; exterior work across Tamil Nadu</span>
        </figcaption>
      </figure>
    </div>
  </div>
</section>

<div class="trust-bar">
  <div class="shell trust-bar__inner">
    ${trustPoints.map((point) => `<p>${icons.check}${esc(point)}</p>`).join("")}
  </div>
</div>

<section class="local-band" aria-label="A note from Thoothukudi">
  <div class="shell local-band__inner">
    <p class="local-band__tamil" lang="ta">நம்ம ஊரு. நம்ம வீடு. நம்ம வேலை.</p>
    <p class="local-band__en">Our town. Our homes. Our work.<span>A Thoothukudi team, working across Tamil Nadu. The people on site are the people you speak to.</span></p>
  </div>
</section>

<section class="section services-section" id="services" aria-labelledby="services-title">
  <div class="shell">
    <header class="section-head" data-reveal>
      <p class="eyebrow">What we do</p>
      <div class="section-head__row">
        <h2 id="services-title">One team for the whole interior.</h2>
        <p class="section-lead">Most jobs need more than one trade. We do the ceiling, storage, windows and flooring together, so the measurements match and you are not stuck between contractors.</p>
      </div>
    </header>
    <div class="service-grid">
      ${services.map(serviceCard).join("")}
    </div>
    <p class="section-foot"><a class="link-arrow" href="/services">See all services in detail${icons.arrow}</a></p>
  </div>
</section>

<section class="section section--sand" id="about" aria-labelledby="about-title">
  <div class="shell split">
    <figure class="split__media split__media--tall" data-reveal>
      ${img("a8-960", {
        alt: "Bedroom with a blue accent wall, layered false ceiling and soft curtains",
        sizes: "(max-width: 900px) 100vw, 46vw",
      })}
      <figcaption>Bedroom with a layered ceiling and made-to-measure curtains</figcaption>
    </figure>
    <div class="split__body" data-reveal>
      <p class="eyebrow">Our people</p>
      <h2 id="about-title">Built around how the work actually happens.</h2>
      <p class="section-lead">We are based in Thoothukudi and work across Tamil Nadu. On most interior jobs, things go wrong between one trade and the next. We stay on the job until the handover is done.</p>
      <ul class="why-list">
        ${whyPoints
          .map(
            (point) => `<li>
          <h3>${esc(point.title)}</h3>
          <p>${esc(point.body)}</p>
        </li>`,
          )
          .join("")}
      </ul>
      <p class="split__note">${icons.pin}Based in ${esc(site.street)}, ${esc(site.locality)}. Site visits across Tamil Nadu.</p>
    </div>
  </div>
</section>

<section class="section" id="process" aria-labelledby="process-title">
  <div class="shell">
    <header class="section-head" data-reveal>
      <p class="eyebrow">How we work</p>
      <div class="section-head__row">
        <h2 id="process-title">Four steps, start to finish.</h2>
        <p class="section-lead">Every job follows the same order. You will know what happens next, and what it costs, before we start.</p>
      </div>
    </header>
    <ol class="process-list">
      ${processSteps
        .map(
          (step, i) => `<li data-reveal style="--i:${i}">
        <span class="process-list__num">${String(i + 1).padStart(2, "0")}</span>
        <h3>${esc(step.title)}</h3>
        <p>${esc(step.body)}</p>
      </li>`,
        )
        .join("")}
    </ol>
  </div>
</section>

<section class="section section--sand" id="work" aria-labelledby="work-title">
  <div class="shell">
    <header class="section-head" data-reveal>
      <p class="eyebrow">Selected work</p>
      <div class="section-head__row">
        <h2 id="work-title">A look at recent work.</h2>
        <p class="section-lead">Ceilings, kitchens, railings and windows from homes and offices in Thoothukudi and across Tamil Nadu. Tap any photo to see it larger.</p>
      </div>
    </header>
    ${homeGalleryHtml}
  </div>
</section>

${reviewsBlock()}

${faqBlock(homeFaqs, {
  lead: "The things people usually ask before a first site visit.",
})}
`;

const homeGraph = [
  {
    "@type": "FAQPage",
    "@id": `${site.url}/#faq`,
    mainEntity: homeFaqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  },
  {
    "@type": "HowTo",
    "@id": `${site.url}/#process-howto`,
    name: "How AV Interior Decoration plans and completes an interior project in Thoothukudi and Tamil Nadu",
    description:
      "Our four-step interior and exterior execution workflow from site visit and measurement to itemised quotation and handover.",
    step: processSteps.map((step, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: step.title,
      text: step.body,
    })),
  },
];

/* ------------------------------------------------------------------ pages */

const pages = [];

pages.push({
  file: "index.html",
  urlPath: "/",
  title: "AV Interior Decoration | Interior Designers in Thoothukudi",
  description:
    "Trusted interior designers in Thoothukudi (Tuticorin) & Tamil Nadu. Modular kitchens, false ceilings, UPVC windows, blinds & flooring. Free site visit.",
  body: homeBody,
  graph: homeGraph,
  preload: `<link rel="preload" as="image" href="/assets/img/hero1-1440.webp" imagesrcset="${srcset(
    "hero1",
    [960, 1440, 2000],
  )}" imagesizes="(max-width: 960px) 100vw, 46vw" media="(min-width: 961px)" fetchpriority="high">`,
});

/* services index */
const serviceIndexBody = `
<section class="page-hero">
  <div class="shell">
    ${breadcrumbs([
      { label: "Home", href: "/" },
      { label: "Services", href: "/services" },
    ])}
    <p class="eyebrow">Services</p>
    <h1>Interior and exterior services in Thoothukudi and across Tamil Nadu.</h1>
    <p class="page-hero__lead">Eight service lines, from the ceiling to the floor. We handle the trades together so the measurements, materials and fittings line up.</p>
    <div class="chip-row">${services
      .map((s) => `<a class="chip" href="#${s.slug}">${esc(s.name)}</a>`)
      .join("")}</div>
  </div>
</section>

<section class="section section--tight" id="all-services">
  <div class="shell">
    <div class="service-grid">
      ${services.map((s, i) => serviceCard(s, i, { id: s.slug })).join("")}
    </div>
  </div>
</section>

${ctaBlock({ title: "Not sure which of these you need?" })}
`;

pages.push({
  file: "services/index.html",
  urlPath: "/services",
  title: "Interior Services in Thoothukudi | AV Interior Decoration",
  description:
    "Complete home & office interior services in Thoothukudi (Tuticorin) & Tamil Nadu: kitchens, ceilings, UPVC windows, blinds, glass railings & flooring.",
  body: serviceIndexBody,
  graph: [
    breadcrumbSchema([
      { label: "Home", href: "/" },
      { label: "Services", href: "/services" },
    ]),
    {
      "@type": "CollectionPage",
      "@id": `${site.url}/services#webpage`,
      url: abs("/services"),
      name: "Interior and exterior services in Thoothukudi and Tamil Nadu",
      isPartOf: { "@id": `${site.url}/#website` },
      about: { "@id": `${site.url}/#business` },
    },
  ],
});

/* service detail pages */
for (const [index, s] of services.entries()) {
  const related = [1, 2, 3].map((n) => services[(index + n) % services.length]);
  const extraPhotos = [...(categoryGallery[s.slug] || []), ...(s.gallery || [])];
  const categoryPhotosSection = extraPhotos.length
    ? `
<section class="section" id="category-gallery" aria-labelledby="category-gallery-title">
  <div class="shell">
    <header class="section-head" data-reveal>
      <p class="eyebrow">Project photos</p>
      <div class="section-head__row">
        <h2 id="category-gallery-title">Recent ${esc(nameLower(s.name))} work.</h2>
        <p class="section-lead">Tap any photo to inspect finishes and fitting details up close.</p>
      </div>
    </header>
    <div class="gallery">
      ${extraPhotos
        .map(
          (item, i) => `<a class="gallery__item" href="/assets/img/${largestVariantFor(item.img)}.webp" data-lightbox-item data-caption="${esc(item.caption)}" data-reveal style="--i:${i % 3}">
        ${img(item.thumb || item.img, {
          alt: item.alt || item.caption,
          sizes: "(max-width: 700px) 100vw, 33vw",
        })}
        <span class="gallery__label">${esc(item.caption)}</span>
      </a>`,
        )
        .join("")}
    </div>
  </div>
</section>`
    : "";
  const body = `
<section class="page-hero page-hero--split">
  <div class="shell split split--hero">
    <div class="split__body" data-reveal>
      ${breadcrumbs([
        { label: "Home", href: "/" },
        { label: "Services", href: "/services" },
        { label: s.name, href: `/services/${s.slug}` },
      ])}
      <p class="eyebrow">Service</p>
      <h1>${esc(s.h1)}</h1>
      <p class="page-hero__lead">${esc(s.lead)}</p>
      <div class="hero-actions">
        <a class="btn btn--accent" href="/contact?service=${s.slug}">Ask for a quote${icons.arrow}</a>
        <a class="link-arrow" href="tel:${site.phone}">${esc(site.phoneDisplay)}</a>
      </div>
    </div>
    <figure class="split__media" data-reveal>
      ${img(s.heroImg, {
        alt: s.heroAlt,
        sizes: "(max-width: 900px) 100vw, 46vw",
        loading: "eager",
        priority: true,
      })}
    </figure>
  </div>
</section>

<section class="section" aria-labelledby="about-service">
  <div class="shell narrow-grid">
    <div class="prose">
      <p class="eyebrow">The approach</p>
      <h2 id="about-service">${esc(s.name)} in Thoothukudi (Tuticorin) and across Tamil Nadu</h2>
      ${s.intro.map((p) => `<p>${esc(p)}</p>`).join("")}
      <dl class="aeo-facts" aria-label="${esc(s.name)} quick facts">
        <div class="aeo-facts__item">
          <dt>Options &amp; materials</dt>
          <dd>${esc(s.types.map((t) => t.name).join(", "))}</dd>
        </div>
        <div class="aeo-facts__item">
          <dt>Service area</dt>
          <dd>Thoothukudi (Tuticorin), Tiruchendur, Kovilpatti, Tirunelveli, Nagercoil, Madurai &amp; across Tamil Nadu</dd>
        </div>
        <div class="aeo-facts__item">
          <dt>Quotation &amp; visit</dt>
          <dd>Free on-site measurement, material samples &amp; itemised quote</dd>
        </div>
        <div class="aeo-facts__item">
          <dt>Office &amp; hours</dt>
          <dd>${esc(site.locality)} ${esc(site.postalCode)} · ${esc(site.hoursDisplay)}</dd>
        </div>
      </dl>
    </div>
    <aside class="included" aria-labelledby="included-title" data-reveal>
      <h2 id="included-title">What is included</h2>
      <ul class="check-list">
        ${s.includes.map((item) => `<li>${icons.check}${esc(item)}</li>`).join("")}
      </ul>
      <p class="included__note">Every quote is itemised, so you can see the material and labour behind each line.</p>
    </aside>
  </div>
</section>

<section class="section section--sand" aria-labelledby="types-title">
  <div class="shell">
    <header class="section-head" data-reveal>
      <p class="eyebrow">Options</p>
      <div class="section-head__row">
        <h2 id="types-title">What we fit</h2>
        <p class="section-lead">Samples and photographs are one thing; seeing the material in your own light is better. We bring options to the site visit.</p>
      </div>
    </header>
    <div class="type-grid">
      ${s.types
        .map(
          (t) => `<figure class="type-card" data-reveal>
        <a class="type-card__link" href="/assets/img/${largestVariantFor(t.img)}.webp" data-lightbox-item data-caption="${esc(t.name)}">
          ${img(t.img, { alt: t.alt, sizes: "(max-width: 620px) 100vw, (max-width: 1000px) 50vw, 25vw" })}
          <figcaption>${esc(t.name)}</figcaption>
        </a>
      </figure>`,
        )
        .join("")}
    </div>
  </div>
</section>
${categoryPhotosSection}

<section class="section" aria-labelledby="notes-title">
  <div class="shell">
    <header class="section-head" data-reveal>
      <p class="eyebrow">Good to know</p>
      <div class="section-head__row">
        <h2 id="notes-title">Details that decide how it lasts</h2>
      </div>
    </header>
    <ol class="notes-grid">
      ${s.notes
        .map(
          (n, i) => `<li data-reveal style="--i:${i % 3}">
        <span class="notes-grid__num">${String(i + 1).padStart(2, "0")}</span>
        <h3>${esc(n.title)}</h3>
        <p>${esc(n.body)}</p>
      </li>`,
        )
        .join("")}
    </ol>
  </div>
</section>

${faqBlock(s.faqs, { title: `${s.name}: common questions` })}

<section class="section" aria-labelledby="related-title">
  <div class="shell">
    <header class="section-head" data-reveal>
      <p class="eyebrow">Related</p>
      <div class="section-head__row">
        <h2 id="related-title">Often done at the same time</h2>
        <p class="section-lead">If you are already moving trades in, these are the services most clients pair with ${esc(nameLower(s.name))}.</p>
      </div>
    </header>
    <div class="service-grid service-grid--related">
      ${related.map((r, i) => serviceCard(r, i)).join("")}
    </div>
  </div>
</section>

${ctaBlock({ title: `Planning ${nameLower(s.name)}?` })}
`;

  pages.push({
    file: `services/${s.slug}.html`,
    urlPath: `/services/${s.slug}`,
    title: s.title,
    description: s.description,
    primaryImage: `${site.url}/assets/img/${largestVariantFor(s.heroImg)}.webp`,
    body,
    graph: [
      breadcrumbSchema([
        { label: "Home", href: "/" },
        { label: "Services", href: "/services" },
        { label: s.name, href: `/services/${s.slug}` },
      ]),
      {
        "@type": "Service",
        "@id": `${site.url}/services/${s.slug}#service`,
        name: s.name,
        serviceType: s.name,
        description: s.description,
        url: abs(`/services/${s.slug}`),
        image: `${site.url}/assets/img/${largestVariantFor(s.heroImg)}.webp`,
        provider: { "@id": `${site.url}/#business` },
        areaServed: (site.serviceAreas || ["Thoothukudi", "Tuticorin", "Tamil Nadu"]).map((area) => ({
          "@type": area === "Tamil Nadu" ? "AdministrativeArea" : "City",
          name: area,
        })),
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: `${s.name} options`,
          itemListElement: s.types.map((t) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: t.name,
            },
          })),
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${site.url}/services/${s.slug}#faq`,
        mainEntity: s.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  });
}

/* contact */
const allOptions = services
  .map(
    (s) => `<optgroup label="${esc(s.name)}">${s.types
      .map((t) => `<option value="${esc(s.name)} — ${esc(t.name)}">${esc(t.name)}</option>`)
      .join("")}</optgroup>`,
  )
  .join("");

const contactBody = `
<section class="page-hero">
  <div class="shell">
    ${breadcrumbs([
      { label: "Home", href: "/" },
      { label: "Contact", href: "/contact" },
    ])}
    <p class="eyebrow">Contact</p>
    <h1>Let us look at the space first.</h1>
    <p class="page-hero__lead">Tell us the rooms you want to change and roughly what you have in mind. We will visit, measure and send a clear quote. We work in Thoothukudi and across Tamil Nadu.</p>
  </div>
</section>

<section class="section section--tight">
  <div class="shell contact-layout">
    <div class="contact-card" data-reveal>
      <h2>Request a site visit</h2>
      <p class="contact-card__lead">Fill this in and we will open WhatsApp with your details ready to send. Nothing is stored on this website.</p>
      <form class="quote-form" data-quote-form data-service-map='${esc(
        JSON.stringify(Object.fromEntries(services.map((s) => [s.slug, s.name]))),
      )}'>
        <div class="field">
          <label for="name">Your name <span aria-hidden="true">*</span></label>
          <input id="name" name="name" type="text" autocomplete="name" maxlength="60" required placeholder="e.g. Priya Raman">
        </div>
        <div class="field">
          <label for="phone">Phone number <span aria-hidden="true">*</span></label>
          <input id="phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" maxlength="20" required placeholder="10-digit mobile number">
        </div>
        <div class="field">
          <label for="location">Area or landmark</label>
          <input id="location" name="location" type="text" autocomplete="street-address" maxlength="100" placeholder="e.g. Thoothukudi, or your town">
        </div>
        <div class="field">
          <label for="service">What do you need?</label>
          <select id="service" name="service">
            <option value="">Select a service (optional)</option>
            ${allOptions}
          </select>
        </div>
        <div class="field field--full">
          <label for="message">Anything else we should know?</label>
          <textarea id="message" name="message" rows="4" maxlength="600" placeholder="Room sizes, timeline, existing work, budget range…"></textarea>
        </div>
        <div class="field field--full form-actions">
          <button class="btn btn--accent btn--lg" type="submit">Send on WhatsApp${icons.whatsapp}</button>
          <p class="form-note" data-form-status role="status" aria-live="polite">We reply during working hours, usually the same day.</p>
          <noscript>
            <p class="form-note form-note--noscript">This form needs JavaScript to compose the message. You can still call <a href="tel:${site.phone}">${esc(site.phoneDisplay)}</a> or <a href="${waHref(WA_DEFAULT)}" target="_blank" rel="noopener noreferrer">message us on WhatsApp</a> directly.</p>
          </noscript>
        </div>
      </form>
    </div>

    <aside class="contact-aside" aria-labelledby="contact-details" data-reveal>
      <h2 id="contact-details">Or talk to us directly</h2>
      <ul class="contact-list">
        <li>
          <span class="contact-list__icon">${icons.phone}</span>
          <div><h3>Phone</h3><a href="tel:${site.phone}">${esc(site.phoneDisplay)}</a></div>
        </li>
        <li>
          <span class="contact-list__icon">${icons.whatsapp}</span>
          <div><h3>WhatsApp</h3><a href="${waHref(WA_DEFAULT)}" target="_blank" rel="noopener noreferrer">Message us</a></div>
        </li>
        <li>
          <span class="contact-list__icon">${icons.mail}</span>
          <div>
            <h3>Email</h3>
            <a href="mailto:${site.email}">${esc(site.email)}</a><br>
            <a href="mailto:${site.ownerEmail}">${esc(site.ownerEmail)}</a>
          </div>
        </li>
        <li>
          <span class="contact-list__icon">${icons.pin}</span>
          <div>
            <h3>Office &amp; hours</h3>
            <address>${esc(site.street)},<br>${esc(site.locality)}, ${esc(site.region)}${site.postalCode ? ` ${esc(site.postalCode)}` : ""}<br>${site.hoursDisplay ? `${esc(site.hoursDisplay)}<br>` : ""}<a href="${site.mapsLink}" target="_blank" rel="noopener noreferrer">Open in Google Maps</a></address>
          </div>
        </li>
      </ul>
      <div class="map">
        <iframe
          src="${site.mapsEmbed}"
          title="Map showing AV Interior Decoration in Thoothukudi"
          width="600" height="360" loading="lazy" allowfullscreen
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          referrerpolicy="no-referrer-when-downgrade"></iframe>
      </div>
      <p class="contact-aside__note">Visiting? Call ahead so we can keep the samples you want to see ready.</p>
    </aside>
  </div>
</section>
`;

pages.push({
  file: "contact.html",
  urlPath: "/contact",
  title: "Contact AV Interior Decoration | Thoothukudi, Tamil Nadu",
  description:
    "Book a free interior site visit & itemised quote in Thoothukudi (Tuticorin) or anywhere in Tamil Nadu. Call or WhatsApp +91 97150 32513 today.",
  body: contactBody,
  graph: [
    breadcrumbSchema([
      { label: "Home", href: "/" },
      { label: "Contact", href: "/contact" },
    ]),
    {
      "@type": "ContactPage",
      "@id": `${site.url}/contact#webpage`,
      url: abs("/contact"),
      name: "Contact AV Interior Decoration",
      isPartOf: { "@id": `${site.url}/#website` },
    },
  ],
});

/* legal */
function legalPage(slug, title, description, sections) {
  return `
<section class="page-hero page-hero--small">
  <div class="shell">
    ${breadcrumbs([
      { label: "Home", href: "/" },
      { label: title, href: `/${slug}` },
    ])}
    <p class="eyebrow">Legal</p>
    <h1>${esc(title)}</h1>
    <p class="page-hero__lead">Last updated 21 October 2026.</p>
  </div>
</section>
<section class="section">
  <div class="shell prose prose--wide">
    ${sections
      .map(
        (s) => `<h2>${esc(s.h)}</h2>${s.p.map((p) => `<p>${esc(p)}</p>`).join("")}`,
      )
      .join("")}
  </div>
</section>`;
}

pages.push({
  file: "privacy.html",
  urlPath: "/privacy",
  title: "Privacy Policy | AV Interior Decoration",
  description:
    "How AV Interior Decoration handles the details you share when you call, message on WhatsApp or request a site visit in Thoothukudi or anywhere in Tamil Nadu.",
  body: legalPage("privacy", "Privacy Policy", "", [
    {
      h: "What this page covers",
      p: [
        "This website is an information site for AV Interior Decoration, based in Thoothukudi, Tamil Nadu. It does not create accounts or store form submissions on a server.",
      ],
    },
    {
      h: "Details you send us",
      p: [
        "The quotation form and the review form prepare a message in WhatsApp using the details you type. That message is sent from your own WhatsApp account and is subject to WhatsApp's privacy terms. We use the details only to reply, arrange a site visit and prepare a quotation, and we ask before publishing a review.",
        "If you call or message us directly, we keep the contact details and measurements needed to quote for and carry out the work. We do not sell or rent your details to anyone.",
      ],
    },
    {
      h: "Analytics and embedded content",
      p: [
        "We use Vercel Web Analytics to see which pages are visited. It records aggregate page views and does not use cookies or build a personal profile. We do not use it to identify individual visitors.",
        "The contact page embeds a Google Map. Loading it may allow Google to set cookies or collect usage data under its own policies. If you prefer not to load the map, use the phone number or the Google Maps link instead.",
      ],
    },
    {
      h: "Your choices",
      p: [
        "You can ask us to correct or delete the contact details we hold by calling the number on the contact page. If you have already sent a WhatsApp message, delete it from the conversation in the usual way.",
      ],
    },
  ]),
});

pages.push({
  file: "terms.html",
  urlPath: "/terms",
  title: "Terms of Use | AV Interior Decoration",
  description:
    "Terms for using the AV Interior Decoration website, including how quotations, photographs and project information should be read.",
  body: legalPage("terms", "Terms of Use", "", [
    {
      h: "Information on this site",
      p: [
        "The pages here describe the interior and exterior services offered by AV Interior Decoration in Thoothukudi and across Tamil Nadu. They are for general information and do not form a contract or a fixed offer.",
      ],
    },
    {
      h: "Quotations and project scope",
      p: [
        "Prices are quoted separately after a site visit and measurement. A quotation states the materials, scope and validity for that specific job. Anything not listed in the quotation is outside its scope.",
        "Timelines depend on site readiness, material availability and the sequence of other trades. The agreed timeline for your project is the one written into your quotation.",
      ],
    },
    {
      h: "Photographs and finishes",
      p: [
        "Project photographs show work we have carried out, but lighting, camera settings and screens vary. Material samples, not photographs, are the reference for colour and finish. Natural materials such as wood and stone vary from batch to batch.",
      ],
    },
    {
      h: "Website content",
      p: [
        "The text, layout and photographs on this site belong to AV Interior Decoration or are used with permission. Please ask before reusing them. If you spot something that is wrong or out of date, tell us and we will correct it.",
      ],
    },
  ]),
});

pages.push({
  file: "404.html",
  urlPath: "/404",
  title: "Page not found | AV Interior Decoration",
  description: "The page you were looking for has moved. Browse our interior services or contact AV Interior Decoration in Thoothukudi, serving Tamil Nadu.",
  robots: "noindex,follow",
  body: `
<section class="page-hero page-hero--small">
  <div class="shell">
    <p class="eyebrow">404</p>
    <h1>That page has moved.</h1>
    <p class="page-hero__lead">The link may be old, or the address may have a typo. These pages will get you back on track.</p>
    <div class="hero-actions">
      <a class="btn btn--ink" href="/">Back to the homepage${icons.arrow}</a>
      <a class="link-arrow" href="/services">Browse services${icons.arrow}</a>
    </div>
  </div>
</section>
<section class="section section--tight">
  <div class="shell">
    <div class="service-grid service-grid--related">
      ${services.slice(0, 4).map(serviceCard).join("")}
    </div>
  </div>
</section>`,
});

/* ------------------------------------------------------------------ write */

const written = new Set();

for (const p of pages) {
  const html = page({
    urlPath: p.urlPath,
    title: p.title,
    description: p.description,
    body: p.body,
    graph: p.graph || [],
    preload: p.preload,
    primaryImage: p.primaryImage,
    robots: p.robots,
    className: p.urlPath === "/" ? "home" : "subpage",
    ogType: "website",
  });
  const file = path.join(out, p.file);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  written.add(path.resolve(file));
  console.log(`wrote public/${p.file.replace(/\\/g, "/")} (${Math.round(html.length / 1024)} KB)`);
}

/* Remove HTML pages left behind by renames or deleted services. */
function pruneHtml(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      pruneHtml(full);
    } else if (entry.name.endsWith(".html") && !written.has(path.resolve(full))) {
      fs.unlinkSync(full);
      console.log(`removed stale public/${path.relative(out, full).replace(/\\/g, "/")}`);
    }
  }
}
if (fs.existsSync(out)) pruneHtml(out);


/* robots + sitemap + manifest + llms.txt (AEO) */

fs.writeFileSync(
  path.join(out, "robots.txt"),
  `# ${site.name}
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

User-agent: Googlebot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

Sitemap: ${site.url}/sitemap.xml
`,
);

const fullAddress = `${site.street}, ${site.locality}${site.localityAlt ? ` (${site.localityAlt})` : ""}, ${site.region}${site.postalCode ? ` ${site.postalCode}` : ""}, ${site.countryName}`;

const llmsTxt = `# ${site.name}

> Interior and exterior design, fabrication and fitting team based in ${site.locality} (${site.localityAlt}), ${site.region}. Over ${site.yearsExperience} years on site and ${site.projects} residential and commercial projects across Tamil Nadu.

## Business details
- Name: ${site.name}
- Address: ${fullAddress}
- Phone / WhatsApp: ${site.phoneDisplay} (${site.phone})
- Email: ${site.email}
- Hours: ${site.hoursDisplay}
- Google Maps: ${site.mapsLink}
- Service Areas: ${(site.serviceAreas || []).join(", ")}
- Quotation Policy: Free site visit, on-site measurement, material samples and itemised quote separating material and labour.

## Services
${services.map((s) => `- [${s.name}](${abs(`/services/${s.slug}`)}): ${s.short} Options: ${s.types.map((t) => t.name).join(", ")}.`).join("\n")}

## Key pages
- [Home](${abs("/")}): Overview, selected work, process and FAQs
- [All Services](${abs("/services")}): All eight interior and exterior service lines
- [Contact & Site Visit](${abs("/contact")}): Request a free site visit and itemised quotation
- [Full AEO Knowledge Base](${abs("/llms-full.txt")}): Detailed service specifications, coastal material advice and all FAQs
`;

const llmsFullTxt = `# ${site.name} — Complete Knowledge Base

## Entity overview
- Business Name: ${site.name} (also known as AV Interior Thoothukudi, AV Interior Tuticorin, AV Interiors)
- Category: Home & Construction Business / Interior and Exterior Decoration
- Office Address: ${fullAddress}
- Coordinates: ${site.geo.lat}, ${site.geo.lng}
- Phone & WhatsApp: ${site.phoneDisplay}
- Email: ${site.email}, ${site.ownerEmail}
- Opening Hours: ${site.hoursDisplay}
- Google Maps Profile: ${site.mapsLink}
- Experience: ${site.yearsExperience} years, ${site.projects} delivered projects
- Service Area: ${(site.serviceAreas || []).join(", ")}

## Why clients choose ${site.name}
${whyPoints.map((p) => `- **${p.title}**: ${p.body}`).join("\n")}

## Four-step work process
${processSteps.map((s, i) => `${i + 1}. **${s.title}**: ${s.body}`).join("\n")}

## Services in detail
${services
  .map(
    (s) => `### ${s.name}
- URL: ${abs(`/services/${s.slug}`)}
- Summary: ${s.lead}
- Details: ${s.intro.join(" ")}
- Included: ${s.includes.join("; ")}
- Options & Materials: ${s.types.map((t) => t.name).join(", ")}
- Technical Notes:
${s.notes.map((n) => `  - ${n.title}: ${n.body}`).join("\n")}
- FAQs:
${s.faqs.map((f) => `  - Q: ${f.q}\n    A: ${f.a}`).join("\n")}`,
  )
  .join("\n\n")}

## Frequently Asked Questions
${homeFaqs.map((f) => `- Q: ${f.q}\n  A: ${f.a}`).join("\n")}${
  allReviews.length
    ? `

## Client Reviews${
        typeof googleReviewsData.rating === "number" && googleReviewsData.totalReviews
          ? ` (${googleReviewsData.rating}/5 across ${googleReviewsData.totalReviews} Google reviews)`
          : ""
      }
${allReviews.map((r) => `- ${r.name} (${r.rating}/5${r.source ? `, ${r.source}` : ""}): "${r.text}"`).join("\n")}`
    : ""
}
`;

fs.writeFileSync(path.join(out, "llms.txt"), llmsTxt);
fs.writeFileSync(path.join(out, "llms-full.txt"), llmsFullTxt);

const sitemapPaths = pages
  .filter((p) => !p.robots?.includes("noindex"))
  .map((p) => ({ path: p.urlPath, priority: p.urlPath === "/" ? "1.0" : p.urlPath === "/services" ? "0.9" : p.urlPath.startsWith("/services/") ? "0.8" : p.urlPath === "/contact" ? "0.7" : "0.2" }));

fs.writeFileSync(
  path.join(out, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapPaths
  .map(
    (p) => `  <url>
    <loc>${abs(p.path)}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${p.path === "/" ? "monthly" : "yearly"}</changefreq>
    <priority>${p.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`,
);

fs.writeFileSync(
  path.join(out, "site.webmanifest"),
  JSON.stringify(
    {
      name: site.name,
      short_name: site.shortName,
      description: site.tagline,
      start_url: "/",
      display: "standalone",
      background_color: "#F6EFE4",
      theme_color: "#1B100B",
      icons: [
        { src: "/icon-48.png", sizes: "48x48", type: "image/png" },
        { src: "/icon-96.png", sizes: "96x96", type: "image/png" },
        { src: "/icon-144.png", sizes: "144x144", type: "image/png" },
        { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
    },
    null,
    2,
  ),
);

console.log("wrote robots.txt, sitemap.xml, site.webmanifest, llms.txt, llms-full.txt");
