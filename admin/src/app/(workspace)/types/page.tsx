import type { Metadata } from "next";

import { OptionsManager } from "@/components/options-manager";
import { listOptions, OPTION_TITLES } from "@/lib/api/catalog";

export const metadata: Metadata = { title: "Типы" };

export default async function TypesPage() {
  const options = await listOptions("types");

  return (
    <>
      <h1 className="mt-10 font-display text-4xl leading-tight">Типы</h1>
      <p className="mt-3 max-w-xl text-sm text-ink-muted">
        Худи, джинсы, футболка. У каждой вещи ровно один тип, по нему покупатель фильтрует витрину.
      </p>

      <OptionsManager kind="types" title={OPTION_TITLES.types.singular} options={options} />
    </>
  );
}
