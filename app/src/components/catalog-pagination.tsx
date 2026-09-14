import Link from "next/link";

import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import { buildQuery, type CatalogFilters } from "@/lib/filters";

/** Листалка каталога: шесть вещей на страницу, дальше руками вперёд. */
export function CatalogPagination({
  filters,
  page,
  pageCount,
}: {
  filters: CatalogFilters;
  page: number;
  pageCount: number;
}) {
  if (pageCount <= 1) {
    return null;
  }

  return (
    <nav className="mt-6 flex items-center justify-center gap-4" aria-label="Страницы каталога">
      <PageLink filters={filters} page={page - 1} isDisabled={page === 1} label="Предыдущая страница">
        <ChevronLeftIcon className="size-4" />
      </PageLink>

      <p className="text-xs tabular-nums text-ink-muted">
        {page} / {pageCount}
      </p>

      <PageLink filters={filters} page={page + 1} isDisabled={page === pageCount} label="Следующая страница">
        <ChevronRightIcon className="size-4" />
      </PageLink>
    </nav>
  );
}

function PageLink({
  filters,
  page,
  isDisabled,
  label,
  children,
}: {
  filters: CatalogFilters;
  page: number;
  isDisabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  const className = "flex size-10 items-center justify-center rounded-full border border-line";

  if (isDisabled) {
    return (
      <span aria-hidden className={`${className} text-ink-muted opacity-30`}>
        {children}
      </span>
    );
  }

  const query = buildQuery(filters, page);

  return (
    <Link href={query ? `/?${query}` : "/"} aria-label={label} className={`${className} active:bg-surface`}>
      {children}
    </Link>
  );
}
