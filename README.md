# Opion

Магазин одежды Opion: сайт, Telegram Mini App и общее хранилище медиа.

## Структура

```
OPION/
├── media/     Логотипы, съёмки, посты, видео — источник правды по контенту
├── web/       Сайт: Next.js 16 + TypeScript + Tailwind 4
├── app/       Telegram Mini App: Next.js 16 + TypeScript + Tailwind 4
└── docs/      Архитектура, деплой, рабочие соглашения
```

Подробности по папкам — в [media/README.md](media/README.md) и [docs/](docs/).

## Быстрый старт

```bash
cd web && npm install && cp .env.example .env && npm run dev
```

```bash
cd app && npm install && cp .env.example .env && npm run dev
```

Сайт поднимается на `http://localhost:3000`, мини-апп — на следующем свободном порту
(`npm run dev -- -p 3001`, чтобы задать явно).

## Стек

| Слой         | Технология                          |
|--------------|-------------------------------------|
| Сайт         | Next.js 16 (App Router), TypeScript |
| Мини-апп     | Next.js 16 (App Router), TypeScript |
| Стили        | Tailwind CSS 4                      |
| База данных  | PostgreSQL (Railway) + Prisma 7     |
| Хостинг      | Railway                             |
| Репозиторий  | GitHub                              |

Telegram Mini App — это веб-приложение внутри мессенджера, поэтому он собран на том же
стеке, что и сайт. Expo остаётся в запасе на случай нативных приложений для App Store
и Google Play.

## Требования

- Node.js 24 (см. `.nvmrc`)
- npm 11
