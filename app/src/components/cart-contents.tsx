"use client";

import Link from "next/link";

import { PageTitle } from "@/components/page-title";
import { useCart } from "@/lib/cart/use-cart";
import { cartLineKey } from "@/lib/cart/types";
import { formatPrice } from "@/lib/money";
import { haptic } from "@/lib/telegram/use-telegram";

export function CartContents() {
  const { lines, isReady, total, setQuantity, removeLine } = useCart();

  // До чтения localStorage состав корзины неизвестен.
  if (!isReady) {
    return null;
  }

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center px-5 pt-20 text-center">
        <p className="font-display text-2xl leading-tight">Корзина пуста</p>
        <p className="mt-2 text-sm text-ink-muted">Выберите что-нибудь в каталоге.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col px-5">
      <PageTitle>Корзина</PageTitle>

      <ul className="mt-6 divide-y divide-line border-y border-line">
        {lines.map((line) => {
          const key = cartLineKey(line);

          return (
            <li key={key} className="py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm leading-snug">{line.name}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">Размер {line.size}</p>
                </div>
                <p className="shrink-0 text-sm tabular-nums">{formatPrice(line.price * line.quantity)}</p>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <QuantityButton
                    label={`Убрать одну «${line.name}»`}
                    onClick={() => setQuantity(key, line.quantity - 1)}
                  >
                    −
                  </QuantityButton>
                  <span className="w-6 text-center text-sm tabular-nums">{line.quantity}</span>
                  <QuantityButton
                    label={`Добавить одну «${line.name}»`}
                    onClick={() => setQuantity(key, line.quantity + 1)}
                  >
                    +
                  </QuantityButton>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    haptic();
                    removeLine(key);
                  }}
                  className="text-xs text-ink-muted underline underline-offset-4"
                >
                  Удалить
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="-mx-5 mt-auto border-t border-line px-5 pt-4">
        <p className="flex justify-between text-base">
          <span>Итого</span>
          <span className="tabular-nums">{formatPrice(total)}</span>
        </p>

        <Link
          href="/checkout"
          onClick={() => haptic()}
          className="mt-3 block rounded-full bg-accent py-3.5 text-center text-sm text-accent-contrast active:opacity-80"
        >
          Оформить заказ
        </Link>
      </div>
    </div>
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
      aria-label={label}
      onClick={() => {
        haptic();
        onClick();
      }}
      className="flex size-8 items-center justify-center rounded-full border border-line text-sm active:bg-surface"
    >
      {children}
    </button>
  );
}
