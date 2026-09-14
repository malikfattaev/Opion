import type { Metadata } from "next";

import { CategoryFilter } from "@/components/catalog/category-filter";
import { ProductGrid } from "@/components/catalog/product-grid";
import { Container } from "@/components/layout/container";
import { PageIntro } from "@/components/layout/page-intro";
import { getCategories, getProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Каталог",
  description: "Все вещи Opion: верхняя одежда, трикотаж, базовый верх и низ.",
};

export default async function CatalogPage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);

  return (
    <>
      <PageIntro title="Каталог" />

      <Container className="border-b border-line">
        <CategoryFilter categories={categories} />
      </Container>

      <Container className="pt-12">
        <ProductGrid products={products} />
      </Container>
    </>
  );
}
