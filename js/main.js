document.addEventListener("DOMContentLoaded", () => {
  const carouselTrack = document.getElementById("carousel-track");
  const carouselContainer = document.getElementById("carousel-container");
  const serviceListEl = document.getElementById("service-list");
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
      // open each category by default
      list.classList.add("open");
      title.classList.add("open");
      list.style.maxHeight = list.scrollHeight + "px";
    });
  }
});
