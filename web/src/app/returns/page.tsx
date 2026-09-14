import type { Metadata } from "next";

import { PageIntro } from "@/components/layout/page-intro";

export const metadata: Metadata = { title: "Возврат" };

export default function Page() {
  return <PageIntro title="Возврат" description="Правила возврата появятся здесь." />;
}
