import type { Metadata } from "next";

import { PageIntro } from "@/components/layout/page-intro";

export const metadata: Metadata = { title: "Профиль" };

export default function Page() {
  return <PageIntro title="Профиль" description="Вход и история заказов появятся вместе с корзиной." />;
}
