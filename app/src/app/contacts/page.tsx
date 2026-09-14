import type { Metadata } from "next";

import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "Контакты" };

export default function ContactsPage() {
  return <PageIntro title="Контакты" description="Контакты появятся здесь." />;
}
