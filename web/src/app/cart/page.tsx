import type { Metadata } from "next";

import { PageIntro } from "@/components/layout/page-intro";

export const metadata: Metadata = { title: "Корзина" };

export default function Page() {
  return <PageIntro title="Корзина" description="Корзина появится следующим шагом." />;
}
