import { z } from "zod";

import { apiUrl } from "@/lib/env";

/** Каталог живёт на сайте: мини-апп только читает его, своей копии не держит. */

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

const optionSchema = z.object({ slug: z.string(), name: z.string() });

const catalogSchema = z.object({
  types: z.array(optionSchema),
  styles: z.array(optionSchema),
  products: z.array(productSchema),
});

export type Product = z.infer<typeof productSchema>;
export type CatalogOption = z.infer<typeof optionSchema>;
export type Catalog = z.infer<typeof catalogSchema>;

const EMPTY_CATALOG: Catalog = { types: [], styles: [], products: [] };

/**
 * Ответ кешируется на минуту: витрина открывается мгновенно, а правки в каталоге
 * долетают достаточно быстро.
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
    // Сайт может быть недоступен: лучше пустая витрина, чем экран ошибки.
    return EMPTY_CATALOG;
  }
}

export async function getProduct(slug: string): Promise<Product | null> {
  const { products } = await getCatalog();

  return products.find((product) => product.slug === slug) ?? null;
}

export function filterProducts(
  products: readonly Product[],
  { typeSlugs = [], styleSlugs = [] }: { typeSlugs?: readonly string[]; styleSlugs?: readonly string[] },
): Product[] {
  return products.filter(
    (product) =>
      (typeSlugs.length === 0 || typeSlugs.includes(product.typeSlug)) &&
      (styleSlugs.length === 0 || product.styleSlugs.some((slug) => styleSlugs.includes(slug))),
  );
}
