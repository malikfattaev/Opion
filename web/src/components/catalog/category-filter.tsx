import Link from "next/link";

import type { Category } from "@/lib/catalog";

/**
 * Поиска на витрине нет, поэтому категории — основной способ сузить выдачу.
 * Ссылки, а не кнопки: состояние живёт в адресе страницы и переживает обновление.
 */
export function CategoryFilter({
  categories,
  activeSlug,
}: {
  categories: readonly Category[];
  activeSlug?: string;
}) {
  return (
    <nav aria-label="Категории" className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
      <ul className="flex gap-6 whitespace-nowrap">
        <li>
          <CategoryLink href="/catalog" isActive={activeSlug === undefined}>
            Все
          </CategoryLink>
        </li>
        {categories.map((category) => (
          <li key={category.slug}>
            <CategoryLink href={`/catalog/${category.slug}`} isActive={category.slug === activeSlug}>
              {category.name}
            </CategoryLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function CategoryLink({
  href,
  isActive,
  children,
}: {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`border-b pb-2 text-sm transition-colors ${
        isActive ? "border-accent text-ink" : "border-transparent text-ink-muted hover:text-ink"
      }`}
    >
      {children}
    </Link>
  );
}
