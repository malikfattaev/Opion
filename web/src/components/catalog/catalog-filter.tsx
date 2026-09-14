"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { CloseIcon } from "@/components/icons";
import type { ProductStyle, ProductType } from "@/lib/catalog";
import { countSelected, STYLE_PARAM, TYPE_PARAM, type CatalogFilters } from "@/lib/catalog/filters";

type FilterGroup = {
  key: keyof CatalogFilters;
  param: string;
  title: string;
  options: readonly { slug: string; name: string }[];
};

export function CatalogFilter({
  types,
  styles,
  filters,
}: {
  types: readonly ProductType[];
  styles: readonly ProductStyle[];
  filters: CatalogFilters;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedCount = countSelected(filters);

  const groups: readonly FilterGroup[] = [
    { key: "typeSlugs", param: TYPE_PARAM, title: "Тип", options: types },
    { key: "styleSlugs", param: STYLE_PARAM, title: "Стиль", options: styles },
  ];

  // Панель перекрывает товары, поэтому закрывается кликом мимо и по Esc.
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const apply = (next: CatalogFilters) => {
    const params = new URLSearchParams();

    for (const slug of next.typeSlugs) {
      params.append(TYPE_PARAM, slug);
    }
    for (const slug of next.styleSlugs) {
      params.append(STYLE_PARAM, slug);
    }

    const query = params.toString();

    // scroll: false — иначе страница прыгает наверх на каждом переключении.
    router.push(query ? `/?${query}` : "/", { scroll: false });
  };

  const toggleOption = (key: keyof CatalogFilters, slug: string) => {
    const selected = filters[key];

    apply({
      ...filters,
      [key]: selected.includes(slug) ? selected.filter((item) => item !== slug) : [...selected, slug],
    });
  };

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls="catalog-filter-panel"
        className="flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm transition-colors hover:border-ink-muted"
      >
        Фильтры
        {selectedCount > 0 ? (
          <span className="flex size-5 items-center justify-center rounded-full bg-accent text-xs text-accent-contrast">
            {selectedCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div
          id="catalog-filter-panel"
          className="absolute top-full left-0 z-40 mt-2 w-[min(22rem,calc(100vw-2.5rem))] rounded-3xl border border-line bg-surface p-6"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs tracking-widest text-ink-muted uppercase">Подбор</p>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Закрыть фильтры"
              className="-mr-2 p-2 text-ink-muted transition-colors hover:text-ink"
            >
              <CloseIcon className="size-4" />
            </button>
          </div>

          {groups.map((group) => (
            <fieldset key={group.param} className="mt-5">
              <legend className="text-sm text-ink-muted">{group.title}</legend>

              <div className="mt-3 flex flex-wrap gap-2">
                {group.options.map((option) => {
                  const isSelected = filters[group.key].includes(option.slug);

                  return (
                    <button
                      key={option.slug}
                      type="button"
                      onClick={() => toggleOption(group.key, option.slug)}
                      aria-pressed={isSelected}
                      className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                        isSelected
                          ? "border-accent bg-accent text-accent-contrast"
                          : "border-line text-ink-muted hover:border-ink-muted hover:text-ink"
                      }`}
                    >
                      {option.name}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}

          {selectedCount > 0 ? (
            <button
              type="button"
              onClick={() => apply({ typeSlugs: [], styleSlugs: [] })}
              className="mt-6 text-sm text-ink-muted underline underline-offset-4 transition-colors hover:text-ink"
            >
              Сбросить всё
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
