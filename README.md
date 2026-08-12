# podlesnytwins.com/plugins

Лендинг / каталог аудио-плагинов Podlesny Twins.

## Структура

```
.
├── index.html       # Разметка страницы
├── styles.css       # Стили
├── script.js        # Рендер карточек плагинов
├── assets/          # Картинки, шрифты, демо-файлы
└── README.md
```

## Локальный запуск

Любой статический сервер. Например:

```bash
# Python
python3 -m http.server 8080

# Node (если установлен npx)
npx serve .

# Или просто открыть index.html в браузере
```

Открыть `http://localhost:8080`.

## Редактирование плагинов

Плагины хранятся в массиве `plugins` в `script.js`. Чтобы добавить или изменить — отредактируй объект:

```js
{
  id: 'uniq-id',
  name: 'Название',
  description: 'Описание',
  formats: ['VST3', 'AU', 'AAX'],
  price: '1 990 ₽',
  badge: 'New',      // или null
  icon: 'AB',        // две буквы в квадрате
  primaryAction: { label: 'Купить', href: '#' },
  secondaryAction: { label: 'Демо', href: '#' } // или null
}
```

## Деплой

### Vercel (рекомендуется, если основной сайт на Vercel)

1. Закинуть папку в репозиторий.
2. В Vercel создать проект и указать `podlesnytwins-plugins` как root directory.
3. Настроить поддомен/путь: `podlesnytwins.com/plugins`.

### Netlify / Cloudflare Pages

Загрузить эту папку как статический сайт. Framework preset — None.

### На существующий хостинг

Скопировать файлы в директорию `/plugins` на сервере:

```bash
rsync -avz --exclude='.git' ./ user@host:/var/www/podlesnytwins.com/plugins/
```

## TODO

- [ ] Добавить реальные ссылки на оплату / скачивание
- [ ] Добавить скриншоты интерфейсов плагинов
- [ ] Подключить аналитику
- [ ] Страницы отдельных плагинов
