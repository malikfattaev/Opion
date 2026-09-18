"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { SearchIcon } from "@/components/icons";
import { inputClassName, Select } from "@/components/ui";
import { mediaSorts, type MediaSort } from "@/config/site";

/** Поиск по имени файла и порядок галереи. Оба живут в адресе страницы. */
export function MediaFilters({ query, sort }: { query: string; sort: MediaSort }) {
  const router = useRouter();
  const [text, setText] = useState(query);

  // Ждём, пока перестанут печатать: иначе страница дёргается на каждой букве.
  useEffect(() => {
    if (text === query) {
      return;
    }

    const timer = setTimeout(() => router.replace(href(text, sort)), 400);

    return () => clearTimeout(timer);
  }, [text, query, sort, router]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-56 flex-1">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-muted" />

        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Поиск по названию"
          aria-label="Поиск по названию"
          className={`${inputClassName} pl-11`}
        />
      </div>

      <Select
        value={sort}
        aria-label="Порядок"
        onChange={(event) => router.replace(href(text, event.target.value as MediaSort))}
        className="w-48"
      >
        {mediaSorts.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );
}

function href(query: string, sort: MediaSort): string {
  const params = new URLSearchParams();

  if (query.trim()) {
    params.set("q", query.trim());
  }

  if (sort !== "new") {
    params.set("sort", sort);
  }

  const search = params.toString();

  return search ? `/media?${search}` : "/media";
}
