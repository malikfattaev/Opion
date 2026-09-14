"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { CartIcon } from "@/components/icons";
import { appConfig } from "@/config/site";
import { useCart } from "@/lib/cart/use-cart";
import { haptic } from "@/lib/telegram/use-telegram";

export function AppHeader() {
  const pathname = usePathname();
  const { isReady, totalQuantity } = useCart();

  const isCartOpen = pathname === "/cart" || pathname === "/checkout";

  return (
    <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-5">
        <Link href="/" onClick={() => haptic()} aria-label="В каталог">
          <Image
            src={appConfig.logo.src}
            alt={appConfig.wordmark}
            width={appConfig.logo.width}
            height={appConfig.logo.height}
            priority
            style={{ height: appConfig.logo.headerHeight, width: "auto" }}
          />
        </Link>

        <Link
          href="/cart"
          onClick={() => haptic()}
          aria-label="Корзина"
          className={`relative -mr-2 p-2 transition-colors ${isCartOpen ? "text-ink" : "text-ink-muted"}`}
        >
          <CartIcon />
          {/* Счётчик появляется только после чтения localStorage: иначе разметка
              сервера и клиента разойдутся на первом рендере. */}
          {isReady && totalQuantity > 0 ? (
            <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-accent text-[0.625rem] text-accent-contrast">
              {totalQuantity}
            </span>
          ) : null}
        </Link>
      </div>
    </header>
  );
}
