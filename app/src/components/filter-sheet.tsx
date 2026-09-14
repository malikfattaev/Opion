"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { CloseIcon, SlidersIcon } from "@/components/icons";
import type { CatalogOption } from "@/lib/catalog";
import { buildQuery, countSelected, type CatalogFilters } from "@/lib/filters";
import { haptic } from "@/lib/telegram/use-telegram";

type Group = {
  key: keyof CatalogFilters;
  title: string;
  options: readonly CatalogOption[];
};

/**
 * Фильтры открываются шторкой снизу: на телефоне до неё дотягивается большой палец,
 * и она не отнимает место у витрины, пока закрыта.
 */
export function FilterSheet({
  types,
  styles,
  filters,
}: {
  types: readonly CatalogOption[];
  styles: readonly CatalogOption[];
  filters: CatalogFilters;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const selectedCount = countSelected(filters);

  const groups: readonly Group[] = [
    { key: "typeSlugs", title: "Тип", options: types },
    { key: "styleSlugs", title: "Стиль", options: styles },
  ];

  // Пока шторка открыта, витрина под ней прокручиваться не должна.
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  const apply = (next: CatalogFilters) => {
    const query = buildQuery(next);

    haptic();
    router.replace(query ? `/?${query}` : "/", { scroll: false });
  };

  const toggle = (key: keyof CatalogFilters, slug: string) => {
    const selected = filters[key];

    apply({
      ...filters,
      [key]: selected.includes(slug) ? selected.filter((item) => item !== slug) : [...selected, slug],
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          haptic();
          setIsOpen(true);
        }}
        className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm active:bg-surface"
      >
        <SlidersIcon className="size-4" />
        Фильтры
        {selectedCount > 0 ? (
          <span className="flex size-5 items-center justify-center rounded-full bg-accent text-xs text-accent-contrast">
            {selectedCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <button
            type="button"
            aria-label="Закрыть фильтры"
            onClick={() => setIsOpen(false)}
            className="flex-1 bg-black/60"
          />

          <div className="rounded-t-3xl border-t border-line bg-surface px-5 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-between">
              <p className="text-xs tracking-widest text-ink-muted uppercase">Подбор</p>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Закрыть"
                className="-mr-2 p-2 text-ink-muted"
              >
                <CloseIcon className="size-4" />
              </button>
            </div>

            {groups.map((group) => (
              <fieldset key={group.key} className="mt-5">
                <legend className="text-sm text-ink-muted">{group.title}</legend>

                <div className="mt-3 flex flex-wrap gap-2">
                  {group.options.map((option) => {
                    const isSelected = filters[group.key].includes(option.slug);

                    return (
                      <button
                        key={option.slug}
                        type="button"
                        onClick={() => toggle(group.key, option.slug)}
                        aria-pressed={isSelected}
                        className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                          isSelected
                            ? "border-accent bg-accent text-accent-contrast"
                            : "border-line text-ink-muted"
                        }`}
                      >
                        {option.name}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}

            <div className="mt-6 flex gap-3">
              {selectedCount > 0 ? (
                <button
                  type="button"
                  onClick={() => apply({ typeSlugs: [], styleSlugs: [] })}
                  className="flex-1 rounded-full border border-line py-3 text-sm"
                >
                  Сбросить
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 rounded-full bg-accent py-3 text-sm text-accent-contrast"
              >
                Показать
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
