import { orderNumber, type StoredOrder } from "./repository";
import { statusLabel } from "./status";

/** Заказ глазами покупателя: без телефона основателей, без внутренних полей. */
export type PublicOrder = {
  number: string;
  token: string;
  status: string;
  statusLabel: string;
  total: number;
  createdAt: string;
  items: { productSlug: string; sku: string; name: string; size: string; quantity: number; unitPrice: number }[];
};

export function toPublicOrder(order: StoredOrder): PublicOrder {
  return {
    number: orderNumber(order),
    token: order.publicToken,
    status: order.status,
    statusLabel: statusLabel(order.status),
    total: order.total,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((item) => ({ ...item })),
  };
}
