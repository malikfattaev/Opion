import Link from "next/link";

import { CategoryFilter } from "@/components/catalog/category-filter";
import { ProductGrid } from "@/components/catalog/product-grid";
import { Container } from "@/components/layout/container";
import { siteConfig } from "@/config/site";
import { getCategories, getProducts } from "@/lib/catalog";

const FEATURED_PRODUCTS_LIMIT = 4;

export default async function HomePage() {
  const [categories, featuredProducts] = await Promise.all([
    getCategories(),
    getProducts({ limit: FEATURED_PRODUCTS_LIMIT }),
  ]);

  return (
    <>
      <Container className="pt-20 pb-16 sm:pt-28 sm:pb-24">
        <h1 className="font-display max-w-2xl text-5xl leading-[1.05] sm:text-7xl">
          Лаконичная одежда на каждый день
        </h1>
        <p className="mt-6 max-w-md text-sm text-ink-muted">{siteConfig.description}</p>
        <Link
          href="/catalog"
          className="mt-10 inline-block bg-accent px-8 py-3 text-sm text-accent-contrast transition-opacity hover:opacity-90"
        >
          Смотреть каталог
        </Link>
      </Container>

      <Container className="border-t border-line pt-10">
        <CategoryFilter categories={categories} />
      </Container>

      <Container className="pt-14">
        <div className="mb-8 flex items-baseline justify-between gap-4">
          <h2 className="font-display text-2xl">Новое</h2>
          <Link href="/catalog" className="text-sm text-ink-muted transition-colors hover:text-ink">
            Весь каталог
          </Link>
        </div>

        <ProductGrid products={featuredProducts} />
      </Container>
    </>
  );
}
