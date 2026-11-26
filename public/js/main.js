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

  // Queue stub for Vercel Web Analytics (avoids needing an inline <script>).
  window.va =
    window.va ||
    function () {
      (window.vaq = window.vaq || []).push(arguments);
    };

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
  const lightboxCounter = $("[data-lightbox-counter]", lightbox || document);
  const lightboxClose = $("[data-lightbox-close]", lightbox || document);
  const lightboxPrev = $("[data-lightbox-prev]", lightbox || document);
  const lightboxNext = $("[data-lightbox-next]", lightbox || document);
  let lastFocused = null;
  let activeItems = [];
  let activeIndex = 0;

  const showLightboxIndex = (index) => {
    if (!activeItems.length) return;
    activeIndex = (index + activeItems.length) % activeItems.length;
    const item = activeItems[activeIndex];
    const href = item.getAttribute("href") || "";
    if (!href.startsWith("/assets/")) return;
    const image = $("img", item);
    lightboxImg.src = href;
    lightboxImg.alt = image ? image.alt : "";
    lightboxCaption.textContent = item.dataset.caption || (image ? image.alt : "");
    if (lightboxCounter) {
      lightboxCounter.textContent =
        activeItems.length > 1 ? `${activeIndex + 1} / ${activeItems.length}` : "";
    }
    const multi = activeItems.length > 1;
    if (lightboxPrev) lightboxPrev.hidden = !multi;
    if (lightboxNext) lightboxNext.hidden = !multi;
  };

  const closeLightbox = () => {
    if (!lightbox || lightbox.hidden) return;
    lightbox.classList.remove("is-open");
    document.body.classList.remove("nav-open");
    setPageInert(false);
    setTimeout(() => {
      if (!lightbox.classList.contains("is-open")) {
        lightbox.hidden = true;
        lightboxImg.removeAttribute("src");
      }
    }, 220);
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  };

  const openLightbox = (item) => {
    if (!lightbox) return;
    const href = item.getAttribute("href") || "";
    if (!href.startsWith("/assets/")) return;
    const scope = item.closest(".gallery, .type-grid") || document;
    activeItems = $$("[data-lightbox-item]", scope).filter((el) => !el.hidden);
    const idx = activeItems.indexOf(item);
    lastFocused = item;
    showLightboxIndex(idx >= 0 ? idx : 0);
    lightbox.hidden = false;
    void lightbox.offsetHeight;
    lightbox.classList.add("is-open");
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
    if (lightboxPrev) lightboxPrev.addEventListener("click", () => showLightboxIndex(activeIndex - 1));
    if (lightboxNext) lightboxNext.addEventListener("click", () => showLightboxIndex(activeIndex + 1));

    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });

    lightbox.addEventListener("keydown", (event) => {
      trapTab(lightbox, event);
    });

    let touchStartX = 0;
    lightbox.addEventListener(
      "touchstart",
      (event) => {
        touchStartX = event.changedTouches[0]?.clientX || 0;
      },
      { passive: true },
    );
    lightbox.addEventListener(
      "touchend",
      (event) => {
        if (activeItems.length < 2) return;
        const dx = (event.changedTouches[0]?.clientX || 0) - touchStartX;
        if (Math.abs(dx) > 48) {
          showLightboxIndex(dx < 0 ? activeIndex + 1 : activeIndex - 1);
        }
      },
      { passive: true },
    );

    document.addEventListener("keydown", (event) => {
      if (lightbox.hidden) return;
      if (event.key === "Escape") closeLightbox();
      else if (event.key === "ArrowLeft" && activeItems.length > 1) showLightboxIndex(activeIndex - 1);
      else if (event.key === "ArrowRight" && activeItems.length > 1) showLightboxIndex(activeIndex + 1);
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
      const popup = window.open(url, "_blank", "noopener,noreferrer");
      if (!popup) window.location.href = url;
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
      const popup = window.open(url, "_blank", "noopener,noreferrer");
      if (!popup) window.location.href = url;
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

  /* ------------------------------------------------------- review carousel */

  const reviewTrack = $("[data-review-track]");
  const reviewPrev = $("[data-review-prev]");
  const reviewNext = $("[data-review-next]");

  if (reviewTrack && (reviewPrev || reviewNext)) {
    const stepBy = (dir) => {
      const card = $(".review-card", reviewTrack);
      const step = card ? card.getBoundingClientRect().width + 14 : reviewTrack.clientWidth * 0.8;
      const maxScroll = reviewTrack.scrollWidth - reviewTrack.clientWidth - 4;
      if (dir > 0 && reviewTrack.scrollLeft >= maxScroll) {
        reviewTrack.scrollTo({ left: 0, behavior: "smooth" });
      } else if (dir < 0 && reviewTrack.scrollLeft <= 4) {
        reviewTrack.scrollTo({ left: reviewTrack.scrollWidth, behavior: "smooth" });
      } else {
        reviewTrack.scrollBy({ left: dir * step, behavior: "smooth" });
      }
    };

    if (reviewPrev) reviewPrev.addEventListener("click", () => stepBy(-1));
    if (reviewNext) reviewNext.addEventListener("click", () => stepBy(1));
  }

  /* --------------------------------------------------- gallery category filter */

  const filterBar = $("[data-gallery-filters]");
  const galleryGrid = $("[data-gallery-grid]");

  if (filterBar && galleryGrid) {
    const filterButtons = $$("[data-gallery-filter]", filterBar);
    const galleryItems = $$("[data-category]", galleryGrid);

    const applyFilter = (category) => {
      filterButtons.forEach((btn) => {
        btn.setAttribute("aria-pressed", String(btn.dataset.galleryFilter === category));
      });
      galleryItems.forEach((item) => {
        const show = category === "all" || item.dataset.category === category;
        item.hidden = !show;
        item.classList.remove("is-filtered-in");
        if (show) {
          item.classList.add("is-in");
          void item.offsetWidth;
          item.classList.add("is-filtered-in");
        }
      });
    };

    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        applyFilter(btn.dataset.galleryFilter || "all");
      });
    });
  }

  /* --------------------------------------------------- instant link prefetch */

  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!conn || (!conn.saveData && conn.effectiveType !== "slow-2g" && conn.effectiveType !== "2g")) {
    const prefetched = new Set([location.pathname]);
    const prefetch = (link) => {
      if (!link || link.origin !== location.origin) return;
      if (link.pathname === location.pathname || prefetched.has(link.pathname)) return;
      if (link.hasAttribute("data-lightbox-item") || link.hash) return;
      prefetched.add(link.pathname);
      const hint = document.createElement("link");
      hint.rel = "prefetch";
      hint.href = link.pathname;
      document.head.appendChild(hint);
    };

    document.addEventListener(
      "pointerenter",
      (event) => {
        const link = event.target instanceof Element ? event.target.closest("a[href^='/']") : null;
        if (link) prefetch(link);
      },
      true,
    );

    document.addEventListener(
      "touchstart",
      (event) => {
        const link = event.target instanceof Element ? event.target.closest("a[href^='/']") : null;
        if (link) prefetch(link);
      },
      { passive: true },
    );
  }
})();
