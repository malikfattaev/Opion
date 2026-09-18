import type { Metadata } from "next";

import { OptionsManager } from "@/components/options-manager";
import { listOptions } from "@/lib/api/catalog";

export const metadata: Metadata = { title: "Стили" };

export default async function StylesPage() {
  const options = await listOptions("styles");

  return (
    <OptionsManager kind="styles" options={options} />
  );
}
