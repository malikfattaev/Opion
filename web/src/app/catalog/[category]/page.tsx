import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CategoryFilter } from "@/components/catalog/category-filter";
import { ProductGrid } from "@/components/catalog/product-grid";
import { Container } from "@/components/layout/container";
import { PageIntro } from "@/components/layout/page-intro";
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
      <PageIntro title={category.name} description={category.description} />

      <Container className="border-b border-line">
        <CategoryFilter categories={categories} activeSlug={slug} />
      </Container>

      <Container className="pt-12">
        <ProductGrid products={products} />
      </Container>
    </>
  );
}
