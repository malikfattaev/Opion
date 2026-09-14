"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { CartIcon, GridIcon, MenuIcon } from "@/components/icons";
import { moreLinks } from "@/config/site";
import { useCart } from "@/lib/cart/use-cart";
import { haptic } from "@/lib/telegram/use-telegram";

/**
 * Нижний док: каталог, корзина и меню. Он плавает над содержимым, поэтому
 * у страниц снизу оставлен отступ высотой дока.
 */
export function AppDock() {
  const pathname = usePathname();
  const { isReady, totalQuantity } = useCart();

  const isCatalogActive = pathname === "/" || pathname.startsWith("/product/");
  const isCartActive = pathname === "/cart" || pathname === "/checkout";
  const isMenuActive = pathname === "/menu" || moreLinks.some((link) => pathname.startsWith(link.href));

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-line bg-surface/95 p-1.5 backdrop-blur">
        <DockLink href="/" label="Каталог" isActive={isCatalogActive}>
          <GridIcon />
        </DockLink>

        <DockLink href="/cart" label="Корзина" isActive={isCartActive}>
          <CartIcon />
          {/* Счётчик появляется только после чтения localStorage: иначе разметка
              сервера и клиента разойдутся на первом рендере. */}
          {isReady && totalQuantity > 0 ? (
            <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-accent text-[0.625rem] text-accent-contrast">
              {totalQuantity}
            </span>
          ) : null}
        </DockLink>

        <DockLink href="/menu" label="Меню" isActive={isMenuActive}>
          <MenuIcon />
        </DockLink>
      </div>
    </nav>
  );
}

function DockLink({
  href,
  label,
  isActive,
  children,
}: {
  href: string;
  label: string;
  isActive: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={() => haptic()}
      aria-label={label}
      aria-current={isActive ? "page" : undefined}
      className={`relative flex size-12 items-center justify-center rounded-full transition-colors ${
        isActive ? "bg-accent text-accent-contrast" : "text-ink-muted active:bg-canvas"
      }`}
    >
      {children}
    </Link>
  );
}
