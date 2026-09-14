import type { Metadata } from "next";

import { OrdersList } from "@/components/orders/orders-list";

export const metadata: Metadata = { title: "Мои заказы" };

export default function OrdersPage() {
  return <OrdersList />;
}
