import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { getProductBySlug, getProducts, getProductTypeBySlug } from "@/lib/catalog";
import { TYPE_PARAM } from "@/lib/catalog/filters";
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

  const type = await getProductTypeBySlug(product.typeSlug);
  const hasDiscount =
    product.compareAtPriceMinor !== undefined && product.compareAtPriceMinor > product.priceMinor;

  return (
    <Container className="grid gap-12 py-14 lg:grid-cols-2 lg:gap-16">
      <div className="grid gap-3">
        {product.images.length > 0 ? (
          product.images.map((image) => (
            <div key={image.url} className="relative aspect-3/4 overflow-hidden bg-surface">
              <Image
                src={image.url}
                alt={image.alt}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
                priority
              />
            </div>
          ))
        ) : (
          <div className="flex aspect-3/4 items-center justify-center bg-surface">
            <span className="text-xs tracking-widest text-ink-muted uppercase">Фото скоро</span>
          </div>
        )}
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        {type ? (
          <Link
            href={`/?${TYPE_PARAM}=${type.slug}`}
            className="text-xs tracking-widest text-ink-muted uppercase transition-colors hover:text-ink"
          >
            {type.name}
          </Link>
        ) : null}

        <h1 className="font-display mt-3 text-4xl leading-tight">{product.name}</h1>

        <p className="mt-4 text-lg">
          {hasDiscount ? (
            <span className="mr-3 text-ink-muted line-through">{formatPrice(product.compareAtPriceMinor!)}</span>
          ) : null}
          <span>{formatPrice(product.priceMinor)}</span>
        </p>

        <p className="mt-6 text-sm text-ink-muted">{product.description}</p>

        <Specification title="Размеры" values={product.sizes} />
        <Specification title="Цвета" values={product.colors} />

        <button
          type="button"
          disabled
          className="mt-10 w-full bg-accent py-3 text-sm text-accent-contrast disabled:opacity-40"
        >
          В корзину
        </button>
        <p className="mt-3 text-xs text-ink-muted">Оформление заказа заработает вместе с корзиной.</p>
      </div>
    </Container>
  );
}

function Specification({ title, values }: { title: string; values: readonly string[] }) {
  if (values.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-xs tracking-widest text-ink-muted uppercase">{title}</h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {values.map((value) => (
          <li key={value} className="border border-line px-3 py-1.5 text-sm">
            {value}
          </li>
        ))}
      </ul>
    </div>
  );
}
