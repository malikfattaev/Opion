import "server-only";

import { serverEnv } from "@/lib/env";

import { callTelegram, type TelegramResult } from "./client";

/**
 * Ответ на /start. Человек написал боту и ждёт, что делать дальше,
 * поэтому сразу даём кнопку с каталогом.
 */
const GREETING = [
  "Это OPIØN.",
  "",
  "Каталог живёт в мини-аппе: нажмите кнопку ниже, выберите вещь и оформите заказ.",
  "Оплата переводом, подтверждение придёт сюда же.",
].join("\n");

/** Без адреса мини-аппа кнопку не собрать: подсказываем ту, что рядом с полем ввода. */
const GREETING_WITHOUT_BUTTON = [
  "Это OPIØN.",
  "",
  "Каталог живёт в мини-аппе: откройте его кнопкой рядом с полем ввода, выберите вещь и оформите заказ.",
  "Оплата переводом, подтверждение придёт сюда же.",
].join("\n");

export async function sendWelcome(chatId: number): Promise<TelegramResult<unknown>> {
  const url = miniAppUrl();

  if (!url) {
    return callTelegram("sendMessage", { chat_id: chatId, text: GREETING_WITHOUT_BUTTON });
  }

  return callTelegram("sendMessage", {
    chat_id: chatId,
    text: GREETING,
    reply_markup: {
      inline_keyboard: [[{ text: "Открыть каталог", web_app: { url } }]],
    },
  });
}

/**
 * Кнопку мини-аппа Telegram принимает только с https, а на своей машине
 * адрес обычный. Тогда отвечаем без кнопки, а не роняем весь ответ.
 */
function miniAppUrl(): string | null {
  const { MINI_APP_URL } = serverEnv();

  return MINI_APP_URL?.startsWith("https://") ? MINI_APP_URL : null;
}
