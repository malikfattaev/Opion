import "server-only";

import { buildOrderCaption } from "@/lib/orders/message";
import type { OrderWithMessage, StoredOrder } from "@/lib/orders/repository";
import { isAwaitingDecision } from "@/lib/orders/status";
import { serverEnv } from "@/lib/env";

import { callTelegram, type TelegramResult } from "./client";

/** Ограничение Telegram на подпись к фотографии. */
const MAX_CAPTION_LENGTH = 1024;

/** Кнопки под заказом. Значение уезжает в callback_data, лимит там 64 байта. */
export const ORDER_ACTIONS = { confirm: "order:confirm", reject: "order:reject" } as const;

export type OrderAction = keyof typeof ORDER_ACTIONS;

type SentMessage = { chatId: string; messageId: number };

/** Отправляет скриншот оплаты с описанием заказа и кнопками решения. */
export async function sendOrderMessage(order: StoredOrder, screenshot: File): Promise<TelegramResult<SentMessage>> {
  const { TELEGRAM_ORDERS_CHAT_ID, TELEGRAM_ORDERS_THREAD_ID } = serverEnv();

  if (!TELEGRAM_ORDERS_CHAT_ID) {
    return { ok: false, reason: "Приём заказов не настроен: нет идентификатора группы." };
  }

  const body = new FormData();
  body.set("chat_id", TELEGRAM_ORDERS_CHAT_ID);
  body.set("caption", truncate(buildOrderCaption(order), MAX_CAPTION_LENGTH));
  body.set("parse_mode", "HTML");
  body.set("photo", screenshot, screenshot.name || "payment.jpg");
  body.set("reply_markup", JSON.stringify(orderKeyboard(order)));

  if (TELEGRAM_ORDERS_THREAD_ID !== undefined) {
    body.set("message_thread_id", String(TELEGRAM_ORDERS_THREAD_ID));
  }

  const sent = await callTelegram<{ message_id: number; chat: { id: number } }>("sendPhoto", body);

  return sent.ok
    ? { ok: true, result: { chatId: String(sent.result.chat.id), messageId: sent.result.message_id } }
    : sent;
}

/** Переписывает подпись и убирает кнопки после решения по заказу. */
export async function updateOrderMessage(order: OrderWithMessage): Promise<TelegramResult<unknown>> {
  if (!order.telegramChatId || order.telegramMessageId === null) {
    return { ok: false, reason: "У заказа нет сообщения в группе." };
  }

  return callTelegram("editMessageCaption", {
    chat_id: order.telegramChatId,
    message_id: order.telegramMessageId,
    caption: truncate(buildOrderCaption(order), MAX_CAPTION_LENGTH),
    parse_mode: "HTML",
    reply_markup: orderKeyboard(order),
  });
}

export async function answerCallback(callbackQueryId: string, text: string): Promise<void> {
  await callTelegram("answerCallbackQuery", { callback_query_id: callbackQueryId, text });
}

/** Решение по заказу принимают только администраторы группы заказов. */
export async function isOrdersChatAdmin(userId: number): Promise<boolean> {
  const { TELEGRAM_ORDERS_CHAT_ID } = serverEnv();

  if (!TELEGRAM_ORDERS_CHAT_ID) {
    return false;
  }

  const member = await callTelegram<{ status: string }>("getChatMember", {
    chat_id: TELEGRAM_ORDERS_CHAT_ID,
    user_id: userId,
  });

  return member.ok && (member.result.status === "creator" || member.result.status === "administrator");
}

/** Кнопки нужны, пока решение не принято: после него сообщение остаётся историей. */
function orderKeyboard(order: StoredOrder) {
  if (!isAwaitingDecision(order.status)) {
    return { inline_keyboard: [] };
  }

  return {
    inline_keyboard: [
      [
        { text: "Подтвердить", callback_data: `${ORDER_ACTIONS.confirm}:${order.id}` },
        { text: "Отклонить", callback_data: `${ORDER_ACTIONS.reject}:${order.id}` },
      ],
    ],
  };
}

function truncate(value: string, limit: number): string {
  return value.length <= limit ? value : `${value.slice(0, limit - 1)}…`;
}
