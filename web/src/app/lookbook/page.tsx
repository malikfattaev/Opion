import type { Metadata } from "next";

import { PageIntro } from "@/components/layout/page-intro";

export const metadata: Metadata = { title: "Лукбук" };

export default function Page() {
  return <PageIntro title="Лукбук" description="Съёмка готовится." />;
}
