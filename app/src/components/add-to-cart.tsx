"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useCart } from "@/lib/cart/use-cart";
import type { Product } from "@/lib/catalog";
import { haptic, hapticSuccess } from "@/lib/telegram/use-telegram";

export function AddToCart({ product }: { product: Product }) {
  const router = useRouter();
  const { addLine } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

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

    hapticSuccess();
    router.push("/cart");
  };

  return (
    /* Панель стоит в конце страницы, а не липнет к низу: снизу уже плавает док,
       и две накладки друг на друге выглядели бы месивом. */
    <div className="-mx-5 mt-8 border-t border-line px-5 pt-4">
      <fieldset>
        <legend className="sr-only">Размер</legend>

        <div className="flex flex-wrap gap-2">
          {product.sizes.map((size) => {
            const isSelected = size === selectedSize;

            return (
              <button
                key={size}
                type="button"
                onClick={() => {
                  haptic();
                  setSelectedSize(size);
                }}
                aria-pressed={isSelected}
                className={`min-w-13 rounded-full border px-4 py-2 text-sm transition-colors ${
                  isSelected ? "border-accent bg-accent text-accent-contrast" : "border-line text-ink"
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
        className="mt-3 w-full rounded-full bg-accent py-3.5 text-sm text-accent-contrast active:opacity-80 disabled:opacity-30"
      >
        {selectedSize === null ? "Выберите размер" : "В корзину"}
      </button>
    </div>
  );
}
