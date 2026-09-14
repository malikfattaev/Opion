import { formatPrice } from "@/lib/money";
import type { TelegramUser } from "@/lib/telegram/init-data";

import type { OrderRequest } from "./schema";

export type ResolvedOrderLine = {
  name: string;
  size: string;
  quantity: number;
  unitPrice: number;
};

/** Короткий номер, который называют покупателю и ищут в переписке. */
export function createOrderNumber(now: Date = new Date()): string {
  return `OP-${now.getTime().toString(36).toUpperCase()}`;
}

/**
 * Подпись к скриншоту оплаты. Размечена HTML, тем же parse_mode, что и в отправке.
 * Любые данные покупателя экранируются: иначе символ «<» в адресе развалит разметку.
 */
export function buildOrderCaption({
  orderNumber,
  order,
  lines,
  total,
  telegramUser = null,
}: {
  orderNumber: string;
  order: OrderRequest;
  lines: readonly ResolvedOrderLine[];
  total: number;
  telegramUser?: TelegramUser | null;
}): string {
  const items = lines
    .map((line) => `• ${escapeHtml(line.name)}, ${escapeHtml(line.size)} × ${line.quantity} · ${formatPrice(line.unitPrice * line.quantity)}`)
    .join("\n");

  const rows = [
    `<b>Новый заказ ${escapeHtml(orderNumber)}</b>`,
    "",
    `<b>Покупатель:</b> ${escapeHtml(`${order.firstName} ${order.lastName}`)}`,
    `<b>Телефон:</b> ${escapeHtml(order.phone)}`,
    ...(telegramUser ? [`<b>Telegram:</b> ${formatTelegramUser(telegramUser)}`] : []),
    `<b>Адрес:</b> ${escapeHtml(order.address)}`,
  ];

  if (order.comment) {
    rows.push(`<b>Комментарий:</b> ${escapeHtml(order.comment)}`);
  }

  rows.push("", items, "", `<b>Итого: ${formatPrice(total)}</b>`);

  return rows.join("\n");
}

function formatTelegramUser(user: TelegramUser): string {
  const name = escapeHtml([user.first_name, user.last_name].filter(Boolean).join(" "));

  return user.username ? `${name} (@${escapeHtml(user.username)})` : `${name} (id ${user.id})`;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
