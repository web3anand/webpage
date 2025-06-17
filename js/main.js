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

    let autoScrollInterval;
    const getGap = () => {
      const style = getComputedStyle(carouselTrack);
      const gap = parseFloat(style.columnGap || style.gap);
      return isNaN(gap) ? 24 : gap;
    };
    const scrollStep = () => {
      const card = carouselTrack.querySelector(".carousel-item");
      if (!card) return;
      const scrollAmount = card.offsetWidth + getGap();
      if (Math.ceil(carouselContainer.scrollLeft + scrollAmount) >=
          carouselTrack.scrollWidth - carouselContainer.clientWidth) {
        carouselContainer.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        carouselContainer.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    };
    const startAutoScroll = () => {
      autoScrollInterval = setInterval(scrollStep, 3000);
    };
    carouselContainer.addEventListener("mouseenter", () => clearInterval(autoScrollInterval));
    carouselContainer.addEventListener("touchstart", () => clearInterval(autoScrollInterval));
    carouselContainer.addEventListener("mouseleave", startAutoScroll);
    carouselContainer.addEventListener("touchend", startAutoScroll);
    startAutoScroll();
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
