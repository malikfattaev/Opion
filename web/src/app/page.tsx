import type { Metadata } from "next";

import { CategoryFilter } from "@/components/catalog/category-filter";
import { ProductGrid } from "@/components/catalog/product-grid";
import { Container } from "@/components/layout/container";
import { getCategories, getProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  description: "Все вещи Opion: верхняя одежда, трикотаж, базовый верх и низ.",
};

export default async function HomePage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);

  return (
    <>
      {/* Заголовок нужен поисковикам и скринридерам, но занимать первый экран не должен. */}
      <h1 className="sr-only">Каталог Opion</h1>

      <Container className="pb-10">
        <CategoryFilter categories={categories} />
      </Container>

      <Container>
        <ProductGrid products={products} />
      </Container>
    </>
  );
}
