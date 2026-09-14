import { ProductCard } from "@/components/catalog/product-card";
import type { Product } from "@/lib/catalog";

export function ProductGrid({ products }: { products: readonly Product[] }) {
  if (products.length === 0) {
    return <p className="py-16 text-sm text-ink-muted">В этом разделе пока пусто.</p>;
  }

  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <li key={product.slug}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
