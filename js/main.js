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

    new Swiper("#carousel-container", {
      loop: true,
      centeredSlides: true,
      slidesPerView: "auto",
      spaceBetween: 30,
      grabCursor: true,
      effect: "coverflow",
      coverflowEffect: {
        rotate: 0,
        stretch: 0,
        depth: 150,
        modifier: 1.5,
        slideShadows: false
      },
      autoplay: {
        delay: 2500,
        disableOnInteraction: false
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev"
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
