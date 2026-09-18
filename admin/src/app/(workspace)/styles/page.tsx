import type { Metadata } from "next";

import { OptionsManager } from "@/components/options-manager";
import { PageHeader } from "@/components/ui";
import { listOptions, OPTION_TITLES } from "@/lib/api/catalog";

export const metadata: Metadata = { title: "Стили" };

export default async function StylesPage() {
  const options = await listOptions("styles");

  return (
    <>
      <PageHeader
        title="Стили"
        description="Y2K, Индислиз, Лузер-кор, Archive. Вещь может попадать сразу в несколько стилей."
      />

      <OptionsManager kind="styles" title={OPTION_TITLES.styles.singular} options={options} />
    </>
  );
}
