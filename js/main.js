document.addEventListener("DOMContentLoaded", () => {
  const carouselTrack = document.getElementById("carousel-track");
  const carouselContainer = document.getElementById("carousel-container");
  const serviceListEl = document.getElementById("service-list");

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
        li.innerHTML = `<a href="products.html#${item.id}">${item.name}</a>`;
        list.appendChild(li);
      });

      title.addEventListener("click", () => {
        list.classList.toggle("open");
        title.classList.toggle("open");
      });

      wrapper.appendChild(title);
      wrapper.appendChild(list);
      serviceListEl.appendChild(wrapper);
    });
  }
});
