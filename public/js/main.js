/**
 * AV Interior Decoration — page behaviour.
 *
 * Small, dependency-free progressive enhancements:
 *   · sticky header shadow
 *   · mobile navigation panel
 *   · project photo lightbox
 *   · quotation form that composes a WhatsApp message
 */
(() => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  // Reveal-on-scroll is only hidden once this file is actually running, so a
  // script failure leaves the page fully readable instead of blank.
  document.documentElement.classList.add("reveal");

  /* ------------------------------------------------------------ a11y helpers */

  const FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  const focusables = (container) =>
    $$(FOCUSABLE, container).filter(
      (el) => !el.hasAttribute("hidden") && el.getClientRects().length > 0,
    );

  const trapTab = (container, event) => {
    if (event.key !== "Tab") return;
    const items = focusables(container);
    if (!items.length) {
      event.preventDefault();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const pageRegions = $$(".top-shell, main, .site-footer, .mobile-bar");

  const setPageInert = (inert) => {
    pageRegions.forEach((el) => {
      el.inert = inert;
    });
  };

  /* ------------------------------------------------------------- header */

  const header = $("[data-header]");
  if (header) {
    const setStuck = () => header.classList.toggle("is-stuck", window.scrollY > 8);
    setStuck();
    window.addEventListener("scroll", setStuck, { passive: true });
  }

  /* -------------------------------------------------------- mobile menu (bottom sheet) */

  const menuBtns = $$("[data-menu-btn]");
  const mobileNav = $("[data-mobile-nav]");
  const backdrop = $("[data-sheet-backdrop]");
  const closeBtns = $$("[data-sheet-close]");

  if (mobileNav) {
    let lastMenuTrigger = null;

    const setOpen = (open) => {
      if (open) {
        lastMenuTrigger =
          document.activeElement instanceof HTMLElement ? document.activeElement : menuBtns[0];
        mobileNav.hidden = false;
        if (backdrop) backdrop.hidden = false;
        // Trigger reflow for CSS slide-up transition
        void mobileNav.offsetHeight;
        mobileNav.classList.add("is-open");
        if (backdrop) backdrop.classList.add("is-visible");
        setPageInert(true);
      } else {
        mobileNav.classList.remove("is-open");
        if (backdrop) backdrop.classList.remove("is-visible");
        setPageInert(false);
        setTimeout(() => {
          if (!mobileNav.classList.contains("is-open")) {
            mobileNav.hidden = true;
            if (backdrop) backdrop.hidden = true;
          }
        }, 320);
      }

      menuBtns.forEach((btn) => {
        btn.setAttribute("aria-expanded", String(open));
        btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        btn.classList.toggle("is-active", open);
      });
      document.body.classList.toggle("nav-open", open);

      if (open) {
        const target = $("[data-sheet-close]", mobileNav) || focusables(mobileNav)[0];
        target?.focus();
      } else if (lastMenuTrigger) {
        lastMenuTrigger.focus();
        lastMenuTrigger = null;
      }
    };

    menuBtns.forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.stopPropagation();
        const isOpen = mobileNav.classList.contains("is-open");
        setOpen(!isOpen);
      });
    });

    closeBtns.forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.stopPropagation();
        setOpen(false);
      });
    });

    if (backdrop) {
      backdrop.addEventListener("click", () => setOpen(false));
    }

    $$("a", mobileNav).forEach((link) => link.addEventListener("click", () => setOpen(false)));

    mobileNav.addEventListener("keydown", (event) => {
      trapTab(mobileNav, event);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && mobileNav.classList.contains("is-open")) {
        setOpen(false);
      }
    });

    const desktop = window.matchMedia("(min-width: 1025px)");
    desktop.addEventListener("change", (event) => {
      if (event.matches && mobileNav.classList.contains("is-open")) {
        setOpen(false);
      }
    });
  }

  /* ----------------------------------------------------------- lightbox */

  const lightbox = $("[data-lightbox]");
  const lightboxImg = $("[data-lightbox-img]", lightbox || document);
  const lightboxCaption = $("[data-lightbox-caption]", lightbox || document);
  const lightboxClose = $("[data-lightbox-close]", lightbox || document);
  let lastFocused = null;

  const closeLightbox = () => {
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    document.body.classList.remove("nav-open");
    setPageInert(false);
    lightboxImg.removeAttribute("src");
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  };

  const openLightbox = (item) => {
    if (!lightbox) return;
    const image = $("img", item);
    lastFocused = item;
    lightboxImg.src = item.getAttribute("href");
    lightboxImg.alt = image ? image.alt : "";
    lightboxCaption.textContent = item.dataset.caption || (image ? image.alt : "");
    lightbox.hidden = false;
    document.body.classList.add("nav-open");
    setPageInert(true);
    lightboxClose.focus();
  };

  if (lightbox) {
    $$("[data-lightbox-item]").forEach((item) => {
      item.addEventListener("click", (event) => {
        event.preventDefault();
        openLightbox(item);
      });
    });

    lightboxClose.addEventListener("click", closeLightbox);

    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });

    lightbox.addEventListener("keydown", (event) => {
      trapTab(lightbox, event);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !lightbox.hidden) closeLightbox();
    });
  }

  /* ------------------------------------------------------- scroll motion */

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const progress = document.createElement("div");
  progress.className = "scroll-progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.appendChild(progress);

  const parallaxItems = $$("[data-parallax]");
  let frame = null;
  let scrollMax = 0;

  const onScroll = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = null;

      if (!scrollMax) {
        scrollMax = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      }

      const ratio = scrollMax > 0 ? Math.min(window.scrollY / scrollMax, 1) : 0;
      progress.style.transform = `scaleX(${ratio})`;

      if (reduceMotion) return;

      const viewport = window.innerHeight;
      parallaxItems.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < -80 || rect.top > viewport + 80) return;
        const offset = (rect.top + rect.height / 2 - viewport / 2) / viewport;
        const shift = Math.max(-32, Math.min(32, offset * -34));
        el.style.setProperty("--py", `${shift.toFixed(1)}px`);
      });
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    scrollMax = 0;
    onScroll();
  });

  const revealItems = $$("[data-reveal]");

  if (!reduceMotion && "IntersectionObserver" in window) {
    const revealer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          revealer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.08 },
    );
    revealItems.forEach((el) => revealer.observe(el));
  } else {
    revealItems.forEach((el) => el.classList.add("is-in"));
  }

  /* ------------------------------------------------------- quote form */

  const form = $("[data-quote-form]");

  if (form) {
    const status = $("[data-form-status]", form);
    const serviceSelect = $("#service", form);
    const serviceMap = (() => {
      try {
        return JSON.parse(form.dataset.serviceMap || "{}");
      } catch {
        return {};
      }
    })();

    // Preselect a service when arriving from /contact?service=slug
    const requested = new URLSearchParams(window.location.search).get("service");
    const requestedName = requested ? serviceMap[requested] : "";
    if (requestedName && serviceSelect) {
      const match = [...serviceSelect.options].find((option) =>
        option.value.startsWith(`${requestedName} —`),
      );
      if (match) serviceSelect.value = match.value;
    }

    const setStatus = (message, state = "") => {
      if (!status) return;
      status.textContent = message;
      status.classList.toggle("is-error", state === "error");
      status.classList.toggle("is-ok", state === "ok");
    };

    const whatsappNumber = (() => {
      const callLink = $('a[href^="tel:"]');
      const digits = callLink ? callLink.getAttribute("href").replace(/\D/g, "") : "";
      return digits || "919715032513";
    })();

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const phone = String(data.get("phone") || "").trim();
      const location = String(data.get("location") || "").trim();
      const service = String(data.get("service") || "").trim();
      const message = String(data.get("message") || "").trim();

      if (!name) {
        setStatus("Please add your name so we know who to reply to.", "error");
        $("#name", form).focus();
        return;
      }

      if (phone.replace(/\D/g, "").length < 10) {
        setStatus("Please check the phone number — it needs at least 10 digits.", "error");
        $("#phone", form).focus();
        return;
      }

      const lines = [
        "Hello AV Interior Decoration, I would like a quotation.",
        "",
        `Name: ${name}`,
        `Phone: ${phone}`,
        location ? `Area: ${location}` : "",
        service ? `Service: ${service}` : "",
        message ? `Details: ${message}` : "",
      ].filter(Boolean);

      const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`;

      setStatus("Opening WhatsApp with your details…", "ok");
      window.open(url, "_blank", "noopener");
    });

    form.addEventListener("input", () => {
      if (status && (status.classList.contains("is-error") || status.classList.contains("is-ok"))) {
        setStatus("We reply during working hours, usually the same day.");
      }
    });
  }

  /* ------------------------------------------------------------ review form */

  const reviewForm = $("[data-review-form]");

  if (reviewForm) {
    const reviewStatus = $("[data-review-status]", reviewForm);
    const reviewNumber = String(reviewForm.dataset.whatsapp || "").replace(/\D/g, "");

    const setReviewStatus = (message, state) => {
      if (!reviewStatus) return;
      reviewStatus.textContent = message;
      reviewStatus.classList.toggle("is-error", state === "error");
      reviewStatus.classList.toggle("is-ok", state === "ok");
    };

    reviewForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const data = new FormData(reviewForm);
      const name = String(data.get("name") || "").trim();
      const rating = String(data.get("rating") || "5");
      const review = String(data.get("review") || "").trim();

      if (!name) {
        setReviewStatus("Please add your name with the review.", "error");
        $("#review-name", reviewForm).focus();
        return;
      }

      if (review.length < 10) {
        setReviewStatus("Please write a little more — at least a sentence.", "error");
        $("#review-message", reviewForm).focus();
        return;
      }

      const lines = [
        "Hello AV Interior Decoration, I would like to leave a review.",
        "",
        `Name: ${name}`,
        `Rating: ${rating} / 5`,
        `Review: ${review}`,
      ];

      const url = `https://wa.me/${reviewNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
      setReviewStatus("Opening WhatsApp with your review…", "ok");
      window.open(url, "_blank", "noopener");
    });

    reviewForm.addEventListener("input", () => {
      if (
        reviewStatus &&
        (reviewStatus.classList.contains("is-error") || reviewStatus.classList.contains("is-ok"))
      ) {
        setReviewStatus("Opens WhatsApp with your review. We may publish it with your name.");
      }
    });
  }

  /* -------------------------------------------------------- visitor counter */

  const visitWrap = $("[data-visits]");
  const visitCount = $("[data-visit-count]");
  const dnt = navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;

  if (visitWrap && visitCount && dnt !== "1" && dnt !== "yes") {
    const isLocal = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
    const storageKey = isLocal ? "av-visit-counted-dev" : "av-visit-counted";
    const namespace = isLocal ? "av-interior-dev" : "av-interior-decoration";
    let seen = null;

    try {
      seen = localStorage.getItem(storageKey);
    } catch {
      /* storage blocked — count this load */
    }

    const endpoint = seen ? "get" : "hit";
    const controller = typeof AbortController === "function" ? new AbortController() : null;
    const timer = controller ? window.setTimeout(() => controller.abort(), 5000) : 0;

    fetch(`https://abacus.jasoncameron.dev/${endpoint}/${namespace}/site-visits`, {
      cache: "no-store",
      signal: controller ? controller.signal : undefined,
    })
      .then((response) =>
        response.ok ? response.json() : Promise.reject(new Error(String(response.status))),
      )
      .then((data) => {
        if (!data || typeof data.value !== "number") return;
        visitCount.textContent = data.value.toLocaleString("en-IN");
        visitWrap.hidden = false;
        if (!seen) {
          try {
            localStorage.setItem(storageKey, "1");
          } catch {
            /* ignore */
          }
        }
      })
      .catch(() => {
        /* the counter is optional — leave it hidden if the service is down */
      })
      .finally(() => {
        if (timer) window.clearTimeout(timer);
      });
  }
})();
