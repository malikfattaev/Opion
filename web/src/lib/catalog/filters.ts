/**
 * Выбранные фильтры живут в адресе страницы, а не в состоянии компонента:
 * такую выдачу можно переслать ссылкой, она переживает обновление и «назад».
 */

export const TYPE_PARAM = "type";
export const STYLE_PARAM = "style";
export const PRICE_MIN_PARAM = "min";
export const PRICE_MAX_PARAM = "max";

export type CatalogSearchParams = Record<string, string | string[] | undefined>;

export type CatalogFilters = {
  typeSlugs: string[];
  styleSlugs: string[];
  /** Границы цены в сумах. null означает «без ограничения». */
  priceMin: number | null;
  priceMax: number | null;
};

export const EMPTY_FILTERS: CatalogFilters = {
  typeSlugs: [],
  styleSlugs: [],
  priceMin: null,
  priceMax: null,
};

export function parseFilters(searchParams: CatalogSearchParams): CatalogFilters {
  return {
    typeSlugs: toList(searchParams[TYPE_PARAM]),
    styleSlugs: toList(searchParams[STYLE_PARAM]),
    priceMin: toPrice(searchParams[PRICE_MIN_PARAM]),
    priceMax: toPrice(searchParams[PRICE_MAX_PARAM]),
  };
}

export function countSelected(filters: CatalogFilters): number {
  return (
    filters.typeSlugs.length +
    filters.styleSlugs.length +
    (filters.priceMin === null ? 0 : 1) +
    (filters.priceMax === null ? 0 : 1)
  );
}

export function buildQuery(filters: CatalogFilters): string {
  const params = new URLSearchParams();

  for (const slug of filters.typeSlugs) {
    params.append(TYPE_PARAM, slug);
  }
  for (const slug of filters.styleSlugs) {
    params.append(STYLE_PARAM, slug);
  }
  if (filters.priceMin !== null) {
    params.set(PRICE_MIN_PARAM, String(filters.priceMin));
  }
  if (filters.priceMax !== null) {
    params.set(PRICE_MAX_PARAM, String(filters.priceMax));
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

/** Цена приходит из адреса, то есть от кого угодно: мусор считаем отсутствием границы. */
function toPrice(value: string | string[] | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  const price = Number(raw);

  return raw !== undefined && raw !== "" && Number.isInteger(price) && price >= 0 ? price : null;
}
