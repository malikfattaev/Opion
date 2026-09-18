import type { Metadata } from "next";

import { OptionsManager } from "@/components/options-manager";
import { listOptions } from "@/lib/api/catalog";

export const metadata: Metadata = { title: "Типы" };

export default async function TypesPage() {
  const options = await listOptions("types");

  return (
    <OptionsManager kind="types" options={options} />
  );
}
