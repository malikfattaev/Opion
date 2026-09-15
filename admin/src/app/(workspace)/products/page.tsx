import type { Metadata } from "next";
import Link from "next/link";

import { ProductRowActions } from "@/components/product-row-actions";
import { adminConfig } from "@/config/site";
import { listOptions, listProducts } from "@/lib/api/catalog";

export const metadata: Metadata = { title: "Товары" };

const priceFormatter = new Intl.NumberFormat(adminConfig.locale);

export default async function ProductsPage() {
  const [products, types, styles] = await Promise.all([
    listProducts(),
    listOptions("types"),
    listOptions("styles"),
  ]);

  // В списке показываем названия разделов, а не служебные адреса.
  const typeNames = new Map(types.map((type) => [type.slug, type.name]));
  const styleNames = new Map(styles.map((style) => [style.slug, style.name]));

  return (
    <>
      <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl leading-tight">Товары</h1>
          <p className="mt-3 max-w-xl text-sm text-ink-muted">
            Всё, что видят покупатели на сайте и в мини-аппе.
          </p>
        </div>

        <Link
          href="/products/new"
          className="rounded-full bg-accent px-6 py-2.5 text-sm text-accent-contrast transition-opacity hover:opacity-90"
        >
          Добавить вещь
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="py-16 text-center text-sm text-ink-muted">Каталог пуст. Добавьте первую вещь.</p>
      ) : (
        <ul className="mt-10 divide-y divide-line border-y border-line">
          {products.map((product) => (
            <li key={product.id} className="flex flex-wrap items-center gap-x-6 gap-y-2 py-4">
              <div className="min-w-48 flex-1">
                <Link href={`/products/${product.id}`} className="text-sm hover:underline underline-offset-4">
                  {product.name}
                </Link>
                <p className="mt-1 text-xs text-ink-muted">
                  {typeNames.get(product.typeSlug) ?? product.typeSlug}
                  {product.styleSlugs.length > 0
                    ? ` · ${product.styleSlugs.map((slug) => styleNames.get(slug) ?? slug).join(", ")}`
                    : ""}
                </p>
              </div>

              <p className="text-sm tabular-nums">
                {priceFormatter.format(product.price)} {adminConfig.currencyLabel}
              </p>

              <p className="w-28 text-xs text-ink-muted">
                {product.isPublished ? "на витрине" : "скрыта"}
              </p>

              <ProductRowActions id={product.id} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
