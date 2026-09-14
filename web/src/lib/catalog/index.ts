import { placeholderCategories, placeholderProducts } from "./placeholder-data";
import type { Category, Product } from "./types";

/**
 * Единственная дверь в каталог. Сейчас за ней временные данные, дальше —
 * запросы к PostgreSQL через Prisma. Функции асинхронные именно поэтому:
 * при переходе на базу вызывающий код менять не придётся.
 */

export async function getCategories(): Promise<Category[]> {
  return [...placeholderCategories];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return placeholderCategories.find((category) => category.slug === slug) ?? null;
}

export async function getProducts(options: { categorySlug?: string; limit?: number } = {}): Promise<Product[]> {
  const { categorySlug, limit } = options;

  const products = categorySlug
    ? placeholderProducts.filter((product) => product.categorySlug === categorySlug)
    : [...placeholderProducts];

  return limit === undefined ? products : products.slice(0, limit);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return placeholderProducts.find((product) => product.slug === slug) ?? null;
}

export type { Category, Product } from "./types";
