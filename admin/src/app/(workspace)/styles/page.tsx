import type { Metadata } from "next";

import { OptionsManager } from "@/components/options-manager";
import { listOptions, OPTION_TITLES } from "@/lib/api/catalog";

export const metadata: Metadata = { title: "Стили" };

export default async function StylesPage() {
  const options = await listOptions("styles");

  return (
    <>
      <h1 className="mt-10 font-display text-4xl leading-tight">Стили</h1>
      <p className="mt-3 max-w-xl text-sm text-ink-muted">
        Y2K, Индислиз, Лузер-кор, Archive. Вещь может попадать сразу в несколько стилей.
      </p>

      <OptionsManager kind="styles" title={OPTION_TITLES.styles.singular} options={options} />
    </>
  );
}
