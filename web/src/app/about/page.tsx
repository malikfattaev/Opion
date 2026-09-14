import type { Metadata } from "next";

import { PageIntro } from "@/components/layout/page-intro";

export const metadata: Metadata = { title: "О нас" };

export default function Page() {
  return <PageIntro title="О нас" description="Расскажем об Opion, когда соберём текст." />;
}
