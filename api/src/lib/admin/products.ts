import "server-only";

import { db } from "@/lib/db";
import { forgetProductImages } from "@/lib/storage/images";

import { uniqueViolationField } from "./respond";
import type { ProductCreate, ProductUpdate } from "./schema";

/** Вещь глазами админки: со связями, снятыми с витрины и служебными полями. */
export type AdminProduct = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  comparePrice: number | null;
  costPrice: number | null;
  sizes: string[];
  typeSlug: string;
  styleSlugs: string[];
  images: { url: string; alt: string }[];
  isPublished: boolean;
  position: number;
  createdAt: string;
};

const SELECTION = {
  id: true,
  slug: true,
  sku: true,
  name: true,
  description: true,
  price: true,
  comparePrice: true,
  costPrice: true,
  sizes: true,
  isPublished: true,
  position: true,
  createdAt: true,
  type: { select: { slug: true } },
  styles: { select: { style: { select: { slug: true } } } },
  images: { select: { url: true, alt: true }, orderBy: { position: "asc" } },
} as const;

/** Раздел не найден: вызывающий код превращает это в понятную ошибку формы. */
export class UnknownReferenceError extends Error {}

/** У вещи два уникальных поля, и человеку важно знать, какое из них занято. */
export function duplicateProductMessage(error: unknown): string | null {
  switch (uniqueViolationField(error)) {
    case "sku":
      return "Такой артикул уже есть у другой вещи.";
    case "slug":
      return "Такой адрес уже занят.";
    default:
      return null;
  }
}

export async function listProducts(): Promise<AdminProduct[]> {
  const rows = await db.product.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    select: SELECTION,
  });

  return rows.map(toAdminProduct);
}

export async function findProduct(id: string): Promise<AdminProduct | null> {
  const row = await db.product.findUnique({ where: { id }, select: SELECTION });

  return row ? toAdminProduct(row) : null;
}

export async function createProduct(input: ProductCreate): Promise<AdminProduct> {
  const typeId = await resolveTypeId(input.typeSlug);
  const styleIds = await resolveStyleIds(input.styleSlugs);

  const row = await db.product.create({
    data: {
      slug: input.slug,
      sku: input.sku,
      name: input.name,
      description: input.description,
      price: input.price,
      comparePrice: input.comparePrice ?? null,
      costPrice: input.costPrice ?? null,
      sizes: input.sizes,
      isPublished: input.isPublished,
      position: input.position ?? (await nextPosition()),
      typeId,
      styles: { create: styleIds.map((styleId) => ({ styleId })) },
      images: { create: input.images.map((image, index) => ({ ...image, position: index })) },
    },
    select: SELECTION,
  });

  return toAdminProduct(row);
}

export async function updateProduct(id: string, input: ProductUpdate): Promise<AdminProduct | null> {
  const existing = await db.product.findUnique({ where: { id }, select: { id: true } });

  if (!existing) {
    return null;
  }

  const typeId = input.typeSlug === undefined ? undefined : await resolveTypeId(input.typeSlug);
  const styleIds = input.styleSlugs === undefined ? undefined : await resolveStyleIds(input.styleSlugs);

  // Стили и фото заменяются целиком: форма всегда присылает итоговый список,
  // и так не остаётся записей, про которые никто не помнит.
  const dropped = input.images === undefined ? [] : await droppedImages(id, input.images);

  const row = await db.product.update({
    where: { id },
    data: {
      ...(input.slug === undefined ? {} : { slug: input.slug }),
      ...(input.sku === undefined ? {} : { sku: input.sku }),
      ...(input.name === undefined ? {} : { name: input.name }),
      ...(input.description === undefined ? {} : { description: input.description }),
      ...(input.price === undefined ? {} : { price: input.price }),
      ...(input.comparePrice === undefined ? {} : { comparePrice: input.comparePrice ?? null }),
      ...(input.costPrice === undefined ? {} : { costPrice: input.costPrice ?? null }),
      ...(input.sizes === undefined ? {} : { sizes: input.sizes }),
      ...(input.isPublished === undefined ? {} : { isPublished: input.isPublished }),
      ...(input.position === undefined ? {} : { position: input.position }),
      ...(typeId === undefined ? {} : { typeId }),
      ...(styleIds === undefined
        ? {}
        : { styles: { deleteMany: {}, create: styleIds.map((styleId) => ({ styleId })) } }),
      ...(input.images === undefined
        ? {}
        : {
            images: {
              deleteMany: {},
              create: input.images.map((image, index) => ({ ...image, position: index })),
            },
          }),
    },
    select: SELECTION,
  });

  await forget(dropped);

  return toAdminProduct(row);
}

export async function deleteProduct(id: string): Promise<boolean> {
  const images = await db.productImage.findMany({ where: { productId: id }, select: { url: true } });
  const { count } = await db.product.deleteMany({ where: { id } });

  if (count === 0) {
    return false;
  }

  await forget(images.map(({ url }) => url));

  return true;
}

/** Какие файлы карточка перестала показывать после правки. */
async function droppedImages(id: string, next: readonly { url: string }[]): Promise<string[]> {
  const current = await db.productImage.findMany({ where: { productId: id }, select: { url: true } });
  const kept = new Set(next.map((image) => image.url));

  return current.map(({ url }) => url).filter((url) => !kept.has(url));
}

/**
 * Уборка в хранилище идёт после записи в базу и не должна её ронять:
 * забытый файл - это копейки за хранение, а упавшее сохранение - потерянная правка.
 */
async function forget(urls: readonly string[]): Promise<void> {
  try {
    await forgetProductImages(urls);
  } catch (error) {
    console.error("Админка: не удалось убрать файлы из хранилища", error);
  }
}

async function resolveTypeId(slug: string): Promise<string> {
  const type = await db.productType.findUnique({ where: { slug }, select: { id: true } });

  if (!type) {
    throw new UnknownReferenceError("Такого типа нет.");
  }

  return type.id;
}

async function resolveStyleIds(slugs: readonly string[]): Promise<string[]> {
  if (slugs.length === 0) {
    return [];
  }

  const styles = await db.style.findMany({ where: { slug: { in: [...slugs] } }, select: { id: true } });

  if (styles.length !== new Set(slugs).size) {
    throw new UnknownReferenceError("Какого-то из выбранных стилей нет.");
  }

  return styles.map(({ id }) => id);
}

async function nextPosition(): Promise<number> {
  const last = await db.product.findFirst({ orderBy: { position: "desc" }, select: { position: true } });

  return last === null ? 0 : last.position + 1;
}

type ProductRow = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  comparePrice: number | null;
  costPrice: number | null;
  sizes: string[];
  isPublished: boolean;
  position: number;
  createdAt: Date;
  type: { slug: string };
  styles: { style: { slug: string } }[];
  images: { url: string; alt: string }[];
};

function toAdminProduct(row: ProductRow): AdminProduct {
  return {
    id: row.id,
    slug: row.slug,
    sku: row.sku,
    name: row.name,
    description: row.description,
    price: row.price,
    comparePrice: row.comparePrice,
    costPrice: row.costPrice,
    sizes: row.sizes,
    typeSlug: row.type.slug,
    styleSlugs: row.styles.map(({ style }) => style.slug),
    images: row.images,
    isPublished: row.isPublished,
    position: row.position,
    createdAt: row.createdAt.toISOString(),
  };
}
