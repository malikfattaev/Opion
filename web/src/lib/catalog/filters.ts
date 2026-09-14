/**
 * Выбранные фильтры живут в адресе страницы, а не в состоянии компонента:
 * такую выдачу можно переслать ссылкой, она переживает обновление и «назад».
 */

export const TYPE_PARAM = "type";
export const STYLE_PARAM = "style";

export type CatalogSearchParams = Record<string, string | string[] | undefined>;

export type CatalogFilters = {
  typeSlugs: string[];
  styleSlugs: string[];
};

export function parseFilters(searchParams: CatalogSearchParams): CatalogFilters {
  return {
    typeSlugs: toList(searchParams[TYPE_PARAM]),
    styleSlugs: toList(searchParams[STYLE_PARAM]),
  };
}

export function countSelected(filters: CatalogFilters): number {
  return filters.typeSlugs.length + filters.styleSlugs.length;
}

/** Один и тот же параметр может повторяться: ?type=hoodie&type=tee. */
function toList(value: string | string[] | undefined): string[] {
  if (value === undefined) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}
