import type { Metadata } from "next";

import { OrdersList } from "@/components/orders-list";
import { PageTitle } from "@/components/page-title";

export const metadata: Metadata = { title: "Мои заказы" };

export default function OrdersPage() {
  return (
    <div className="px-5">
      <PageTitle>Мои заказы</PageTitle>
      <OrdersList />
    </div>
  );
}
