document.addEventListener('DOMContentLoaded', () => {
  const footer = document.querySelector('.site-footer');
  if (!footer) return;

  const checkVisibility = () => {
    const atBottom = window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 2;
    if (atBottom) {
      footer.classList.add('footer-visible');
    } else {
      footer.classList.remove('footer-visible');
    }
  };

  window.addEventListener('scroll', checkVisibility);
  checkVisibility();
});
