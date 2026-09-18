import "server-only";

import { OrderStatus } from "@/generated/prisma/enums";
import { db } from "@/lib/db";

/** Сводка для панели управления: то, что хочется видеть, не открывая разделы. */
export type AdminStats = {
  products: { total: number; published: number; hidden: number };
  catalog: { types: number; styles: number };
  orders: { total: number; awaiting: number; byStatus: { status: OrderStatus; count: number }[] };
  sales: { orders: number; items: number; revenue: number; averageCheck: number; lastMonthRevenue: number };
};

/** Продажей считается заказ, по которому оплату уже сверили. */
const PAID: OrderStatus[] = [OrderStatus.CONFIRMED, OrderStatus.SHIPPED, OrderStatus.DONE];

const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

export async function readStats(): Promise<AdminStats> {
  const monthAgo = new Date(Date.now() - MONTH_MS);

  const [products, published, types, styles, orders, byStatus, paid, items, lastMonth] = await Promise.all([
    db.product.count(),
    db.product.count({ where: { isPublished: true } }),
    db.productType.count(),
    db.style.count(),
    db.order.count(),
    db.order.groupBy({ by: ["status"], _count: { _all: true } }),
    db.order.aggregate({ where: { status: { in: PAID } }, _count: { _all: true }, _sum: { total: true } }),
    db.orderItem.aggregate({ where: { order: { status: { in: PAID } } }, _sum: { quantity: true } }),
    db.order.aggregate({
      where: { status: { in: PAID }, createdAt: { gte: monthAgo } },
      _sum: { total: true },
    }),
  ]);

  const paidOrders = paid._count._all;
  const revenue = paid._sum.total ?? 0;

  return {
    products: { total: products, published, hidden: products - published },
    catalog: { types, styles },
    orders: {
      total: orders,
      awaiting: byStatus.find((row) => row.status === OrderStatus.NEW)?._count._all ?? 0,
      byStatus: byStatus.map((row) => ({ status: row.status, count: row._count._all })),
    },
    sales: {
      orders: paidOrders,
      items: items._sum.quantity ?? 0,
      revenue,
      // Средний чек считаем сами: делить на ноль база не умеет.
      averageCheck: paidOrders === 0 ? 0 : Math.round(revenue / paidOrders),
      lastMonthRevenue: lastMonth._sum.total ?? 0,
    },
  };
}
