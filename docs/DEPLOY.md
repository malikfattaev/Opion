# Деплой

GitHub хранит код, Railway собирает и запускает. Пуш в `main` разворачивает прод.

## Сервисы в Railway

В одном проекте Railway поднимаются три сервиса:

| Сервис     | Источник           | Root Directory | Что делает            |
|------------|--------------------|----------------|-----------------------|
| `postgres` | шаблон Railway     | —              | База данных           |
| `web`      | репозиторий GitHub | `web`          | Сайт и API            |
| `app`      | репозиторий GitHub | `app`          | Telegram Mini App     |

Root Directory обязателен: без него Railway попытается собрать корень монорепозитория.

## Переменные окружения

### web

| Переменная              | Значение                                  |
|-------------------------|-------------------------------------------|
| `DATABASE_URL`          | `${{Postgres.DATABASE_URL}}`              |
| `NEXT_PUBLIC_SITE_URL`  | `https://${{RAILWAY_PUBLIC_DOMAIN}}`      |
| `NEXT_PUBLIC_MINI_APP_URL` | публичный домен сервиса `app`          |
| `TELEGRAM_BOT_TOKEN`    | токен из @BotFather                       |

### app

| Переменная            | Значение                        |
|-----------------------|---------------------------------|
| `NEXT_PUBLIC_API_URL` | публичный домен сервиса `web`   |

Ссылки вида `${{Postgres.DATABASE_URL}}` Railway подставляет сам — копировать
строку подключения руками не нужно, при ротации пароля она обновится автоматически.

## Порт

Railway передаёт порт в переменной `PORT`. `next start` читает её самостоятельно —
дополнительная настройка не нужна.

## Миграции базы

Схема применяется отдельным шагом, а не при старте приложения:

```bash
railway run --service web npm run db:deploy
```

`prisma migrate deploy` только накатывает уже созданные миграции и никогда не удаляет
данные. Команда `prisma migrate dev` — исключительно для локальной разработки.

## Первый запуск

```bash
gh repo create opion --private --source=. --remote=origin --push
railway init
railway add --database postgres
railway up
```

Дальше в дашборде Railway для каждого сервиса задаётся Root Directory и переменные
окружения из таблиц выше.
