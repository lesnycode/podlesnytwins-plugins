const plugins = [
  {
    id: 'vocal-rider-pt',
    name: 'Vocal Rider PT',
    description: 'Автоматический райдер для вокала: держит уровень в компрессии, не портит атак и не добавляет окраски.',
    formats: ['VST3', 'AU', 'AAX'],
    price: '2 490 ₽',
    badge: 'Хит',
    icon: 'VR',
    primaryAction: { label: 'Купить', href: '#' },
    secondaryAction: { label: 'Демо', href: '#' }
  },
  {
    id: 'drum-glue-pt',
    name: 'Drum Glue PT',
    description: 'Микс-бас барабанов в один поворот ручки. Тёплая сатурация + правильная компрессия для плотности.',
    formats: ['VST3', 'AU'],
    price: '1 990 ₽',
    badge: null,
    icon: 'DG',
    primaryAction: { label: 'Купить', href: '#' },
    secondaryAction: { label: 'Демо', href: '#' }
  },
  {
    id: 'saturation-one',
    name: 'Saturation One',
    description: 'Один фейдер — от лёгкого тепла до агрессивного овердрайва. Три модели ламп и транзисторов.',
    formats: ['VST3', 'AU', 'AAX'],
    price: 'Бесплатно',
    badge: 'Free',
    icon: 'S1',
    primaryAction: { label: 'Скачать', href: '#' },
    secondaryAction: null
  },
  {
    id: 'widener-pt',
    name: 'Widener PT',
    description: 'Стерео-ширина без фазовых проблем. Моно-совместимый алгоритм для работы с сабом и клавишами.',
    formats: ['VST3', 'AU'],
    price: '1 490 ₽',
    badge: null,
    icon: 'WD',
    primaryAction: { label: 'Купить', href: '#' },
    secondaryAction: { label: 'Демо', href: '#' }
  }
];

function renderPlugins() {
  const grid = document.getElementById('plugins-grid');
  if (!grid) return;

  grid.innerHTML = plugins.map(plugin => {
    const isFree = plugin.price === 'Бесплатно';
    return `
      <article class="plugin-card">
        <div class="plugin-card__visual">
          <div class="plugin-card__icon">${plugin.icon}</div>
          ${plugin.badge ? `<span class="plugin-card__badge">${plugin.badge}</span>` : ''}
        </div>
        <div class="plugin-card__content">
          <h3 class="plugin-card__title">${plugin.name}</h3>
          <p class="plugin-card__desc">${plugin.description}</p>
          <div class="plugin-card__meta">
            <div class="plugin-card__formats">
              ${plugin.formats.map(f => `<span class="format-tag">${f}</span>`).join('')}
            </div>
            <span class="plugin-card__price ${isFree ? 'plugin-card__price--free' : ''}">${plugin.price}</span>
          </div>
          <div class="plugin-card__actions">
            <a href="${plugin.primaryAction.href}" class="button button--primary">${plugin.primaryAction.label}</a>
            ${plugin.secondaryAction ? `<a href="${plugin.secondaryAction.href}" class="button button--secondary">${plugin.secondaryAction.label}</a>` : ''}
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function setYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderPlugins();
  setYear();
});
