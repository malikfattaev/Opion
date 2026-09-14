import type { Metadata } from "next";

import { CatalogFilter } from "@/components/catalog/catalog-filter";
import { ProductGrid } from "@/components/catalog/product-grid";
import { Container } from "@/components/layout/container";
import { getProducts, getProductStyles, getProductTypes } from "@/lib/catalog";
import { parseFilters } from "@/lib/catalog/filters";

export const metadata: Metadata = {
  description: "Все вещи Opion: худи, футболки, джинсы, верхняя одежда и аксессуары.",
};

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const filters = parseFilters(await searchParams);

  const [types, styles, products] = await Promise.all([
    getProductTypes(),
    getProductStyles(),
    getProducts(filters),
  ]);

  return (
    <>
      {/* Заголовок нужен поисковикам и скринридерам, но занимать первый экран не должен. */}
      <h1 className="sr-only">Каталог Opion</h1>

      <Container className="pt-8 pb-5">
        <CatalogFilter types={types} styles={styles} filters={filters} />
      </Container>

      <Container>
        <ProductGrid products={products} />
      </Container>
    </>
  );
}
