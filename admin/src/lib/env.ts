import "server-only";

import { z } from "zod";

/**
 * Админка ходит в API только со своего сервера, поэтому адрес и токены
 * в браузер не попадают и публичных переменных здесь нет.
 */
const serverEnvSchema = z.object({
  API_URL: z.url({ error: "нужен адрес сервиса API" }),
});

let cached: { API_URL: string } | undefined;

function serverEnv() {
  cached ??= parse();

  return cached;
}

function parse() {
  const result = serverEnvSchema.safeParse({ API_URL: process.env.API_URL });

  if (!result.success) {
    const details = result.error.issues.map((issue) => `  • ${issue.path.join(".")}: ${issue.message}`).join("\n");

    throw new Error(`Некорректные переменные окружения:\n${details}\n\nСверьтесь с .env.example.`);
  }

  return result.data;
}

/** Без хвостовых слэшей: иначе в адресах появляется двойной слэш. */
export function apiUrl(): string {
  return serverEnv().API_URL.replace(/\/+$/, "");
}
