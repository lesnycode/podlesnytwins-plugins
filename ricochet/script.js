document.documentElement.classList.add('js');

/* ---------------------------------------------------------------------------
   Reveal on scroll.
   Only elements explicitly marked .reveal animate — never whole sections, so a
   headless renderer, a background tab or a dead observer can't ship a blank
   page. The failsafe below is the belt to that braces: whatever happens, the
   content is visible within a second.
--------------------------------------------------------------------------- */
const revealables = document.querySelectorAll('.reveal');

if (revealables.length) {
  const show = (el) => el.classList.add('visible');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          show(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealables.forEach((el) => observer.observe(el));
  } else {
    revealables.forEach(show);
  }

  window.setTimeout(() => revealables.forEach(show), 1200);
}

/* ---------------------------------------------------------------------------
   Checkout: POST to the payment service, then hand the browser to Точка.
   The site is static (GitHub Pages) and holds no secrets; everything that can
   touch the bank account lives on api.podlesnytwins.com.
--------------------------------------------------------------------------- */
const API_BASE = 'https://api.podlesnytwins.com';
const PRODUCT = 'ricochet';

const dialog = document.getElementById('checkout');
const form = document.getElementById('checkout-form');

if (dialog && form) {
  const errorBox = form.querySelector('.checkout-error');
  const submit = form.querySelector('.checkout-submit');
  const submitLabel = submit.textContent;

  const showError = (text) => {
    errorBox.textContent = text;
    errorBox.hidden = false;
  };

  const clearError = () => {
    errorBox.hidden = true;
    errorBox.textContent = '';
    form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
  };

  const openCheckout = () => {
    clearError();
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
      window.setTimeout(() => form.querySelector('input[name="name"]').focus(), 60);
    } else {
      // No <dialog> support: fall back to the pricing block rather than nothing.
      document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' });
    }
  };

  document.querySelectorAll('[data-checkout]').forEach((btn) => {
    btn.addEventListener('click', openCheckout);
  });

  dialog.querySelectorAll('[data-checkout-close]').forEach((btn) => {
    btn.addEventListener('click', () => dialog.close());
  });

  // Click on the backdrop closes; clicks inside the card must not.
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError();

    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const consent = form.elements.consent.checked;

    if (name.length < 2) {
      form.elements.name.setAttribute('aria-invalid', 'true');
      form.elements.name.focus();
      return showError('Укажите имя — оно печатается в лицензии.');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      form.elements.email.setAttribute('aria-invalid', 'true');
      form.elements.email.focus();
      return showError('Проверьте адрес почты — на него уйдёт файл лицензии.');
    }
    if (!consent) {
      form.elements.consent.focus();
      return showError('Примите публичную оферту, чтобы продолжить.');
    }

    submit.disabled = true;
    submit.textContent = 'Готовим оплату…';

    try {
      const res = await fetch(`${API_BASE}/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: PRODUCT, email, name })
      });

      if (res.status === 503) {
        throw new Error('Приём оплаты ещё настраивается. Напишите на plugins@podlesnytwins.com — вышлем счёт вручную.');
      }
      if (!res.ok) {
        throw new Error('Банк не принял заявку на оплату. Попробуйте ещё раз или напишите на plugins@podlesnytwins.com.');
      }

      const data = await res.json();
      if (!data.url) throw new Error('Сервис оплаты не вернул ссылку. Напишите на plugins@podlesnytwins.com.');

      window.location.href = data.url;
      return;
    } catch (err) {
      const offline = err instanceof TypeError;
      showError(offline
        ? 'Не удалось связаться с сервисом оплаты. Проверьте соединение и попробуйте ещё раз.'
        : err.message);
    }

    submit.disabled = false;
    submit.textContent = submitLabel;
  });
}

/* ---------------------------------------------------------------------------
   Sticky buy bar (mobile). Appears once the hero CTA is out of sight, hides
   again over the pricing block where a real button is already on screen.
--------------------------------------------------------------------------- */
const buybar = document.querySelector('.buybar');
const heroActions = document.querySelector('.hero-actions');
const pricing = document.getElementById('pricing');

if (buybar && heroActions && 'IntersectionObserver' in window) {
  const visible = { hero: true, pricing: false };

  const sync = () => {
    const show = !visible.hero && !visible.pricing;
    buybar.hidden = false;
    buybar.classList.toggle('is-shown', show);
  };

  new IntersectionObserver(([entry]) => {
    visible.hero = entry.isIntersecting;
    sync();
  }, { threshold: 0 }).observe(heroActions);

  if (pricing) {
    new IntersectionObserver(([entry]) => {
      visible.pricing = entry.isIntersecting;
      sync();
    }, { threshold: 0 }).observe(pricing);
  }
}

/* ---------------------------------------------------------------------------
   Autopan comparison animation
--------------------------------------------------------------------------- */
const canvas = document.getElementById('autopan-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  const CSS_W = 560;
  const CSS_H = 360;

  canvas.width = CSS_W * dpr;
  canvas.height = CSS_H * dpr;
  ctx.scale(dpr, dpr);

  const W = CSS_W;
  const H = CSS_H;
  const PADDING = 32;
  const TRANSIENT_X = W * 0.52;
  const LOOP_MS = 4200;

  const colors = {
    bg: '#131619',
    text: '#f0f2f4',
    muted: '#8a9199',
    bad: '#ff6b6b',
    good: '#5ee7b3',
    grid: '#23282c'
  };

  function easeOutCubic(x) {
    return 1 - Math.pow(1 - x, 3);
  }

  function drawText(text, x, y, size, color, weight, align = 'left') {
    ctx.fillStyle = color;
    ctx.font = `${weight || 500} ${size}px Work Sans, -apple-system, sans-serif`;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
  }

  function drawScenario(baseY, isRicochet, t) {
    const name = isRicochet ? 'Ricochet' : 'Обычный автопан';
    const sub = isRicochet ? 'переход заранее' : 'переход накрывает атаку';
    const accent = isRicochet ? colors.good : colors.bad;

    drawText(name, PADDING, baseY - 52, 14, colors.text, 600);
    drawText(sub, PADDING, baseY - 34, 12, accent, 500);

    // L / R axis
    drawText('R', PADDING - 10, baseY - 20, 11, colors.muted, 500);
    drawText('L', PADDING - 10, baseY + 20, 11, colors.muted, 500);

    // Baseline grid
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PADDING, baseY);
    ctx.lineTo(W - PADDING, baseY);
    ctx.stroke();

    // Transient spike
    const spikeW = 22;
    const spikeH = 64;
    ctx.strokeStyle = colors.muted;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.moveTo(PADDING, baseY);
    ctx.lineTo(TRANSIENT_X - spikeW / 2, baseY);
    ctx.lineTo(TRANSIENT_X, baseY - spikeH);
    ctx.lineTo(TRANSIENT_X + spikeW / 2, baseY);
    ctx.lineTo(W - PADDING, baseY);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Pan position line
    ctx.strokeStyle = accent;
    ctx.lineWidth = isRicochet ? 3 : 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    if (isRicochet) {
      // Step at the pre-transient point
      const stepX = TRANSIENT_X - 48;
      ctx.moveTo(PADDING, baseY + 20);
      ctx.lineTo(stepX, baseY + 20);
      ctx.lineTo(stepX, baseY - 20);
      ctx.lineTo(W - PADDING, baseY - 20);
    } else {
      // Smooth curve crossing the transient
      ctx.moveTo(PADDING, baseY + 20);
      const cp1x = TRANSIENT_X - 60;
      const cp1y = baseY + 20;
      const cp2x = TRANSIENT_X + 30;
      const cp2y = baseY - 20;
      const endX = W - PADDING;
      const endY = baseY - 20;
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
    }
    ctx.stroke();

    // Playhead
    const playheadX = PADDING + easeOutCubic(t) * (W - PADDING * 2);
    ctx.strokeStyle = isRicochet ? 'rgba(94, 231, 179, 0.25)' : 'rgba(255, 107, 107, 0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(playheadX, baseY - 70);
    ctx.lineTo(playheadX, baseY + 70);
    ctx.stroke();
    ctx.setLineDash([]);

    // Transient hit effect
    if (playheadX >= TRANSIENT_X) {
      const hitT = Math.min(1, (playheadX - TRANSIENT_X) / 40);
      const glow = Math.max(0, 1 - hitT);

      if (glow > 0) {
        const radius = 18 + (1 - glow) * 24;
        const alpha = glow * 0.35;
        ctx.fillStyle = isRicochet ? `rgba(94, 231, 179, ${alpha})` : `rgba(255, 107, 107, ${alpha})`;
        ctx.beginPath();
        ctx.arc(TRANSIENT_X, baseY - spikeH / 2, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Outcome label to the right of the spike, clear of other elements
      const label = isRicochet ? 'переход закончен' : 'атака размазана';
      const labelX = TRANSIENT_X + 52;
      const labelY = baseY - spikeH / 2;

      ctx.strokeStyle = accent;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.moveTo(TRANSIENT_X + 14, labelY);
      ctx.lineTo(labelX - 8, labelY);
      ctx.stroke();
      ctx.globalAlpha = 1;

      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(labelX - 4, labelY, 2, 0, Math.PI * 2);
      ctx.fill();

      drawText(label, labelX, labelY, 12, accent, 500, 'left');
    }
  }

  function render() {
    const now = performance.now();
    const t = (now % LOOP_MS) / LOOP_MS;

    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, W, H);

    drawScenario(120, false, t);
    drawScenario(260, true, t);

    requestAnimationFrame(render);
  }

  // Reduced motion: draw one static frame with both outcomes visible
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, W, H);
    drawScenario(120, false, 1);
    drawScenario(260, true, 1);
  } else {
    render();
  }
}
