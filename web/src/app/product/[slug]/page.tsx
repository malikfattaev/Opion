import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { AddToCartForm } from "@/components/catalog/add-to-cart-form";
import { Container } from "@/components/layout/container";
import { getProductBySlug, getProducts } from "@/lib/catalog";
import { formatPrice } from "@/lib/money";

export async function generateStaticParams() {
  const products = await getProducts();

  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  return product ? { title: product.name, description: product.description } : {};
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const [cover] = product.images;
  const hasDiscount =
    product.compareAtPriceMinor !== undefined && product.compareAtPriceMinor > product.priceMinor;

  return (
    /**
     * На большом экране карточка занимает ровно один экран и не прокручивается:
     * 5rem это высота плавающей шапки. На узких экранах ограничение снимается,
     * иначе содержимое не поместится.
     */
    <Container className="py-6 lg:h-[calc(100svh-5rem)]">
      <div className="grid h-full gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="relative aspect-3/4 overflow-hidden bg-surface lg:aspect-auto lg:h-full">
          {cover ? (
            <Image
              src={cover.url}
              alt={cover.alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-xs tracking-widest text-ink-muted uppercase">Фото скоро</span>
            </div>
          )}
        </div>

        {/* justify-between разносит блоки по высоте картинки: описание сверху,
            размеры и кнопка внизу, вплотную друг к другу. */}
        <div className="flex h-full flex-col justify-between gap-10">
          <div>
            <h1 className="font-display text-4xl leading-tight xl:text-5xl">{product.name}</h1>

            <p className="mt-4 text-lg">
              {hasDiscount ? (
                <span className="mr-3 text-ink-muted line-through">{formatPrice(product.compareAtPriceMinor!)}</span>
              ) : null}
              <span>{formatPrice(product.priceMinor)}</span>
            </p>

            <p className="mt-6 max-w-md text-sm text-ink-muted">{product.description}</p>
          </div>

          <AddToCartForm product={product} />
        </div>
      </div>
    </Container>
  );
}
