# podlesnytwins.com/plugins

Заглушка для раздела плагинов Podlesny Twins.

## Структура

```
.
├── index.html       # Разметка страницы
├── styles.css       # Стили
├── script.js        # Заглушка
├── assets/          # Логотип и будущие картинки
└── README.md
```

## Локальный запуск

```bash
cd ~/podlesnytwins-plugins
python3 -m http.server 8080
```

Открыть `http://localhost:8080`.

## Деплой на поддомен plugins.podlesnytwins.com

### 1. Создать репозиторий на GitHub

```bash
cd ~/podlesnytwins-plugins
git remote add origin https://github.com/lesnycode/podlesnytwins-plugins.git
git push -u origin main
```

Если репозиторий ещё не создан — создай его вручную на https://github.com/new.

### 2. Включить GitHub Pages

1. Открыть репозиторий на GitHub → Settings → Pages.
2. Source: Deploy from a branch.
3. Branch: `main`, folder: `/ (root)`.
4. Сохранить.
5. В разделе «Custom domain» вписать: `plugins.podlesnytwins.com`.
6. Поставить галочку «Enforce HTTPS» (после того как DNS обновится).

Файл `CNAME` в репозитории уже содержит `plugins.podlesnytwins.com`, поэтому GitHub сам подтянет домен после пуша.

### 3. Добавить запись в nic.ru

В панели управления DNS домена `podlesnytwins.com` на nic.ru добавить запись:

| Тип | Имя | Значение |
|---|---|---|
| CNAME | `plugins` | `lesnycode.github.io` |

> Если аккаунт GitHub не `lesnycode` — подставь свой логин: `ВАШ_ЛОГИН.github.io`.

После сохранения подождать 5–30 минут (иногда до 24 часов). Проверить:

```bash
dig plugins.podlesnytwins.com +short
```

Должно отдать что-то вроде:

```
lesnycode.github.io.
185.199.108.153
...
```

### 4. Проверить

Открыть `https://plugins.podlesnytwins.com`.

## TODO

- [ ] Заменить заглушку на полноценный каталог плагинов
- [ ] Добавить реальные описания, цены и ссылки
- [ ] Подключить аналитику
