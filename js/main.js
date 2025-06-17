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

    // Duplicate items for seamless looping
    const initialCount = carouselTrack.children.length;
    for (let i = 0; i < initialCount; i++) {
      const clone = carouselTrack.children[i].cloneNode(true);
      carouselTrack.appendChild(clone);
    }

    let animationId;
    const speed = 0.5; // pixels per frame

    const step = () => {
      carouselContainer.scrollLeft += speed;
      if (carouselContainer.scrollLeft >= carouselTrack.scrollWidth / 2) {
        carouselContainer.scrollLeft -= carouselTrack.scrollWidth / 2;
      }
      animationId = requestAnimationFrame(step);
    };

    const start = () => {
      if (!animationId) animationId = requestAnimationFrame(step);
    };

    const stop = () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    };

    carouselContainer.addEventListener("mouseenter", stop);
    carouselContainer.addEventListener("touchstart", stop);
    carouselContainer.addEventListener("mouseleave", start);
    carouselContainer.addEventListener("touchend", start);
    start();
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
