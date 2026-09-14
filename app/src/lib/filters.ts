/** Выбранные фильтры живут в адресе: возврат «назад» возвращает прежнюю выдачу. */
export const TYPE_PARAM = "type";
export const STYLE_PARAM = "style";
export const PAGE_PARAM = "page";

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

export function buildQuery(filters: CatalogFilters, page = 1): string {
  const params = new URLSearchParams();

  for (const slug of filters.typeSlugs) {
    params.append(TYPE_PARAM, slug);
  }
  for (const slug of filters.styleSlugs) {
    params.append(STYLE_PARAM, slug);
  }
  // Первую страницу в адресе не показываем: она и так открывается по умолчанию.
  if (page > 1) {
    params.set(PAGE_PARAM, String(page));
  }

  return params.toString();
}

/** Номер страницы из адреса. Мусор и отрицательные значения считаем первой страницей. */
export function parsePage(searchParams: Record<string, string | string[] | undefined>): number {
  const raw = searchParams[PAGE_PARAM];
  const page = Number(Array.isArray(raw) ? raw[0] : raw);

  return Number.isInteger(page) && page > 1 ? page : 1;
}

/** Один и тот же параметр может повторяться: ?type=hoodie&type=tee. */
function toList(value: string | string[] | undefined): string[] {
  if (value === undefined) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}
