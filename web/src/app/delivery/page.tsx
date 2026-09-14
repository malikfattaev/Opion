import type { Metadata } from "next";

import { PageIntro } from "@/components/layout/page-intro";

export const metadata: Metadata = { title: "Доставка и оплата" };

export default function Page() {
  return <PageIntro title="Доставка и оплата" description="Условия доставки и способы оплаты появятся здесь." />;
}
