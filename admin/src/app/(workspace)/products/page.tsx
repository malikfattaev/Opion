import type { Metadata } from "next";
import Link from "next/link";

import { PlusIcon } from "@/components/icons";
import { ProductRowActions } from "@/components/product-row-actions";
import { EmptyState, PageHeader } from "@/components/ui";
import { listOptions, listProducts, type AdminProduct } from "@/lib/api/catalog";
import { formatNumber, formatPrice } from "@/lib/money";

export const metadata: Metadata = { title: "Товары" };

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
      <PageHeader
        title="Товары"
        action={
          <Link
            href="/products/new"
            className="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm text-accent-contrast transition-opacity hover:opacity-90"
          >
            <PlusIcon className="size-4" />
            Добавить вещь
          </Link>
        }
      />

      {products.length === 0 ? (
        <EmptyState>Пока пусто.</EmptyState>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-2xl text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs tracking-widest whitespace-nowrap text-ink-muted uppercase">
                <th scope="col" className="w-2/5 px-4 py-3 font-normal">
                  Вещь
                </th>
                <th scope="col" className="px-4 py-3 font-normal">
                  Артикул
                </th>
                <th scope="col" className="px-4 py-3 font-normal">
                  Тип и стили
                </th>
                <th scope="col" className="px-4 py-3 text-right font-normal">
                  Цена
                </th>
                <th scope="col" className="px-4 py-3 font-normal">
                  Витрина
                </th>
                <th scope="col" className="px-4 py-3">
                  <span className="sr-only">Действия</span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-line">
              {products.map((product) => (
                <tr key={product.id} className="align-middle transition-colors hover:bg-surface/50">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-4">
                      <Thumbnail product={product} />

                      <div className="min-w-0">
                        <Link
                          href={`/products/${product.id}`}
                          className="underline-offset-4 hover:underline"
                        >
                          {product.name}
                        </Link>
                        <p className="mt-1 text-xs text-ink-muted">{product.slug}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <span className="inline-block rounded-md border border-line px-2 py-1 font-mono text-xs whitespace-nowrap">
                      {product.sku}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <p>{typeNames.get(product.typeSlug) ?? product.typeSlug}</p>
                    <p className="mt-1 text-xs text-ink-muted">
                      {product.styleSlugs.length === 0
                        ? "без стиля"
                        : product.styleSlugs.map((slug) => styleNames.get(slug) ?? slug).join(", ")}
                    </p>
                  </td>

                  <td className="px-4 py-4 text-right whitespace-nowrap tabular-nums">
                    <p>{formatPrice(product.price)}</p>
                    {product.comparePrice === null ? null : (
                      <p className="mt-1 text-xs text-ink-muted line-through">
                        {formatNumber(product.comparePrice)}
                      </p>
                    )}
                  </td>

                  <td className="px-4 py-4">
                    <ShelfBadge isPublished={product.isPublished} />
                  </td>

                  <td className="py-4 pr-4 pl-2">
                    <ProductRowActions id={product.id} name={product.name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

/** Первое фото вещи. Пока его не загрузили, на месте карточки стоит пустая рамка. */
function Thumbnail({ product }: { product: AdminProduct }) {
  const image = product.images[0];

  return image ? (
    // eslint-disable-next-line @next/next/no-img-element -- фото лежат на чужих доменах, оптимизатор их не обслуживает
    <img
      src={image.url}
      alt=""
      className="size-12 shrink-0 rounded-lg border border-line object-cover"
    />
  ) : (
    <span
      aria-hidden
      className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-xs text-ink-muted"
    >
      нет
    </span>
  );
}

function ShelfBadge({ isPublished }: { isPublished: boolean }) {
  return (
    <span className="flex items-center gap-2 text-xs whitespace-nowrap text-ink-muted">
      <span
        aria-hidden
        className={`size-1.5 rounded-full ${isPublished ? "bg-success" : "bg-ink-muted/50"}`}
      />
      {isPublished ? "на витрине" : "скрыта"}
    </span>
  );
}
