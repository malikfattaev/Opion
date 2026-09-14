"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { CloseIcon, SlidersIcon } from "@/components/icons";
import { appConfig } from "@/config/site";
import type { CatalogOption } from "@/lib/catalog";
import { buildQuery, countSelected, EMPTY_FILTERS, type CatalogFilters } from "@/lib/filters";
import { haptic } from "@/lib/telegram/use-telegram";

type OptionGroup = {
  key: "typeSlugs" | "styleSlugs";
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

  const groups: readonly OptionGroup[] = [
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

  const toggle = (key: OptionGroup["key"], slug: string) => {
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

          <div className="rounded-t-3xl border-t border-line bg-surface px-5 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Закрыть"
              className="-mr-2 ml-auto block p-2 text-ink-muted"
            >
              <CloseIcon className="size-4" />
            </button>

            {groups.map((group) => (
              <fieldset key={group.key} className="mt-2">
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

            <PriceRange filters={filters} onApply={apply} />

            <div className="mt-6 flex gap-3">
              {selectedCount > 0 ? (
                <button
                  type="button"
                  onClick={() => apply(EMPTY_FILTERS)}
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

/**
 * Цена набирается вручную, поэтому применяется не на каждое нажатие клавиши,
 * а когда человек закончил: по Enter или уходу из поля.
 */
function PriceRange({
  filters,
  onApply,
}: {
  filters: CatalogFilters;
  onApply: (next: CatalogFilters) => void;
}) {
  const commit = (key: "priceMin" | "priceMax", raw: string) => {
    const next = toPrice(raw);

    if (next !== filters[key]) {
      onApply({ ...filters, [key]: next });
    }
  };

  return (
    <fieldset className="mt-5">
      <legend className="text-sm text-ink-muted">Цена, {appConfig.currencyLabel}</legend>

      <div className="mt-3 flex items-center gap-2">
        <PriceInput label="Цена от" value={filters.priceMin} placeholder="от" onCommit={(raw) => commit("priceMin", raw)} />
        <span aria-hidden className="text-ink-muted">
          –
        </span>
        <PriceInput label="Цена до" value={filters.priceMax} placeholder="до" onCommit={(raw) => commit("priceMax", raw)} />
      </div>
    </fieldset>
  );
}

function PriceInput({
  label,
  value,
  placeholder,
  onCommit,
}: {
  label: string;
  value: number | null;
  placeholder: string;
  onCommit: (raw: string) => void;
}) {
  return (
    <input
      type="text"
      inputMode="numeric"
      aria-label={label}
      placeholder={placeholder}
      // key сбрасывает поле, когда фильтр поменяли снаружи: например кнопкой «Сбросить».
      key={value ?? ""}
      defaultValue={value ?? ""}
      onBlur={(event) => onCommit(event.currentTarget.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        }
      }}
      className="w-full min-w-0 rounded-full border border-line bg-transparent px-4 py-2 text-base tabular-nums placeholder:text-ink-muted focus:border-ink focus:outline-none"
    />
  );
}

/** Пустое поле и мусор означают «без ограничения». */
function toPrice(raw: string): number | null {
  const digits = raw.replace(/\D/g, "");

  return digits === "" ? null : Number(digits);
}
