import { formatPrice } from "@/lib/money";

import type { OrderRequest } from "./schema";

export type ResolvedOrderLine = {
  name: string;
  size: string;
  quantity: number;
  unitPriceMinor: number;
};

/** Короткий номер, который называют покупателю и ищут в переписке. */
export function createOrderNumber(now: Date = new Date()): string {
  return `OP-${now.getTime().toString(36).toUpperCase()}`;
}

/**
 * Подпись к скриншоту оплаты. Размечена HTML — тем же parse_mode, что и в отправке.
 * Любые данные покупателя экранируются: иначе символ «<» в адресе развалит разметку.
 */
export function buildOrderCaption({
  orderNumber,
  order,
  lines,
  totalMinor,
}: {
  orderNumber: string;
  order: OrderRequest;
  lines: readonly ResolvedOrderLine[];
  totalMinor: number;
}): string {
  const items = lines
    .map((line) => `• ${escapeHtml(line.name)} — ${escapeHtml(line.size)} × ${line.quantity} — ${formatPrice(line.unitPriceMinor * line.quantity)}`)
    .join("\n");

  const rows = [
    `<b>Новый заказ ${escapeHtml(orderNumber)}</b>`,
    "",
    `<b>Покупатель:</b> ${escapeHtml(`${order.firstName} ${order.lastName}`)}`,
    `<b>Телефон:</b> ${escapeHtml(order.phone)}`,
    `<b>Адрес:</b> ${escapeHtml(order.address)}`,
  ];

  if (order.comment) {
    rows.push(`<b>Комментарий:</b> ${escapeHtml(order.comment)}`);
  }

  rows.push("", items, "", `<b>Итого: ${formatPrice(totalMinor)}</b>`);

  return rows.join("\n");
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
