import { OrderStatus } from "@/generated/prisma/enums";

/** Подписи статусов, одинаковые для группы основателей и для покупателя. */
const STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.NEW]: "Ожидает подтверждения",
  [OrderStatus.CONFIRMED]: "Подтверждён",
  [OrderStatus.SHIPPED]: "В доставке",
  [OrderStatus.DONE]: "Доставлен",
  [OrderStatus.REJECTED]: "Отклонён",
};

export function statusLabel(status: OrderStatus): string {
  return STATUS_LABELS[status];
}

/** Решение по заказу принимают один раз: дальше статус двигают из админки. */
export function isAwaitingDecision(status: OrderStatus): boolean {
  return status === OrderStatus.NEW;
}
