import "server-only";

import { z } from "zod";

import { apiRead } from "./client";

const saleSchema = z.object({
  id: z.string(),
  number: z.string(),
  status: z.string(),
  statusLabel: z.string(),
  source: z.string(),
  customer: z.string(),
  phone: z.string(),
  telegramUsername: z.string().nullable(),
  total: z.number(),
  items: z.array(
    z.object({
      sku: z.string(),
      name: z.string(),
      size: z.string(),
      quantity: z.number(),
      unitPrice: z.number(),
    }),
  ),
  createdAt: z.iso.datetime(),
});

const monthSchema = z.object({
  month: z.iso.datetime(),
  orders: z.number(),
  revenue: z.number(),
});

export type AdminSale = z.infer<typeof saleSchema>;
export type CashflowMonth = z.infer<typeof monthSchema>;

export async function listSales(): Promise<AdminSale[]> {
  return (await apiRead("/admin/sales", z.object({ sales: z.array(saleSchema) }))).sales;
}

export async function readCashflow(): Promise<CashflowMonth[]> {
  return (await apiRead("/admin/cashflow", z.object({ months: z.array(monthSchema) }))).months;
}
