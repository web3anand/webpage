document.addEventListener("DOMContentLoaded", () => {
  const carouselWrapper = document.getElementById("carousel-wrapper");
  const categoryGrid = document.getElementById("category-grid");

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

  if (categoryGrid) {
    serviceCategories.forEach(category => {
      const card = document.createElement("a");
      card.href = category.link;
      card.className = "category-card";
      card.textContent = category.name;
      categoryGrid.appendChild(card);
    });
  }
});
