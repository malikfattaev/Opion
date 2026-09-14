import "server-only";

import { serverEnv } from "@/lib/env";

export type TelegramResult<T> = { ok: true; result: T } | { ok: false; reason: string };

/**
 * Один вызов Bot API. Тело передаётся либо JSON, либо FormData,
 * когда в запросе есть файл.
 * Документация: https://core.telegram.org/bots/api
 */
export async function callTelegram<T>(method: string, body: FormData | Record<string, unknown>): Promise<TelegramResult<T>> {
  const { TELEGRAM_BOT_TOKEN } = serverEnv();

  if (!TELEGRAM_BOT_TOKEN) {
    return { ok: false, reason: "Не задан токен бота." };
  }

  const request: RequestInit =
    body instanceof FormData
      ? { method: "POST", body }
      : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };

  let payload: unknown;

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${method}`, request);

    payload = await response.json();
  } catch {
    return { ok: false, reason: "Не удалось связаться с Telegram." };
  }

  if (!isTelegramEnvelope(payload)) {
    return { ok: false, reason: `Telegram вернул неожиданный ответ на ${method}.` };
  }

  return payload.ok
    ? { ok: true, result: payload.result as T }
    : { ok: false, reason: payload.description ?? `Telegram отклонил ${method}.` };
}

type TelegramEnvelope = { ok: boolean; result?: unknown; description?: string };

function isTelegramEnvelope(value: unknown): value is TelegramEnvelope {
  return typeof value === "object" && value !== null && typeof (value as TelegramEnvelope).ok === "boolean";
}
