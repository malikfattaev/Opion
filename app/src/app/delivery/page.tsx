import type { Metadata } from "next";

import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "Доставка и оплата" };

export default function DeliveryPage() {
  return <PageIntro title="Доставка и оплата" description="Условия доставки и способы оплаты появятся здесь." />;
}
