"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useCart } from "@/lib/cart/use-cart";
import type { Product } from "@/lib/catalog";

const CONFIRMATION_MS = 2000;

export function AddToCartForm({
  product,
}: {
  product: Pick<Product, "slug" | "name" | "price" | "sizes">;
}) {
  const { addLine, totalQuantity } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);

  // Подтверждение гаснет само, чтобы кнопка вернулась в рабочее состояние.
  useEffect(() => {
    if (!justAdded) {
      return;
    }

    const timer = setTimeout(() => setJustAdded(false), CONFIRMATION_MS);

    return () => clearTimeout(timer);
  }, [justAdded]);

  const handleAdd = () => {
    if (!selectedSize) {
      return;
    }

    addLine({
      productSlug: product.slug,
      name: product.name,
      size: selectedSize,
      price: product.price,
    });
    setJustAdded(true);
  };

  return (
    <div>
      <fieldset>
        <legend className="sr-only">Размер</legend>

        <div className="flex flex-wrap gap-2">
          {product.sizes.map((size) => {
            const isSelected = size === selectedSize;

            return (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                aria-pressed={isSelected}
                className={`min-w-14 rounded-full border px-4 py-2 text-sm transition-colors ${
                  isSelected
                    ? "border-accent bg-accent text-accent-contrast"
                    : "border-line text-ink hover:border-ink-muted"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </fieldset>

      <button
        type="button"
        onClick={handleAdd}
        disabled={selectedSize === null}
        className="mt-4 w-full rounded-full bg-accent py-3.5 text-sm text-accent-contrast transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
      >
        {selectedSize === null ? "Выберите размер" : justAdded ? "Добавлено" : "В корзину"}
      </button>

      {totalQuantity > 0 ? (
        <Link
          href="/cart"
          className="mt-3 block text-center text-xs text-ink-muted transition-colors hover:text-ink"
        >
          Перейти в корзину
        </Link>
      ) : null}
    </div>
  );
}
