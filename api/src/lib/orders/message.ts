import { OrderSource } from "@/generated/prisma/enums";
import { formatPrice } from "@/lib/money";

import { orderNumber, type StoredOrder } from "./repository";
import { isAwaitingDecision, statusLabel } from "./status";

export type ResolvedOrderLine = {
  productSlug: string;
  name: string;
  size: string;
  quantity: number;
  unitPrice: number;
};

const SOURCE_LABELS: Record<OrderSource, string> = {
  [OrderSource.WEBSITE]: "сайт",
  [OrderSource.MINI_APP]: "мини-апп",
  [OrderSource.MANUAL]: "вручную",
};

/**
 * Подпись к скриншоту оплаты. Размечена HTML, тем же parse_mode, что и отправка.
 * Любые данные покупателя экранируются: иначе символ «<» в адресе развалит разметку.
 */
export function buildOrderCaption(order: StoredOrder): string {
  const heading = isAwaitingDecision(order.status) ? "Новый заказ" : "Заказ";

  const rows = [
    `<b>${heading} ${escapeHtml(orderNumber(order))}</b>`,
    `<b>Статус:</b> ${escapeHtml(statusLabel(order.status))}${formatDecision(order)}`,
    "",
    `<b>Покупатель:</b> ${escapeHtml(`${order.firstName} ${order.lastName}`)}`,
    `<b>Телефон:</b> ${escapeHtml(order.phone)}`,
    ...(order.telegramUsername ? [`<b>Telegram:</b> @${escapeHtml(order.telegramUsername)}`] : []),
    `<b>Адрес:</b> ${escapeHtml(order.address)}`,
    `<b>Откуда:</b> ${escapeHtml(SOURCE_LABELS[order.source])}`,
  ];

  if (order.comment) {
    rows.push(`<b>Комментарий:</b> ${escapeHtml(order.comment)}`);
  }

  rows.push("", formatItems(order), "", `<b>Итого: ${formatPrice(order.total)}</b>`);

  return rows.join("\n");
}

function formatItems(order: StoredOrder): string {
  return order.items
    .map(
      (line) =>
        `• ${escapeHtml(line.name)}, ${escapeHtml(line.size)} × ${line.quantity} · ${formatPrice(line.unitPrice * line.quantity)}`,
    )
    .join("\n");
}

function formatDecision(order: StoredOrder): string {
  return order.decidedByName ? ` · ${escapeHtml(order.decidedByName)}` : "";
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
