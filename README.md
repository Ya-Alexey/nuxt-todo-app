# Nuxt Todo App

Веб-приложение для управления задачами, построенное на базе **Nuxt 4**.

## Стек технологий

- **Framework:** Nuxt 4 (Vue 3, Nitro)
- **Runtime:** Node.js 24 (Alpine)
- **Контейнеризация(билд):** Docker, Docker Compose

## Запуск в Docker (Production)

Для сборки и запуска готового продакшн-билда в контейнере выполните в корне проекта:

```bash
docker compose up -d --build
```

После запуска приложение будет доступно по адресу: `http://localhost:3000`

## Локальная разработка (без Docker)

Для запуска сервера разработки с горячей перезагрузкой (HMR) потребуется установленный **Node.js 22+**:

1. Установите зависимости:
   ```bash
   npm ci
   ```
2. Запустите dev-сервер:
   ```bash
   npm run dev
   npm run dev:host // открыть доступ по локалке
   ```

## Тестирование

Запуск unit-тестов критической логики на базе Vitest:

```bash
npm run test
```

## Структура проекта

- `app/` — клиентская часть приложения (страницы, компоненты, composables, стили)
- `app/assets/sprite/svg` — SVG-иконки для автоматической генерации спрайтов через модуль `nuxt-svg-sprite-icon` (используются через компонент <SvgIcon />)
- `public/` — статические файлы
- `Dockerfile` — многоэтапная сборка продакшн-образа
- `docker-compose.yml` — конфигурация запуска контейнера и лимитов ресурсов

---

## Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.
