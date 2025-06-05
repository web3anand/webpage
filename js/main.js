document.addEventListener("DOMContentLoaded", () => {
  const carouselWrapper = document.getElementById("carousel-wrapper");
  const serviceListEl = document.getElementById("service-list");

  if (carouselWrapper) {
    projectImages.forEach(project => {
      const slide = document.createElement("div");
      slide.className = "swiper-slide";
      slide.innerHTML = `<img src="${project.src}" alt="${project.alt}">`;
      carouselWrapper.appendChild(slide);
    });

    new Swiper(".mySwiper", {
  effect: "coverflow",
  grabCursor: true,
  centeredSlides: true,
  loop: true,
  slidesPerView: "auto",
  coverflowEffect: {
    rotate: 0,
    stretch: 0,
    depth: 200,
    modifier: 2,
    slideShadows: false,
  },
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  }
});

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
