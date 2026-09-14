import Image from "next/image";
import Link from "next/link";

import type { Product } from "@/lib/catalog";
import { formatPrice } from "@/lib/money";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const [cover] = product.images;
  const hasDiscount = product.compareAtPrice !== undefined && product.compareAtPrice > product.price;

  return (
    <Link href={`/product/${product.slug}`} className="block active:opacity-70">
      <div className="relative aspect-3/4 overflow-hidden rounded-2xl bg-surface">
        {cover ? (
          <Image src={cover.url} alt={cover.alt} fill sizes="50vw" className="object-cover" priority={priority} />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-[0.625rem] tracking-widest text-ink-muted uppercase">Фото скоро</span>
          </div>
        )}

        {hasDiscount ? (
          <span className="absolute top-2 left-2 rounded-full bg-accent px-2 py-0.5 text-[0.625rem] text-accent-contrast">
            Скидка
          </span>
        ) : null}
      </div>

      <p className="mt-2 text-sm leading-snug">{product.name}</p>
      <p className="mt-0.5 text-sm">
        {hasDiscount ? (
          <span className="mr-2 text-ink-muted line-through">{formatPrice(product.compareAtPrice!)}</span>
        ) : null}
        {formatPrice(product.price)}
      </p>
    </Link>
  );
}
