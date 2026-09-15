import "server-only";

import { redirect } from "next/navigation";
import type { ZodType } from "zod";

import { apiUrl } from "@/lib/env";

import { sessionToken } from "./session";

/**
 * Один способ ходить в API из админки. Ответ разбирается схемой: если API
 * поменяет форму, это станет видно сразу, а не на странице пользователя.
 */

export type ApiResult<T> = { ok: true; data: T } | { ok: false; message: string };

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
};

/** Чтение под сессией. Протухший вход уводит на страницу входа, а не в ошибку. */
export async function apiRead<T>(path: string, schema: ZodType<T>): Promise<T> {
  const result = await apiRequest(path, schema, {});

  if (!result.ok) {
    throw new Error(result.message);
  }

  return result.data;
}

export async function apiRequest<T>(
  path: string,
  schema: ZodType<T>,
  { method = "GET", body }: RequestOptions,
): Promise<ApiResult<T>> {
  const token = await sessionToken();

  if (!token) {
    redirect("/login");
  }

  let response: Response;

  try {
    response = await fetch(`${apiUrl()}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      cache: "no-store",
    });
  } catch {
    return { ok: false, message: "Сервис недоступен. Попробуйте ещё раз." };
  }

  if (response.status === 401) {
    redirect("/login");
  }

  if (response.status === 204) {
    return schema.safeParse(undefined).success
      ? { ok: true, data: undefined as T }
      : { ok: false, message: "API ответил пустым телом." };
  }

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    return { ok: false, message: readMessage(payload) ?? "Не получилось выполнить запрос." };
  }

  const parsed = schema.safeParse(payload);

  return parsed.success ? { ok: true, data: parsed.data } : { ok: false, message: "API ответил неожиданно." };
}

function readMessage(payload: unknown): string | null {
  if (typeof payload !== "object" || payload === null) {
    return null;
  }

  const message = (payload as Record<string, unknown>).message;

  return typeof message === "string" ? message : null;
}
