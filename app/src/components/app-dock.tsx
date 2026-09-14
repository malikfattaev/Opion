"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { CartIcon, CloseIcon, GridIcon, MenuIcon } from "@/components/icons";
import { moreLinks } from "@/config/site";
import { useCart } from "@/lib/cart/use-cart";
import { haptic } from "@/lib/telegram/use-telegram";

/**
 * Нижний док: корзина и «Ещё». Он плавает над содержимым, поэтому у страниц
 * снизу оставлен отступ высотой дока.
 */
export function AppDock() {
  const pathname = usePathname();
  const router = useRouter();
  const { isReady, totalQuantity } = useCart();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const isCatalogActive = pathname === "/" || pathname.startsWith("/product/");
  const isCartActive = pathname === "/cart" || pathname === "/checkout";
  const isMoreActive = moreLinks.some((link) => pathname.startsWith(link.href));

  // Пока шторка открыта, страница под ней прокручиваться не должна.
  useEffect(() => {
    if (!isMoreOpen) {
      return;
    }

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [isMoreOpen]);

  const openLink = (href: string) => {
    haptic();
    setIsMoreOpen(false);
    router.push(href);
  };

  return (
    <>
      <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-line bg-surface/95 p-1.5 backdrop-blur">
          <Link
            href="/"
            onClick={() => haptic()}
            aria-label="Каталог"
            aria-current={isCatalogActive ? "page" : undefined}
            className={`flex size-12 items-center justify-center rounded-full transition-colors ${
              isCatalogActive ? "bg-accent text-accent-contrast" : "text-ink-muted active:bg-canvas"
            }`}
          >
            <GridIcon />
          </Link>

          <Link
            href="/cart"
            onClick={() => haptic()}
            aria-label="Корзина"
            aria-current={isCartActive ? "page" : undefined}
            className={`relative flex size-12 items-center justify-center rounded-full transition-colors ${
              isCartActive ? "bg-accent text-accent-contrast" : "text-ink-muted active:bg-canvas"
            }`}
          >
            <CartIcon />
            {/* Счётчик появляется только после чтения localStorage: иначе разметка
                сервера и клиента разойдутся на первом рендере. */}
            {isReady && totalQuantity > 0 ? (
              <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-accent text-[0.625rem] text-accent-contrast">
                {totalQuantity}
              </span>
            ) : null}
          </Link>

          <button
            type="button"
            onClick={() => {
              haptic();
              setIsMoreOpen(true);
            }}
            aria-label="Ещё"
            aria-expanded={isMoreOpen}
            className={`flex size-12 items-center justify-center rounded-full transition-colors ${
              isMoreActive ? "bg-accent text-accent-contrast" : "text-ink-muted active:bg-canvas"
            }`}
          >
            <MenuIcon />
          </button>
        </div>
      </nav>

      {isMoreOpen ? (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <button
            type="button"
            aria-label="Закрыть меню"
            onClick={() => setIsMoreOpen(false)}
            className="flex-1 bg-black/60"
          />

          <div className="rounded-t-3xl border-t border-line bg-surface px-5 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-between">
              <p className="text-xs tracking-widest text-ink-muted uppercase">Ещё</p>
              <button
                type="button"
                onClick={() => setIsMoreOpen(false)}
                aria-label="Закрыть"
                className="-mr-2 p-2 text-ink-muted"
              >
                <CloseIcon className="size-4" />
              </button>
            </div>

            <ul className="mt-4 divide-y divide-line">
              {moreLinks.map((link) => (
                <li key={link.href}>
                  <button
                    type="button"
                    onClick={() => openLink(link.href)}
                    className="flex w-full flex-col items-start py-3.5 text-left active:opacity-60"
                  >
                    <span className="text-sm">{link.label}</span>
                    <span className="mt-0.5 text-xs text-ink-muted">{link.description}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}
