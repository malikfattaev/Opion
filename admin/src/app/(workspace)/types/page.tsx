import type { Metadata } from "next";

import { OptionsManager } from "@/components/options-manager";
import { PageHeader } from "@/components/ui";
import { listOptions, OPTION_TITLES } from "@/lib/api/catalog";

export const metadata: Metadata = { title: "Типы" };

export default async function TypesPage() {
  const options = await listOptions("types");

  return (
    <>
      <PageHeader
        title="Типы"
        description="Худи, джинсы, футболка. У каждой вещи ровно один тип, по нему покупатель фильтрует витрину."
      />

      <OptionsManager kind="types" title={OPTION_TITLES.types.singular} options={options} />
    </>
  );
}
