# opion-web

Сайт Opion: витрина каталога и API, к которому обращается Telegram Mini App.

## Запуск

```bash
npm install
cp .env.example .env
npm run dev
```

## Команды

| Команда              | Что делает                                  |
|----------------------|---------------------------------------------|
| `npm run dev`        | Дев-сервер на http://localhost:3000         |
| `npm run build`      | Прод-сборка                                 |
| `npm run typecheck`  | Проверка типов                              |
| `npm run lint`       | ESLint                                      |
| `npm run db:migrate` | Миграция базы (локально)                    |
| `npm run db:deploy`  | Накатить миграции (прод)                    |
| `npm run db:studio`  | Prisma Studio                               |

## Что где

- `src/config/brand.ts` — логотип и цвета бренда. Сам файл логотипа — `public/brand/logo.png`.
- `src/config/site.ts` — название, описание, валюта, навигация.
- `src/app/globals.css` — цветовые токены. Меняются здесь, применяются везде.
- `src/lib/catalog/` — доступ к каталогу. Сейчас временные данные, дальше PostgreSQL.
- `src/lib/env.ts` — валидация переменных окружения.
