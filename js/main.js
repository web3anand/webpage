document.addEventListener("DOMContentLoaded", () => {
  const carouselTrack = document.getElementById("carousel-track");
  const serviceListEl = document.getElementById("service-list");

  if (carouselTrack) {
    projectImages.forEach(project => {
      const slide = document.createElement("div");
      slide.className = "carousel-item";
      slide.innerHTML = `<img src="${project.src}" alt="${project.alt}">`;
      carouselTrack.appendChild(slide);
    });

    const autoScroll = () => {
      const card = carouselTrack.querySelector(".carousel-item");
      if (!card) return;
      const scrollAmount = card.offsetWidth + 24; // card width + gap
      if (Math.ceil(carouselTrack.scrollLeft + scrollAmount) >= carouselTrack.scrollWidth - carouselTrack.clientWidth) {
        carouselTrack.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        carouselTrack.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    };
    setInterval(autoScroll, 3000);
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
