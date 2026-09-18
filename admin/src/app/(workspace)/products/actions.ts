"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createProduct, deleteProduct, updateProduct, uploadImage, type ProductInput } from "@/lib/api/catalog";

export type ProductFormState = { message: string | null };

/**
 * Сохранение вещи. Форма присылает плоские поля, здесь они собираются
 * в тот вид, который ждёт API: размеры и фото списками, цены числами.
 */
export async function saveProduct(_state: ProductFormState, formData: FormData): Promise<ProductFormState> {
  const id = readText(formData, "id");
  const price = readPrice(formData, "price");
  const comparePrice = readPrice(formData, "comparePrice");

  if (price.kind !== "number") {
    return { message: "Укажите цену числом." };
  }

  if (comparePrice.kind === "invalid") {
    return { message: "Старая цена должна быть числом." };
  }

  const sizes = readList(formData, "sizes");

  if (sizes.length === 0) {
    return { message: "Добавьте хотя бы один размер." };
  }

  const typeSlug = readText(formData, "typeSlug");

  if (!typeSlug) {
    return { message: "Выберите тип." };
  }

  const input: ProductInput = {
    slug: readText(formData, "slug"),
    sku: readText(formData, "sku"),
    name: readText(formData, "name"),
    description: readText(formData, "description"),
    price: price.value,
    comparePrice: comparePrice.kind === "number" ? comparePrice.value : null,
    typeSlug,
    styleSlugs: formData.getAll("styleSlugs").map(String),
    sizes,
    images: formData
      .getAll("images")
      .map(String)
      .filter(Boolean)
      .map((url) => ({ url, alt: readText(formData, "name") })),
    isPublished: formData.get("isPublished") === "on",
  };

  const result = id ? await updateProduct(id, input) : await createProduct(input);

  if (!result.ok) {
    return { message: result.message };
  }

  revalidatePath("/products");
  redirect("/products");
}

export type UploadResult = { ok: true; url: string } | { ok: false; message: string };

/** Фото уходит в API, а оттуда в бакет. Браузер к хранилищу не ходит. */
export async function uploadProductImage(formData: FormData): Promise<UploadResult> {
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Выберите файл." };
  }

  const result = await uploadImage(file);

  return result.ok ? { ok: true, url: result.data.url } : { ok: false, message: result.message };
}

export async function removeProduct(_state: ProductFormState, formData: FormData): Promise<ProductFormState> {
  const id = readText(formData, "id");

  if (!id) {
    return { message: "Нечего удалять." };
  }

  const result = await deleteProduct(id);

  if (!result.ok) {
    return { message: result.message };
  }

  revalidatePath("/products");

  return { message: null };
}

function readText(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

type Price = { kind: "empty" } | { kind: "invalid" } | { kind: "number"; value: number };

/** Пустое поле значит «цены нет», а опечатка должна стать ошибкой формы, а не нулём. */
function readPrice(formData: FormData, name: string): Price {
  const raw = readText(formData, name).replace(/\s/g, "");

  if (raw === "") {
    return { kind: "empty" };
  }

  const value = Number(raw);

  return Number.isInteger(value) && value >= 0 ? { kind: "number", value } : { kind: "invalid" };
}

/** Размеры вводятся по одному в строке. */
function readList(formData: FormData, name: string): string[] {
  return readText(formData, name)
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}
