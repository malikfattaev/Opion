import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { AddToCart } from "@/components/add-to-cart";
import { getProduct } from "@/lib/catalog";
import { formatPrice } from "@/lib/money";

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  return product ? { title: product.name } : {};
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const [cover] = product.images;
  const hasDiscount = product.compareAtPrice !== undefined && product.compareAtPrice > product.price;

  return (
    <div className="flex min-h-full flex-col px-5">
      <div className="relative aspect-3/4 overflow-hidden rounded-2xl bg-surface">
        {cover ? (
          <Image src={cover.url} alt={cover.alt} fill sizes="100vw" className="object-cover" priority />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-xs tracking-widest text-ink-muted uppercase">Фото скоро</span>
          </div>
        )}
      </div>

      <h1 className="font-display mt-5 text-3xl leading-tight">{product.name}</h1>

      <p className="mt-2 text-lg">
        {hasDiscount ? (
          <span className="mr-2 text-ink-muted line-through">{formatPrice(product.compareAtPrice!)}</span>
        ) : null}
        {formatPrice(product.price)}
      </p>

      <p className="mt-4 text-sm text-ink-muted">{product.description}</p>

      <div className="mt-auto">
        <AddToCart product={product} />
      </div>
    </div>
  );
}
