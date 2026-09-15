import "server-only";

import type { ZodType } from "zod";

/**
 * Админка ходит в API со своего сервера, поэтому CORS здесь не нужен,
 * а ответы у всех разделов одинаковой формы.
 */

export function ok(body: unknown, init: ResponseInit = {}): Response {
  return Response.json(body, init);
}

export function fail(message: string, status: number): Response {
  return Response.json({ message }, { status });
}

export const notFound = () => fail("Не найдено.", 404);

export type Parsed<T> = { ok: true; data: T } | { ok: false; response: Response };

/** Разбирает тело запроса и превращает первую ошибку схемы в человеческий текст. */
export async function parseBody<T>(request: Request, schema: ZodType<T>): Promise<Parsed<T>> {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return { ok: false, response: fail("Не удалось прочитать запрос.", 400) };
  }

  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    return { ok: false, response: fail(parsed.error.issues[0]?.message ?? "Проверьте заполнение формы.", 422) };
  }

  return { ok: true, data: parsed.data };
}

/**
 * Уникальные поля проверяет сама база, и её отказ понятнее пересказать,
 * чем ловить гонку между проверкой и вставкой.
 */
export function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: string }).code === "P2002";
}

/** Ссылка на запись, которую всё ещё используют: тип, к которому привязаны вещи. */
export function isForeignKeyViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: string }).code === "P2003";
}
