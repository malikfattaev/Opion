import "server-only";

import { z } from "zod";

import { apiRead } from "./client";

const statsSchema = z.object({
  products: z.object({ total: z.number(), published: z.number(), hidden: z.number() }),
  catalog: z.object({ types: z.number(), styles: z.number() }),
  orders: z.object({
    total: z.number(),
    awaiting: z.number(),
    byStatus: z.array(z.object({ status: z.string(), count: z.number() })),
  }),
  sales: z.object({
    orders: z.number(),
    items: z.number(),
    revenue: z.number(),
    cost: z.number(),
    profit: z.number(),
    averageCheck: z.number(),
    lastMonthRevenue: z.number(),
  }),
});

export type AdminStats = z.infer<typeof statsSchema>;

export async function readStats(): Promise<AdminStats> {
  return (await apiRead("/admin/stats", z.object({ stats: statsSchema }))).stats;
}
