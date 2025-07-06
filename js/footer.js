document.addEventListener('DOMContentLoaded', () => {
  const footer = document.getElementById('siteFooter');
  if (!footer) return;

  const toggleFooterVisibility = () => {
    const atBottom = window.innerHeight + window.pageYOffset >= document.body.offsetHeight;
    footer.classList.toggle('show', atBottom);
  };

  toggleFooterVisibility();
  window.addEventListener('scroll', toggleFooterVisibility);
});
