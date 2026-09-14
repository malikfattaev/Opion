import Image from "next/image";
import Link from "next/link";

import type { Product } from "@/lib/catalog";
import { formatPrice } from "@/lib/money";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const [cover] = product.images;
  const hasDiscount = product.compareAtPrice !== undefined && product.compareAtPrice > product.price;

  return (
    <Link href={`/product/${product.slug}`} className="block transition-opacity active:opacity-60">
      <div className="relative aspect-4/5 overflow-hidden rounded-xl bg-surface">
        {cover ? (
          <Image src={cover.url} alt={cover.alt} fill sizes="50vw" className="object-cover" priority={priority} />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-[0.5625rem] tracking-widest text-ink-muted uppercase">Фото скоро</span>
          </div>
        )}

        {hasDiscount ? (
          <span className="absolute top-1.5 left-1.5 rounded-full bg-accent px-1.5 py-0.5 text-[0.5625rem] text-accent-contrast">
            Скидка
          </span>
        ) : null}
      </div>

      <p className="mt-1.5 line-clamp-1 text-xs leading-snug">{product.name}</p>
      <p className="mt-0.5 text-xs tabular-nums">
        {hasDiscount ? (
          <span className="mr-1.5 text-ink-muted line-through">{formatPrice(product.compareAtPrice!)}</span>
        ) : null}
        {formatPrice(product.price)}
      </p>
    </Link>
  );
}
