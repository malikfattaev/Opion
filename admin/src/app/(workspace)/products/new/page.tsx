import type { Metadata } from "next";

import { ProductForm } from "@/components/product-form";
import { listOptions } from "@/lib/api/catalog";

export const metadata: Metadata = { title: "Новая вещь" };

export default async function NewProductPage() {
  const [types, styles] = await Promise.all([listOptions("types"), listOptions("styles")]);

  return (
    <>
      <h1 className="mt-10 font-display text-4xl leading-tight">Новая вещь</h1>
      <ProductForm types={types} styles={styles} />
    </>
  );
}
