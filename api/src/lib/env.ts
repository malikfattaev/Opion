import "server-only";

import { z } from "zod";

/**
 * Переменные окружения API. Разбираются лениво, при первом обращении:
 * сборка не должна требовать доступа к боевой базе и боту.
 */
const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  DATABASE_URL: z
    .url({ error: "нужна строка подключения PostgreSQL" })
    .refine((value) => value.startsWith("postgres://") || value.startsWith("postgresql://"), {
      error: "строка подключения должна начинаться с postgres:// или postgresql://",
    }),

  /** Домены витрин, которым разрешено обращаться к API из браузера. */
  ALLOWED_ORIGINS: z.string().default(""),

  /** Приём заказов. Без них витрина работает, но оформление заблокировано. */
  TELEGRAM_BOT_TOKEN: z.string().min(1).optional(),
  TELEGRAM_ORDERS_CHAT_ID: z.string().min(1).optional(),
  /** Топик форума, если группа заказов разбита на темы. */
  TELEGRAM_ORDERS_THREAD_ID: z.coerce.number().int().positive().optional(),
  /** Секрет, которым Telegram подписывает вызовы вебхука. Задаётся в setWebhook. */
  TELEGRAM_WEBHOOK_SECRET: z.string().min(16).optional(),

  /**
   * Адрес, по которому API виден из браузера. Нужен ссылкам на картинки:
   * админка ходит к нам по внутренней сети, и её адрес наружу не годится.
   */
  PUBLIC_API_URL: z.url().optional(),
  /** Домен, который Railway выдаёт сервису. Подставляется платформой. */
  RAILWAY_PUBLIC_DOMAIN: z.string().min(1).optional(),

  /** Хранилище картинок: бакет Railway по протоколу S3. */
  BUCKET_NAME: z.string().min(1).optional(),
  BUCKET_ENDPOINT: z.url().optional(),
  BUCKET_REGION: z.string().min(1).default("auto"),
  BUCKET_ACCESS_KEY_ID: z.string().min(1).optional(),
  BUCKET_SECRET_ACCESS_KEY: z.string().min(1).optional(),

  /** Реквизиты для перевода, которые видит покупатель. */
  PAYMENT_CARD_NUMBER: z.string().min(1).optional(),
  PAYMENT_CARD_HOLDER: z.string().min(1).optional(),
  PAYMENT_BANK: z.string().min(1).optional(),
});

type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | undefined;

export function serverEnv(): ServerEnv {
  cached ??= parse();

  return cached;
}

function parse(): ServerEnv {
  // `FOO=` в .env даёт пустую строку, а не отсутствие переменной,
  // и optional-поля на ней спотыкаются.
  const source = Object.fromEntries(
    Object.entries(process.env).map(([key, value]) => [key, value?.trim() === "" ? undefined : value]),
  );

  const result = serverEnvSchema.safeParse(source);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `  • ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n");

    throw new Error(`Некорректные переменные окружения:\n${details}\n\nСверьтесь с .env.example.`);
  }

  return result.data;
}

/** Список разрешённых источников, уже разобранный и без пустых значений. */
export function allowedOrigins(): string[] {
  return serverEnv()
    .ALLOWED_ORIGINS.split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean);
}

/** `null`, если публичный адрес неизвестен: тогда ссылки остаются относительными. */
export function publicApiOrigin(): string | null {
  const env = serverEnv();

  if (env.PUBLIC_API_URL) {
    return env.PUBLIC_API_URL.replace(/\/+$/, "");
  }

  return env.RAILWAY_PUBLIC_DOMAIN ? `https://${env.RAILWAY_PUBLIC_DOMAIN}` : null;
}

export type BucketConfig = {
  name: string;
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
};

/** Бакет настроен не везде: без него админка просто не даёт загружать фото. */
export function bucketConfig(): BucketConfig | null {
  const env = serverEnv();

  if (
    !env.BUCKET_NAME ||
    !env.BUCKET_ENDPOINT ||
    !env.BUCKET_ACCESS_KEY_ID ||
    !env.BUCKET_SECRET_ACCESS_KEY
  ) {
    return null;
  }

  return {
    name: env.BUCKET_NAME,
    endpoint: env.BUCKET_ENDPOINT,
    region: env.BUCKET_REGION,
    accessKeyId: env.BUCKET_ACCESS_KEY_ID,
    secretAccessKey: env.BUCKET_SECRET_ACCESS_KEY,
  };
}
