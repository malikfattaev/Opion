import type { Metadata } from "next";

import { PageIntro } from "@/components/layout/page-intro";

export const metadata: Metadata = { title: "О бренде" };

export default function Page() {
  return <PageIntro title="О бренде" description="Расскажем об Opion, когда соберём текст." />;
}
