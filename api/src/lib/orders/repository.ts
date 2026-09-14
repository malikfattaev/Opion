import "server-only";

import { randomBytes } from "node:crypto";

import type { OrderSource, OrderStatus } from "@/generated/prisma/enums";
import { db } from "@/lib/db";

import type { ResolvedOrderLine } from "./message";
import type { OrderRequest } from "./schema";

/** Истории заказов длиннее покупателю не нужно, а запрос должен оставаться дешёвым. */
const MAX_HISTORY_LENGTH = 50;

/** Заказ в том виде, в каком его читают витрина, группа основателей и админка. */
export type StoredOrder = {
  id: string;
  seq: number;
  source: OrderSource;
  status: OrderStatus;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  comment: string | null;
  total: number;
  telegramUsername: string | null;
  publicToken: string;
  decidedByName: string | null;
  decidedAt: Date | null;
  createdAt: Date;
  items: ResolvedOrderLine[];
};

export type OrderWithMessage = StoredOrder & {
  telegramChatId: string | null;
  telegramMessageId: number | null;
};

const ORDER_SELECTION = {
  id: true,
  seq: true,
  source: true,
  status: true,
  firstName: true,
  lastName: true,
  phone: true,
  address: true,
  comment: true,
  total: true,
  telegramUsername: true,
  publicToken: true,
  decidedByName: true,
  decidedAt: true,
  createdAt: true,
  items: {
    select: { productSlug: true, name: true, size: true, quantity: true, unitPrice: true },
    orderBy: { id: "asc" },
  },
} as const;

const ORDER_WITH_MESSAGE_SELECTION = {
  ...ORDER_SELECTION,
  telegramChatId: true,
  telegramMessageId: true,
} as const;

/** Номер, который называют покупателю: «заказ OP-000148». */
export function orderNumber(order: { seq: number }): string {
  return `OP-${String(order.seq).padStart(6, "0")}`;
}

export type NewOrderInput = {
  source: OrderSource;
  order: OrderRequest;
  lines: readonly ResolvedOrderLine[];
  total: number;
  telegramUserId: string | null;
  telegramUsername: string | null;
};

export async function createOrder(input: NewOrderInput): Promise<StoredOrder> {
  return db.order.create({
    data: {
      publicToken: randomBytes(24).toString("base64url"),
      source: input.source,
      firstName: input.order.firstName,
      lastName: input.order.lastName,
      phone: input.order.phone,
      address: input.order.address,
      comment: input.order.comment ?? null,
      total: input.total,
      telegramUserId: input.telegramUserId,
      telegramUsername: input.telegramUsername,
      items: { create: input.lines.map((line) => ({ ...line })) },
    },
    select: ORDER_SELECTION,
  });
}

/** Запоминаем сообщение в группе, чтобы потом переписать его подпись и кнопки. */
export async function attachTelegramMessage(
  orderId: string,
  message: { chatId: string; messageId: number },
): Promise<void> {
  await db.order.update({
    where: { id: orderId },
    data: { telegramChatId: message.chatId, telegramMessageId: message.messageId },
  });
}

export async function findOrderByToken(publicToken: string): Promise<StoredOrder | null> {
  return db.order.findUnique({ where: { publicToken }, select: ORDER_SELECTION });
}

export async function listOrdersOfTelegramUser(telegramUserId: string): Promise<StoredOrder[]> {
  return db.order.findMany({
    where: { telegramUserId },
    orderBy: { createdAt: "desc" },
    take: MAX_HISTORY_LENGTH,
    select: ORDER_SELECTION,
  });
}

export async function findOrderById(id: string): Promise<OrderWithMessage | null> {
  return db.order.findUnique({ where: { id }, select: ORDER_WITH_MESSAGE_SELECTION });
}

/**
 * Переводит заказ в новый статус, но только если он всё ещё в ожидаемом:
 * две одновременно нажатые кнопки в группе не должны перебивать друг друга.
 */
export async function decideOrder({
  id,
  status,
  expectedStatus,
  decidedByName,
}: {
  id: string;
  status: OrderStatus;
  expectedStatus: OrderStatus;
  decidedByName: string;
}): Promise<OrderWithMessage | null> {
  const { count } = await db.order.updateMany({
    where: { id, status: expectedStatus },
    data: { status, decidedByName, decidedAt: new Date() },
  });

  return count === 0 ? null : findOrderById(id);
}
