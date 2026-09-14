import Image from "next/image";
import Link from "next/link";

import type { Product } from "@/lib/catalog";
import { formatPrice } from "@/lib/money";

export function ProductCard({ product }: { product: Product }) {
  const [cover] = product.images;
  const hasDiscount =
    product.compareAtPriceMinor !== undefined && product.compareAtPriceMinor > product.priceMinor;

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-3/4 overflow-hidden bg-surface">
        {cover ? (
          <Image
            src={cover.url}
            alt={cover.alt}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <CoverPlaceholder />
        )}

        {hasDiscount ? (
          <span className="absolute top-3 left-3 bg-accent px-2 py-1 text-xs text-accent-contrast">Скидка</span>
        ) : null}
      </div>

      <div className="mt-3">
        <h3 className="text-sm text-ink">{product.name}</h3>

        <p className="mt-1 text-sm">
          {hasDiscount ? (
            <span className="mr-2 text-ink-muted line-through">{formatPrice(product.compareAtPriceMinor!)}</span>
          ) : null}
          <span className="text-ink">{formatPrice(product.priceMinor)}</span>
        </p>
      </div>
    </Link>
  );
}

/** Пока съёмки нет — вместо картинки ровный прямоугольник, а не битая иконка. */
function CoverPlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <span className="text-xs tracking-widest text-ink-muted uppercase">Фото скоро</span>
    </div>
  );
}
