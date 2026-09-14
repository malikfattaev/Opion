import { placeholderProducts, placeholderStyles, placeholderTypes } from "./placeholder-data";
import type { Product, ProductStyle, ProductType } from "./types";

/**
 * Единственная дверь в каталог. Сейчас за ней временные данные, дальше будут
 * запросы к PostgreSQL через Prisma. Функции асинхронные именно поэтому:
 * при переходе на базу вызывающий код менять не придётся.
 */

export type ProductQuery = {
  /** Пустой список означает «не фильтровать», а не «ничего не показывать». */
  typeSlugs?: readonly string[];
  styleSlugs?: readonly string[];
  limit?: number;
};

export async function getProductTypes(): Promise<ProductType[]> {
  return [...placeholderTypes];
}

export async function getProductStyles(): Promise<ProductStyle[]> {
  return [...placeholderStyles];
}

export async function getProductTypeBySlug(slug: string): Promise<ProductType | null> {
  return placeholderTypes.find((type) => type.slug === slug) ?? null;
}

export async function getProducts({ typeSlugs = [], styleSlugs = [], limit }: ProductQuery = {}): Promise<Product[]> {
  const products = placeholderProducts.filter(
    (product) =>
      (typeSlugs.length === 0 || typeSlugs.includes(product.typeSlug)) &&
      (styleSlugs.length === 0 || product.styleSlugs.some((slug) => styleSlugs.includes(slug))),
  );

  return limit === undefined ? products : products.slice(0, limit);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return placeholderProducts.find((product) => product.slug === slug) ?? null;
}

export type { Product, ProductStyle, ProductType } from "./types";
