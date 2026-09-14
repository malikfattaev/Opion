import type { Metadata } from "next";

import { PageIntro } from "@/components/layout/page-intro";

export const metadata: Metadata = { title: "Контакты" };

export default function Page() {
  return <PageIntro title="Контакты" description="Контакты появятся здесь." />;
}
