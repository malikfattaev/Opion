import { z } from "zod";

import { apiUrl } from "@/lib/env";

/** Каталог живёт в сервисе API. Сайт только читает его и своей копии не держит. */

const optionSchema = z.object({ slug: z.string(), name: z.string() });

const productSchema = z.object({
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  typeSlug: z.string(),
  styleSlugs: z.array(z.string()),
  price: z.number(),
  compareAtPrice: z.number().optional(),
  sizes: z.array(z.string()),
  images: z.array(z.object({ url: z.string(), alt: z.string() })),
});

const catalogSchema = z.object({
  types: z.array(optionSchema),
  styles: z.array(optionSchema),
  products: z.array(productSchema),
});

export type ProductType = z.infer<typeof optionSchema>;
export type ProductStyle = z.infer<typeof optionSchema>;
export type Product = z.infer<typeof productSchema>;
export type Catalog = z.infer<typeof catalogSchema>;

const EMPTY_CATALOG: Catalog = { types: [], styles: [], products: [] };

/**
 * Ответ кешируется на минуту: витрина открывается мгновенно, а правки в каталоге
 * долетают достаточно быстро. Недоступный API даёт пустую витрину, а не ошибку.
 */
export async function getCatalog(): Promise<Catalog> {
  try {
    const response = await fetch(`${apiUrl}/catalog`, { next: { revalidate: 60 } });

    if (!response.ok) {
      return EMPTY_CATALOG;
    }

    const parsed = catalogSchema.safeParse(await response.json());

    return parsed.success ? parsed.data : EMPTY_CATALOG;
  } catch {
    return EMPTY_CATALOG;
  }
}

export async function getProductTypes(): Promise<ProductType[]> {
  return (await getCatalog()).types;
}

export async function getProductStyles(): Promise<ProductStyle[]> {
  return (await getCatalog()).styles;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { products } = await getCatalog();

  return products.find((product) => product.slug === slug) ?? null;
}

export async function getProducts({
  typeSlugs = [],
  styleSlugs = [],
}: { typeSlugs?: readonly string[]; styleSlugs?: readonly string[] } = {}): Promise<Product[]> {
  const { products } = await getCatalog();

  return products.filter(
    (product) =>
      (typeSlugs.length === 0 || typeSlugs.includes(product.typeSlug)) &&
      (styleSlugs.length === 0 || product.styleSlugs.some((slug) => styleSlugs.includes(slug))),
  );
}
