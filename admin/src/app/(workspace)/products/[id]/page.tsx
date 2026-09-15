import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductForm } from "@/components/product-form";
import { findProduct, listOptions } from "@/lib/api/catalog";

export async function generateMetadata({ params }: PageProps<"/products/[id]">): Promise<Metadata> {
  const product = await findProduct((await params).id);

  return { title: product?.name ?? "Вещь" };
}

export default async function EditProductPage({ params }: PageProps<"/products/[id]">) {
  const { id } = await params;
  const [product, types, styles] = await Promise.all([
    findProduct(id),
    listOptions("types"),
    listOptions("styles"),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <>
      <h1 className="mt-10 font-display text-4xl leading-tight">{product.name}</h1>
      <ProductForm product={product} types={types} styles={styles} />
    </>
  );
}
