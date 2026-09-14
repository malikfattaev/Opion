import { z } from "zod";

/**
 * Единая точка валидации переменных окружения.
 *
 * Публичные (`NEXT_PUBLIC_*`) читаются буквально — иначе Next.js не подставит
 * их значения в клиентский бандл на этапе сборки. Серверные проверяются лениво,
 * при первом обращении, чтобы сборка не падала там, где доступ к базе не нужен.
 */

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url({ error: "нужен полный URL сайта, например https://opion.store" }),
  NEXT_PUBLIC_MINI_APP_URL: z.url().optional(),
});

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z
    .url({ error: "нужна строка подключения PostgreSQL" })
    .refine((value) => value.startsWith("postgres://") || value.startsWith("postgresql://"), {
      error: "строка подключения должна начинаться с postgres:// или postgresql://",
    }),
  /**
   * Приём заказов. Переменные необязательны, чтобы сборка и локальная разработка
   * не требовали доступа к боевому боту; на самом оформлении их наличие
   * проверяется явно и с понятной ошибкой.
   */
  TELEGRAM_BOT_TOKEN: z.string().min(1).optional(),
  /** Куда бот шлёт заказы: id группы основателей. Для групп он отрицательный. */
  TELEGRAM_ORDERS_CHAT_ID: z.string().min(1).optional(),

  /** Реквизиты для перевода, которые видит покупатель на оплате. */
  PAYMENT_CARD_NUMBER: z.string().min(1).optional(),
  PAYMENT_CARD_HOLDER: z.string().min(1).optional(),
  PAYMENT_BANK: z.string().min(1).optional(),
});

type PublicEnv = z.infer<typeof publicEnvSchema>;
type ServerEnv = z.infer<typeof serverEnvSchema>;

function parseEnv<Schema extends z.ZodType>(
  schema: Schema,
  source: Record<string, string | undefined>,
  scope: string,
): z.infer<Schema> {
  const result = schema.safeParse(withoutBlankValues(source));

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `  • ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n");

    throw new Error(`Некорректные переменные окружения (${scope}):\n${details}\n\nСверьтесь с .env.example.`);
  }

  return result.data;
}

/**
 * `FOO=` в .env даёт пустую строку, а не отсутствие переменной, и optional-поля
 * на ней спотыкаются. Приводим пустые значения к undefined до разбора схемы.
 */
function withoutBlankValues(source: Record<string, string | undefined>): Record<string, string | undefined> {
  return Object.fromEntries(
    Object.entries(source).map(([key, value]) => [key, value?.trim() === "" ? undefined : value]),
  );
}

export const publicEnv: PublicEnv = parseEnv(
  publicEnvSchema,
  {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_MINI_APP_URL: process.env.NEXT_PUBLIC_MINI_APP_URL,
  },
  "публичные",
);

let cachedServerEnv: ServerEnv | undefined;

export function serverEnv(): ServerEnv {
  if (typeof window !== "undefined") {
    throw new Error("serverEnv() недоступен в браузере — используйте publicEnv.");
  }

  cachedServerEnv ??= parseEnv(serverEnvSchema, process.env, "серверные");

  return cachedServerEnv;
}
