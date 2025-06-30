document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('quoteForm');
  const select = document.getElementById('serviceSelect');

  if (typeof serviceList !== 'undefined' && select) {
    serviceList.forEach(cat => {
      cat.services.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = `${cat.name} - ${s.name}`;
        select.appendChild(opt);
      });
    });
  }

  const params = new URLSearchParams(window.location.search);
  const serviceId = params.get('service');
  if (serviceId && select) {
    select.value = serviceId;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const address = document.getElementById('address').value.trim();
    const serviceVal = select.value;
    let serviceName = serviceVal;
    if (typeof serviceList !== 'undefined') {
      serviceList.forEach(cat => {
        const found = cat.services.find(s => s.id === serviceVal);
        if (found) serviceName = `${cat.name} - ${found.name}`;
      });
    }
    const msg = `Name: ${name}\nAddress: ${address}\nService: ${serviceName}`;
    const url = 'https://wa.me/919715032513?text=' + encodeURIComponent(msg);
    window.open(url, '_blank');
  });
});
