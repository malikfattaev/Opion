import "server-only";

import { db } from "@/lib/db";

import type { Product, ProductStyle, ProductType } from "./types";

/**
 * Единственная дверь в каталог. За ней PostgreSQL: содержимое ведут из админки,
 * а сайт и мини-апп получают уже готовый срез витрины.
 */

export type ProductQuery = {
  /** Пустой список означает «не фильтровать», а не «ничего не показывать». */
  typeSlugs?: readonly string[];
  styleSlugs?: readonly string[];
  limit?: number;
  /** Админке нужны и снятые с витрины вещи, покупателям - только опубликованные. */
  includeUnpublished?: boolean;
};

const PRODUCT_SELECTION = {
  slug: true,
  name: true,
  description: true,
  price: true,
  comparePrice: true,
  sizes: true,
  type: { select: { slug: true } },
  styles: { select: { style: { select: { slug: true } } } },
  images: { select: { url: true, alt: true }, orderBy: { position: "asc" } },
} as const;

type ProductRow = {
  slug: string;
  name: string;
  description: string;
  price: number;
  comparePrice: number | null;
  sizes: string[];
  type: { slug: string };
  styles: { style: { slug: string } }[];
  images: { url: string; alt: string }[];
};

export async function getProductTypes(): Promise<ProductType[]> {
  return db.productType.findMany({
    orderBy: [{ position: "asc" }, { name: "asc" }],
    select: { slug: true, name: true },
  });
}

export async function getProductStyles(): Promise<ProductStyle[]> {
  return db.style.findMany({
    orderBy: [{ position: "asc" }, { name: "asc" }],
    select: { slug: true, name: true },
  });
}

export async function getProductTypeBySlug(slug: string): Promise<ProductType | null> {
  return db.productType.findUnique({ where: { slug }, select: { slug: true, name: true } });
}

export async function getProducts({
  typeSlugs = [],
  styleSlugs = [],
  limit,
  includeUnpublished = false,
}: ProductQuery = {}): Promise<Product[]> {
  const rows = await db.product.findMany({
    where: {
      ...(includeUnpublished ? {} : { isPublished: true }),
      ...(typeSlugs.length === 0 ? {} : { type: { slug: { in: [...typeSlugs] } } }),
      ...(styleSlugs.length === 0 ? {} : { styles: { some: { style: { slug: { in: [...styleSlugs] } } } } }),
    },
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    take: limit,
    select: PRODUCT_SELECTION,
  });

  return rows.map(toProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const row = await db.product.findFirst({
    where: { slug, isPublished: true },
    select: PRODUCT_SELECTION,
  });

  return row ? toProduct(row) : null;
}

/** Внутренняя форма записи отличается от публичной: разворачиваем связи в slug'и. */
function toProduct(row: ProductRow): Product {
  return {
    slug: row.slug,
    name: row.name,
    description: row.description,
    typeSlug: row.type.slug,
    styleSlugs: row.styles.map(({ style }) => style.slug),
    price: row.price,
    ...(row.comparePrice === null ? {} : { compareAtPrice: row.comparePrice }),
    sizes: row.sizes,
    images: row.images,
  };
}

export type { Product, ProductStyle, ProductType } from "./types";
