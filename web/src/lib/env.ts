import { z } from "zod";

/**
 * Сайт не ходит в базу: за данными и заказами он обращается к сервису API.
 * Переменные публичные, потому что адрес API нужен и браузеру при оформлении.
 * Читаем их буквально, иначе Next.js не подставит значения в клиентский бандл.
 */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url({ error: "нужен полный адрес сайта, например https://opion.uz" }),
  NEXT_PUBLIC_API_URL: z.url({ error: "нужен адрес сервиса API" }),
  NEXT_PUBLIC_MINI_APP_URL: z.url().optional(),
});

const result = publicEnvSchema.safeParse({
  NEXT_PUBLIC_SITE_URL: blankToUndefined(process.env.NEXT_PUBLIC_SITE_URL),
  NEXT_PUBLIC_API_URL: blankToUndefined(process.env.NEXT_PUBLIC_API_URL),
  NEXT_PUBLIC_MINI_APP_URL: blankToUndefined(process.env.NEXT_PUBLIC_MINI_APP_URL),
});

if (!result.success) {
  const details = result.error.issues
    .map((issue) => `  • ${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("\n");

  throw new Error(`Некорректные переменные окружения:\n${details}\n\nСверьтесь с .env.example.`);
}

export const publicEnv = result.data;

/** Адрес API без завершающего слеша: иначе в путях получится двойной //. */
export const apiUrl = publicEnv.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");

/** `FOO=` в .env даёт пустую строку, а не отсутствие переменной. */
function blankToUndefined(value: string | undefined): string | undefined {
  return value?.trim() === "" ? undefined : value;
}
