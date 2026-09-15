import "server-only";

import { db } from "@/lib/db";

import type { OptionCreate } from "./schema";

/**
 * Типы и стили устроены одинаково: slug, название и порядок в фильтре.
 * Логика у них общая, различается только таблица.
 */

export type OptionKind = "type" | "style";

export type AdminOption = {
  id: string;
  slug: string;
  name: string;
  position: number;
  /** Сколько вещей ссылается: показываем в списке и не даём удалить занятое. */
  productCount: number;
};

const SELECTION = {
  id: true,
  slug: true,
  name: true,
  position: true,
  _count: { select: { products: true } },
} as const;

const ORDER = [{ position: "asc" }, { name: "asc" }] as const;

export async function listOptions(kind: OptionKind): Promise<AdminOption[]> {
  const rows =
    kind === "type"
      ? await db.productType.findMany({ orderBy: [...ORDER], select: SELECTION })
      : await db.style.findMany({ orderBy: [...ORDER], select: SELECTION });

  return rows.map(toAdminOption);
}

export async function createOption(kind: OptionKind, input: OptionCreate): Promise<AdminOption> {
  const data = { slug: input.slug, name: input.name, position: input.position ?? (await nextPosition(kind)) };

  const row =
    kind === "type"
      ? await db.productType.create({ data, select: SELECTION })
      : await db.style.create({ data, select: SELECTION });

  return toAdminOption(row);
}

export async function updateOption(
  kind: OptionKind,
  id: string,
  input: Partial<OptionCreate>,
): Promise<AdminOption | null> {
  const data = {
    ...(input.slug === undefined ? {} : { slug: input.slug }),
    ...(input.name === undefined ? {} : { name: input.name }),
    ...(input.position === undefined ? {} : { position: input.position }),
  };

  const row =
    kind === "type"
      ? await db.productType.update({ where: { id }, data, select: SELECTION }).catch(toNull)
      : await db.style.update({ where: { id }, data, select: SELECTION }).catch(toNull);

  return row ? toAdminOption(row) : null;
}

export async function deleteOption(kind: OptionKind, id: string): Promise<boolean> {
  const deleted =
    kind === "type"
      ? await db.productType.delete({ where: { id }, select: { id: true } }).catch(toNull)
      : await db.style.delete({ where: { id }, select: { id: true } }).catch(toNull);

  return deleted !== null;
}

/** Новая запись встаёт в конец списка, чтобы не перетасовывать существующие. */
async function nextPosition(kind: OptionKind): Promise<number> {
  const last =
    kind === "type"
      ? await db.productType.findFirst({ orderBy: { position: "desc" }, select: { position: true } })
      : await db.style.findFirst({ orderBy: { position: "desc" }, select: { position: true } });

  return last === null ? 0 : last.position + 1;
}

type OptionRow = { id: string; slug: string; name: string; position: number; _count: { products: number } };

function toAdminOption(row: OptionRow): AdminOption {
  return { id: row.id, slug: row.slug, name: row.name, position: row.position, productCount: row._count.products };
}

/**
 * Prisma бросает на отсутствующей записи, а для маршрута это просто 404.
 * Остальные ошибки пробрасываются: их разбирает вызывающий код.
 */
function toNull(error: unknown): null {
  if (typeof error === "object" && error !== null && (error as { code?: string }).code === "P2025") {
    return null;
  }

  throw error;
}
