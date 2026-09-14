import type { Metadata } from "next";

import { OrdersList } from "@/components/orders-list";

export const metadata: Metadata = { title: "Мои заказы" };

export default function OrdersPage() {
  return (
    <div className="px-5">
      <h1 className="font-display text-3xl leading-tight">Мои заказы</h1>
      <OrdersList />
    </div>
  );
}
