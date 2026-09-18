import "server-only";

import { OrderStatus } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { orderNumber } from "@/lib/orders/repository";
import { statusLabel } from "@/lib/orders/status";

/** Продажа глазами админки: заказ без внутренних полей Telegram. */
export type AdminSale = {
  id: string;
  number: string;
  status: OrderStatus;
  statusLabel: string;
  source: string;
  customer: string;
  phone: string;
  telegramUsername: string | null;
  total: number;
  items: { sku: string; name: string; size: string; quantity: number; unitPrice: number }[];
  /** Себестоимость заказа и то, что от него осталось. */
  cost: number;
  profit: number;
  createdAt: string;
};

/** Месяц кассы: приход, закупка и что осталось. */
export type CashflowMonth = {
  month: string;
  orders: number;
  revenue: number;
  cost: number;
  profit: number;
};

/** Деньгами считаем только сверенные заказы: новый может и не подтвердиться. */
const PAID: OrderStatus[] = [OrderStatus.CONFIRMED, OrderStatus.SHIPPED, OrderStatus.DONE];

/** Дальше первых двух сотен заказов админка пока не смотрит. */
const SALES_LIMIT = 200;
const CASHFLOW_MONTHS = 12;

export async function listSales(): Promise<AdminSale[]> {
  const rows = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    take: SALES_LIMIT,
    select: {
      id: true,
      seq: true,
      status: true,
      source: true,
      firstName: true,
      lastName: true,
      phone: true,
      telegramUsername: true,
      total: true,
      createdAt: true,
      items: {
        select: { sku: true, name: true, size: true, quantity: true, unitPrice: true, unitCost: true },
        orderBy: { id: "asc" },
      },
    },
  });

  return rows.map((row) => {
    const cost = row.items.reduce((sum, item) => sum + item.unitCost * item.quantity, 0);

    return {
      id: row.id,
      number: orderNumber(row),
      status: row.status,
      statusLabel: statusLabel(row.status),
      source: row.source,
      customer: `${row.firstName} ${row.lastName}`,
      phone: row.phone,
      telegramUsername: row.telegramUsername,
      total: row.total,
      items: row.items.map((item) => ({
        sku: item.sku,
        name: item.name,
        size: item.size,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      cost,
      profit: row.total - cost,
      createdAt: row.createdAt.toISOString(),
    };
  });
}

type CashflowRow = { month: Date; orders: number; revenue: number; cost: number };

/**
 * Касса по месяцам. Группировку по месяцу Prisma не умеет, поэтому считает
 * сама база: так не приходится тянуть в память все заказы за год.
 */
export async function readCashflow(): Promise<CashflowMonth[]> {
  const rows = await db.$queryRaw<CashflowRow[]>`
    SELECT date_trunc('month', o."createdAt") AS month,
           count(*)::int AS orders,
           coalesce(sum(o."total"), 0)::int AS revenue,
           coalesce(sum(
             (SELECT coalesce(sum(i."unitCost" * i."quantity"), 0)
              FROM "OrderItem" i
              WHERE i."orderId" = o."id")
           ), 0)::int AS cost
    FROM "Order" o
    WHERE o."status" = ANY (${PAID}::"OrderStatus"[])
    GROUP BY 1
    ORDER BY 1 DESC
    LIMIT ${CASHFLOW_MONTHS}
  `;

  return rows.map((row) => ({
    month: row.month.toISOString(),
    orders: row.orders,
    revenue: row.revenue,
    cost: row.cost,
    profit: row.revenue - row.cost,
  }));
}
