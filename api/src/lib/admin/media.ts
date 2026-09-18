import "server-only";

import { db } from "@/lib/db";
import {
  forgetProductImages,
  storeProductImage,
  toImagePath,
  toPublicImageUrl,
  toStoredImageUrl,
} from "@/lib/storage/images";

/** Файл из раздела «Медиа» вместе с тем, сколько карточек им пользуется. */
export type MediaItem = {
  id: string;
  name: string;
  url: string;
  width: number | null;
  height: number | null;
  bytes: number | null;
  /** В скольких карточках товара стоит эта фотография. */
  usedBy: number;
  createdAt: string;
};

export type MediaLibrary = {
  items: MediaItem[];
  stats: { files: number; used: number; bytes: number };
};

/** Порядок в галерее. Больше вариантов не нужно: файлы ищут глазами. */
export const MEDIA_SORTS = ["new", "old", "large", "name"] as const;

export type MediaSort = (typeof MEDIA_SORTS)[number];

/** Дальше нескольких сотен файлов галерея становится бесполезной. */
const LIMIT = 300;

const ORDER: Record<MediaSort, Parameters<typeof db.mediaFile.findMany>[0]> = {
  new: { orderBy: { createdAt: "desc" } },
  old: { orderBy: { createdAt: "asc" } },
  large: { orderBy: { bytes: "desc" } },
  name: { orderBy: { name: "asc" } },
};

export function mediaSort(value: string | null): MediaSort {
  return MEDIA_SORTS.find((sort) => sort === value) ?? "new";
}

export async function listMedia(query: string, sort: MediaSort): Promise<MediaLibrary> {
  const where = query ? { name: { contains: query, mode: "insensitive" as const } } : {};

  const [rows, usage, totals] = await Promise.all([
    db.mediaFile.findMany({ where, take: LIMIT, ...ORDER[sort] }),
    readUsage(),
    db.mediaFile.aggregate({ _count: { _all: true }, _sum: { bytes: true } }),
  ]);

  return {
    items: rows.map((row) => ({
      id: row.id,
      name: row.name,
      url: toPublicImageUrl(row.path),
      width: row.width,
      height: row.height,
      bytes: row.bytes,
      usedBy: usage.get(row.path) ?? 0,
      createdAt: row.createdAt.toISOString(),
    })),
    stats: {
      files: totals._count._all,
      used: usage.size,
      bytes: totals._sum.bytes ?? 0,
    },
  };
}

/** Записывает загруженный файл в галерею и возвращает его карточку. */
export async function addMedia(file: File): Promise<MediaItem> {
  const stored = await storeProductImage(file);
  const path = toImagePath(stored.key);

  const row = await db.mediaFile.create({
    data: {
      path,
      name: mediaName(file.name),
      width: stored.width,
      height: stored.height,
      bytes: stored.bytes,
    },
  });

  return {
    id: row.id,
    name: row.name,
    url: toPublicImageUrl(row.path),
    width: row.width,
    height: row.height,
    bytes: row.bytes,
    usedBy: 0,
    createdAt: row.createdAt.toISOString(),
  };
}

export class MediaInUseError extends Error {}

/** Убирает файл из галереи и из хранилища. Занятый файл не трогаем. */
export async function removeMedia(id: string): Promise<boolean> {
  const row = await db.mediaFile.findUnique({ where: { id }, select: { path: true } });

  if (!row) {
    return false;
  }

  const usedBy = await db.productImage.count({ where: { url: { contains: row.path } } });

  if (usedBy > 0) {
    throw new MediaInUseError(
      usedBy === 1 ? "Фото стоит в карточке товара." : `Фото стоит в ${usedBy} карточках товаров.`,
    );
  }

  await db.mediaFile.delete({ where: { id } });
  await forgetProductImages([row.path]);

  return true;
}

/** Сколько карточек ссылается на каждый файл. Ключ - путь, как он лежит в базе. */
async function readUsage(): Promise<Map<string, number>> {
  const rows = await db.productImage.groupBy({ by: ["url"], _count: { _all: true } });

  return rows.reduce((usage, row) => {
    const path = toStoredImageUrl(row.url);

    return usage.set(path, (usage.get(path) ?? 0) + row._count._all);
  }, new Map<string, number>());
}

/** Имя файла после сжатия: расширение теперь всегда webp. */
function mediaName(original: string): string {
  const base = original.replace(/\.[^.]+$/, "").trim();

  return `${base === "" ? "фото" : base}.webp`;
}
