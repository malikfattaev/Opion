import type { Metadata } from "next";

import { ProductForm } from "@/components/product-form";
import { PageHeader } from "@/components/ui";
import { listOptions } from "@/lib/api/catalog";

export const metadata: Metadata = { title: "Новая вещь" };

export default async function NewProductPage() {
  const [types, styles] = await Promise.all([listOptions("types"), listOptions("styles")]);

  return (
    <>
      <PageHeader title="Новая вещь" />
      <ProductForm types={types} styles={styles} />
    </>
  );
}
