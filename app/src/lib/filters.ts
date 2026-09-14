/** Выбранные фильтры живут в адресе: возврат «назад» возвращает прежнюю выдачу. */
export const TYPE_PARAM = "type";
export const STYLE_PARAM = "style";

export type CatalogFilters = {
  typeSlugs: string[];
  styleSlugs: string[];
};

export function parseFilters(searchParams: Record<string, string | string[] | undefined>): CatalogFilters {
  return {
    typeSlugs: toList(searchParams[TYPE_PARAM]),
    styleSlugs: toList(searchParams[STYLE_PARAM]),
  };
}

export function countSelected(filters: CatalogFilters): number {
  return filters.typeSlugs.length + filters.styleSlugs.length;
}

export function buildQuery(filters: CatalogFilters): string {
  const params = new URLSearchParams();

  for (const slug of filters.typeSlugs) {
    params.append(TYPE_PARAM, slug);
  }
  for (const slug of filters.styleSlugs) {
    params.append(STYLE_PARAM, slug);
  }

  return params.toString();
}

/** Один и тот же параметр может повторяться: ?type=hoodie&type=tee. */
function toList(value: string | string[] | undefined): string[] {
  if (value === undefined) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}
