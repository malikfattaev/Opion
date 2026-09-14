import "server-only";

import { serverEnv } from "@/lib/env";

/** Ограничение Telegram на подпись к фотографии. */
const MAX_CAPTION_LENGTH = 1024;

export type TelegramSendResult = { ok: true } | { ok: false; reason: string };

/**
 * Отправляет скриншот оплаты с описанием заказа в группу основателей.
 * Telegram Bot API: https://core.telegram.org/bots/api#sendphoto
 */
export async function sendOrderPhoto({ photo, caption }: { photo: File; caption: string }): Promise<TelegramSendResult> {
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_ORDERS_CHAT_ID, TELEGRAM_ORDERS_THREAD_ID } = serverEnv();

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_ORDERS_CHAT_ID) {
    return { ok: false, reason: "Приём заказов не настроен: нет токена бота или идентификатора группы." };
  }

  const body = new FormData();
  body.set("chat_id", TELEGRAM_ORDERS_CHAT_ID);
  body.set("caption", truncate(caption, MAX_CAPTION_LENGTH));
  body.set("parse_mode", "HTML");
  body.set("photo", photo, photo.name || "payment.jpg");

  if (TELEGRAM_ORDERS_THREAD_ID !== undefined) {
    body.set("message_thread_id", String(TELEGRAM_ORDERS_THREAD_ID));
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
      method: "POST",
      body,
    });

    if (!response.ok) {
      const details: unknown = await response.json().catch(() => null);

      return { ok: false, reason: describeTelegramError(details) ?? `Telegram ответил ${response.status}.` };
    }

    return { ok: true };
  } catch {
    return { ok: false, reason: "Не удалось связаться с Telegram." };
  }
}

function describeTelegramError(details: unknown): string | null {
  if (typeof details !== "object" || details === null) {
    return null;
  }

  const description = (details as Record<string, unknown>).description;

  return typeof description === "string" ? description : null;
}

function truncate(value: string, limit: number): string {
  return value.length <= limit ? value : `${value.slice(0, limit - 1)}…`;
}
