import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CategoryFilter } from "@/components/catalog/category-filter";
import { ProductGrid } from "@/components/catalog/product-grid";
import { Container } from "@/components/layout/container";
import { getCategories, getCategoryBySlug, getProducts } from "@/lib/catalog";

export async function generateStaticParams() {
  const categories = await getCategories();

  return categories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: PageProps<"/catalog/[category]">): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);

  return category ? { title: category.name, description: category.description } : {};
}

export default async function CategoryPage({ params }: PageProps<"/catalog/[category]">) {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const [categories, products] = await Promise.all([getCategories(), getProducts({ categorySlug: slug })]);

  return (
    <>
      <h1 className="sr-only">{category.name}</h1>

      <Container className="pb-10">
        <CategoryFilter categories={categories} activeSlug={slug} />
      </Container>

      <Container>
        <ProductGrid products={products} />
      </Container>
    </>
  );
}
