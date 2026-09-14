import { z } from "zod";

/**
 * Мини-апп берёт каталог и принимает заказы через API сайта, поэтому его адрес
 * обязателен. Проверяем на старте, чтобы не ловить пустой fetch в рантайме.
 */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.url({ error: "нужен адрес сервиса API" }),
});

const result = publicEnvSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL?.trim() || undefined,
});

if (!result.success) {
  const details = result.error.issues.map((issue) => `  • ${issue.path.join(".")}: ${issue.message}`).join("\n");

  throw new Error(`Некорректные переменные окружения:\n${details}\n\nСверьтесь с .env.example.`);
}

export const publicEnv = result.data;

/** Адрес API без завершающего слеша: иначе получим двойной // в путях. */
export const apiUrl = publicEnv.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
