import "server-only";

import { z } from "zod";

import { apiRead, apiRequest, type ApiResult } from "./client";

/** Формы ответов API. Совпадают с тем, что отдаёт сервис, и проверяются на входе. */

const optionSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  position: z.number(),
  productCount: z.number(),
});

const productSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  comparePrice: z.number().nullable(),
  sizes: z.array(z.string()),
  typeSlug: z.string(),
  styleSlugs: z.array(z.string()),
  images: z.array(z.object({ url: z.string(), alt: z.string() })),
  isPublished: z.boolean(),
  position: z.number(),
  createdAt: z.string(),
});

export type AdminOption = z.infer<typeof optionSchema>;
export type AdminProduct = z.infer<typeof productSchema>;

/** Тип и стиль устроены одинаково, различается только раздел API. */
export type OptionKind = "types" | "styles";

export const OPTION_TITLES: Record<OptionKind, { singular: string; plural: string }> = {
  types: { singular: "Тип", plural: "Типы" },
  styles: { singular: "Стиль", plural: "Стили" },
};

const optionsSchema = z.object({ options: z.array(optionSchema) });
const productsSchema = z.object({ products: z.array(productSchema) });
const productSingleSchema = z.object({ product: productSchema });
const emptySchema = z.undefined();

export async function listOptions(kind: OptionKind): Promise<AdminOption[]> {
  return (await apiRead(`/admin/${kind}`, optionsSchema)).options;
}

export async function listProducts(): Promise<AdminProduct[]> {
  return (await apiRead("/admin/products", productsSchema)).products;
}

export async function findProduct(id: string): Promise<AdminProduct | null> {
  const result = await apiRequest(`/admin/products/${id}`, productSingleSchema, {});

  return result.ok ? result.data.product : null;
}

export type OptionInput = { slug: string; name: string };

export async function createOption(kind: OptionKind, input: OptionInput): Promise<ApiResult<unknown>> {
  return apiRequest(`/admin/${kind}`, z.unknown(), { method: "POST", body: input });
}

export async function updateOption(
  kind: OptionKind,
  id: string,
  input: Partial<OptionInput>,
): Promise<ApiResult<unknown>> {
  return apiRequest(`/admin/${kind}/${id}`, z.unknown(), { method: "PATCH", body: input });
}

export async function deleteOption(kind: OptionKind, id: string): Promise<ApiResult<undefined>> {
  return apiRequest(`/admin/${kind}/${id}`, emptySchema, { method: "DELETE" });
}

export type ProductInput = {
  slug: string;
  name: string;
  description: string;
  price: number;
  comparePrice: number | null;
  typeSlug: string;
  styleSlugs: string[];
  sizes: string[];
  images: { url: string; alt: string }[];
  isPublished: boolean;
};

export async function createProduct(input: ProductInput): Promise<ApiResult<unknown>> {
  return apiRequest("/admin/products", z.unknown(), { method: "POST", body: input });
}

export async function updateProduct(id: string, input: ProductInput): Promise<ApiResult<unknown>> {
  return apiRequest(`/admin/products/${id}`, z.unknown(), { method: "PATCH", body: input });
}

export async function deleteProduct(id: string): Promise<ApiResult<undefined>> {
  return apiRequest(`/admin/products/${id}`, emptySchema, { method: "DELETE" });
}
