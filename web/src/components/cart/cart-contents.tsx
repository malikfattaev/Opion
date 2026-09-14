"use client";

import Link from "next/link";

import { Container } from "@/components/layout/container";
import { useCart } from "@/lib/cart/use-cart";
import { cartLineKey } from "@/lib/cart/types";
import { formatPrice } from "@/lib/money";

export function CartContents() {
  const { lines, isReady, totalMinor, setQuantity, removeLine } = useCart();

  // До чтения localStorage содержимое корзины неизвестно: показать «пусто»
  // в этот момент значило бы соврать.
  if (!isReady) {
    return null;
  }

  if (lines.length === 0) {
    return (
      <Container className="pt-16 pb-24">
        <h1 className="font-display text-4xl leading-tight sm:text-5xl">Корзина</h1>
        <p className="mt-4 text-sm text-ink-muted">Пока пусто.</p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-full bg-accent px-8 py-3 text-sm text-accent-contrast transition-opacity hover:opacity-90"
        >
          В каталог
        </Link>
      </Container>
    );
  }

  return (
    <Container className="pt-16 pb-24">
      <h1 className="font-display text-4xl leading-tight sm:text-5xl">Корзина</h1>

      <ul className="mt-10 divide-y divide-line border-y border-line">
        {lines.map((line) => {
          const key = cartLineKey(line);

          return (
            <li key={key} className="flex flex-wrap items-center justify-between gap-4 py-5">
              <div className="min-w-40 flex-1">
                <p className="text-sm">{line.name}</p>
                <p className="mt-1 text-xs text-ink-muted">Размер {line.size}</p>
              </div>

              <div className="flex items-center gap-2">
                <QuantityButton
                  label={`Убрать одну «${line.name}»`}
                  onClick={() => setQuantity(key, line.quantity - 1)}
                >
                  −
                </QuantityButton>

                <span className="w-8 text-center text-sm tabular-nums">{line.quantity}</span>

                <QuantityButton
                  label={`Добавить одну «${line.name}»`}
                  onClick={() => setQuantity(key, line.quantity + 1)}
                >
                  +
                </QuantityButton>
              </div>

              <p className="w-28 text-right text-sm tabular-nums">
                {formatPrice(line.priceMinor * line.quantity)}
              </p>

              <button
                type="button"
                onClick={() => removeLine(key)}
                className="text-xs text-ink-muted underline underline-offset-4 transition-colors hover:text-ink"
              >
                Удалить
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-6">
        <p className="text-lg">
          Итого <span className="tabular-nums">{formatPrice(totalMinor)}</span>
        </p>

        <Link
          href="/checkout"
          className="rounded-full bg-accent px-10 py-3.5 text-sm text-accent-contrast transition-opacity hover:opacity-90"
        >
          Перейти к оплате
        </Link>
      </div>
    </Container>
  );
}

function QuantityButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex size-8 items-center justify-center rounded-full border border-line text-sm transition-colors hover:border-ink-muted"
    >
      {children}
    </button>
  );
}
