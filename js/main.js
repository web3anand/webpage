document.addEventListener("DOMContentLoaded", () => {
  const carouselTrack = document.getElementById("carousel-track");
  const carouselContainer = document.getElementById("carousel-container");
  const serviceListEl = document.getElementById("service-list");
  const servicesGrid = document.getElementById("servicesGrid");
  const filterControls = document.getElementById("filterControls");
  const heroCarousel = document.getElementById("hero-carousel");

  if (heroCarousel) {
    const slidesContainer = heroCarousel.querySelector(".slides");
    const slides = heroCarousel.querySelectorAll("img");
    let heroIndex = 0;
    const heroInterval = 4000;

    const updateHeroSlide = () => {
      slidesContainer.style.transform = `translateX(-${heroIndex * 100}%)`;
    };

    const nextHeroSlide = () => {
      heroIndex = (heroIndex + 1) % slides.length;
      updateHeroSlide();
    };

    let heroTimer = setInterval(nextHeroSlide, heroInterval);
    let startX = 0;
    heroCarousel.addEventListener("touchstart", e => {
      startX = e.touches[0].clientX;
      clearInterval(heroTimer);
    });
    heroCarousel.addEventListener("touchend", e => {
      const diff = e.changedTouches[0].clientX - startX;
      if (diff > 50) {
        heroIndex = (heroIndex - 1 + slides.length) % slides.length;
      } else if (diff < -50) {
        heroIndex = (heroIndex + 1) % slides.length;
      }
      updateHeroSlide();
      heroTimer = setInterval(nextHeroSlide, heroInterval);
    });
  }

  if (carouselTrack && carouselContainer) {
    projectImages.forEach(project => {
      const slide = document.createElement("div");
      slide.className = "carousel-item";
      slide.innerHTML = `<img src="${project.src}" alt="${project.alt}">`;
      carouselTrack.appendChild(slide);
    });

    // Duplicate slides for seamless looping
    const slides = Array.from(carouselTrack.children);
    slides.forEach(slide => {
      const clone = slide.cloneNode(true);
      clone.classList.add("clone");
      carouselTrack.appendChild(clone);
    });

    let frameId;
    const speed = 20; // pixels per frame
    const maxScroll = carouselTrack.scrollWidth / 2;
    const startContinuousScroll = () => {
      const step = () => {
        carouselContainer.scrollLeft += speed;
        if (carouselContainer.scrollLeft >= maxScroll) {
          carouselContainer.scrollLeft = 0;
        }
        frameId = requestAnimationFrame(step);
      };
      frameId = requestAnimationFrame(step);
    };
    const stopContinuousScroll = () => cancelAnimationFrame(frameId);

    carouselContainer.addEventListener("mouseenter", stopContinuousScroll);
    carouselContainer.addEventListener("touchstart", stopContinuousScroll);
    carouselContainer.addEventListener("mouseleave", startContinuousScroll);
    carouselContainer.addEventListener("touchend", startContinuousScroll);

    const enlargeImage = img => {
      document.querySelectorAll(".carousel-item img").forEach(el => el.classList.remove("enlarged"));
      img.classList.add("enlarged");
      setTimeout(() => {
        img.classList.remove("enlarged");
      }, 3000);
    };

    carouselTrack.addEventListener("click", e => {
      const img = e.target.closest("img");
      if (img) enlargeImage(img);
    });
    carouselTrack.addEventListener("touchstart", e => {
      const img = e.target.closest("img");
      if (img) enlargeImage(img);
    });
    startContinuousScroll();
  }

  if (serviceListEl) {
    serviceList.forEach(cat => {
      const wrapper = document.createElement("div");
      wrapper.className = "service-category";

      const title = document.createElement("div");
      title.className = "category-title";
      title.textContent = cat.name;

      const list = document.createElement("ul");
      list.className = "sub-services";

      cat.services.forEach(item => {
        const li = document.createElement("li");
        li.className = "sub-card";
        li.innerHTML = `
          <a href="products.html#${item.id}">
            <img src="${item.img}" alt="${item.name}" />
            <span>${item.name}</span>
          </a>`;
        list.appendChild(li);
      });

      title.addEventListener("click", () => {
        document.querySelectorAll(".service-category .sub-services").forEach(el => {
          if (el !== list) {
            el.classList.remove("open");
            el.style.maxHeight = null;
          }
        });
        document.querySelectorAll(".service-category .category-title").forEach(el => {
          if (el !== title) el.classList.remove("open");
        });

        const isOpen = list.classList.toggle("open");
        title.classList.toggle("open");
        if (isOpen) {
          list.style.maxHeight = list.scrollHeight + "px";
        } else {
          list.style.maxHeight = null;
        }
      });

      wrapper.appendChild(title);
      wrapper.appendChild(list);
      serviceListEl.appendChild(wrapper);
    });
  }

  if (servicesGrid) {
    const descriptions = {
      "Cupboards": "Modular kitchens and custom storage solutions.",
      "Glass Works": "Quality glass partitions and railings.",
      "Blinds": "Range of blinds and curtains for every need.",
      "False Ceiling": "Stylish designs to enhance your interiors.",
      "MosquitoNet": "Durable nets for doors and windows.",
      "Flooring": "Vinyl, wooden and carpet options.",
      "Aluminium works": "Partitions, windows and more.",
      "UPVC Work": "UPVC windows, doors and partitions."
    };

    const frag = document.createDocumentFragment();
    const allBtn = document.createElement("button");
    allBtn.className = "filter-btn active";
    allBtn.dataset.filter = "all";
    allBtn.textContent = "All";
    frag.appendChild(allBtn);

    serviceList.forEach(cat => {
      const btn = document.createElement("button");
      btn.className = "filter-btn";
      btn.dataset.filter = cat.name;
      btn.textContent = cat.name;
      frag.appendChild(btn);
    });
    if (filterControls) filterControls.appendChild(frag);

    serviceList.forEach(cat => {
      const card = document.createElement("div");
      card.className = "service-card";
      card.dataset.category = cat.name;
      const first = cat.services[0];
      card.innerHTML = `
        <img src="${first.img}" alt="${cat.name}">
        <h3>${cat.name}</h3>
        <p>${descriptions[cat.name] || `Explore our ${cat.name.toLowerCase()} solutions.`}</p>
        <button class="details-toggle btn">View Details</button>
        <ul class="sub-services"></ul>
      `;

      const list = card.querySelector(".sub-services");
      cat.services.forEach(item => {
        const li = document.createElement("li");
        li.className = "sub-card";
        li.innerHTML = `
          <a href="products.html#${item.id}">
            <img src="${item.img}" alt="${item.name}">
            <span>${item.name}</span>
          </a>`;
        list.appendChild(li);
      });

      const toggleBtn = card.querySelector(".details-toggle");
      toggleBtn.addEventListener("click", e => {
        e.preventDefault();
        const isOpen = list.classList.toggle("open");
        card.classList.toggle("expanded");
        if (isOpen) {
          list.style.maxHeight = list.scrollHeight + "px";
        } else {
          list.style.maxHeight = null;
        }
      });

      servicesGrid.appendChild(card);
    });

    if (filterControls) {
      filterControls.addEventListener("click", e => {
        const btn = e.target.closest(".filter-btn");
        if (!btn) return;
        filterControls.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const filter = btn.dataset.filter;
        servicesGrid.querySelectorAll(".service-card").forEach(card => {
          const show = filter === "all" || card.dataset.category === filter;
          card.style.display = show ? "" : "none";
          if (!show) {
            const list = card.querySelector(".sub-services");
            card.classList.remove("expanded");
            if (list) {
              list.classList.remove("open");
              list.style.maxHeight = null;
            }
          }
        });
      });
    }
  }
});
