import type { Metadata } from "next";

import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "О нас" };

export default function AboutPage() {
  return <PageIntro title="О нас" description="Рассказ о бренде появится здесь." />;
}
