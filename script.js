document.documentElement.classList.add('js');

const products = {
  ricochet: { title: 'Ricochet', price: 2 },
  faraway: { title: 'Faraway', price: 3 },
  combo: { title: 'Faraway + Ricochet', price: 4 }
};

document.querySelectorAll('.reveal').forEach((el) => {
  if (!('IntersectionObserver' in window)) { el.classList.add('visible'); return; }
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) { el.classList.add('visible'); observer.disconnect(); }
  }, { threshold: .15 });
  observer.observe(el);
  window.setTimeout(() => el.classList.add('visible'), 1200);
});

const API_BASE = 'https://api.podlesnytwins.com';
const dialog = document.getElementById('checkout');
const form = document.getElementById('checkout-form');

if (dialog && form) {
  const errorBox = form.querySelector('.checkout-error');
  const submit = form.querySelector('.checkout-submit');
  const submitLabel = submit.textContent;
  const productInput = form.elements.product;
  const clearError = () => {
    errorBox.hidden = true; errorBox.textContent = '';
    form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
  };
  const showError = (message) => { errorBox.textContent = message; errorBox.hidden = false; };

  document.querySelectorAll('[data-checkout]').forEach((button) => {
    button.addEventListener('click', () => {
      const product = products[button.dataset.checkout] ? button.dataset.checkout : productInput.value;
      productInput.value = product;
      const item = products[product];
      document.getElementById('checkout-title').textContent = `${item.title} — ${item.price} ₽`;
      clearError();
      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
        window.setTimeout(() => form.elements.name.focus(), 60);
      }
    });
  });
  dialog.querySelectorAll('[data-checkout-close]').forEach((button) => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });

  form.addEventListener('submit', async (event) => {
    event.preventDefault(); clearError();
    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    if (name.length < 2) { form.elements.name.setAttribute('aria-invalid', 'true'); form.elements.name.focus(); return showError('Укажите имя для лицензии.'); }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { form.elements.email.setAttribute('aria-invalid', 'true'); form.elements.email.focus(); return showError('Проверьте адрес почты.'); }
    if (!form.elements.consent.checked) { form.elements.consent.focus(); return showError('Примите публичную оферту, чтобы продолжить.'); }
    submit.disabled = true; submit.textContent = 'Готовим оплату…';
    try {
      const response = await fetch(`${API_BASE}/api/checkout`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: productInput.value, email, name })
      });
      if (!response.ok) throw new Error(response.status === 503 ? 'Оплата временно недоступна. Напишите нам на ceo@podlesnytwins.com.' : 'Не удалось создать платёж. Попробуйте ещё раз.');
      const data = await response.json();
      if (!data.url) throw new Error('Сервис оплаты не вернул ссылку. Напишите нам на ceo@podlesnytwins.com.');
      window.location.href = data.url;
    } catch (error) {
      showError(error instanceof TypeError ? 'Не удалось связаться с сервисом оплаты. Проверьте соединение.' : error.message);
      submit.disabled = false; submit.textContent = submitLabel;
    }
  });
}

const buybar = document.querySelector('.buybar');
const heroActions = document.querySelector('.hero-actions');
const pricing = document.getElementById('pricing');
if (buybar && heroActions && 'IntersectionObserver' in window) {
  const visible = { hero: true, pricing: false };
  const sync = () => { buybar.hidden = false; buybar.classList.toggle('is-shown', !visible.hero && !visible.pricing); };
  new IntersectionObserver(([entry]) => { visible.hero = entry.isIntersecting; sync(); }).observe(heroActions);
  if (pricing) new IntersectionObserver(([entry]) => { visible.pricing = entry.isIntersecting; sync(); }).observe(pricing);
}
