"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Logo } from "@/components/brand/logo";
import { CartIcon, CloseIcon, MenuIcon } from "@/components/icons";
import { Container } from "@/components/layout/container";
import { mainNavigation, type NavigationItem } from "@/config/site";
import { useCart } from "@/lib/cart/use-cart";

const CART_ITEM: NavigationItem = { href: "/cart", label: "Корзина" };

export function SiteHeader() {
  const pathname = usePathname();
  const { isReady, totalQuantity } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Меню закрывается по клику на ссылку, а не эффектом на смену адреса:
  // так нет лишнего рендера и состояние меняется там, где его меняет человек.
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="relative z-50 pt-4 sm:pt-6">
      <Container>
        <div className="flex h-14 items-center justify-between gap-6 rounded-full border border-line bg-surface px-5 sm:px-7">
          <Link href="/" aria-label="На главную" onClick={closeMenu} className="shrink-0">
            <Logo />
          </Link>

          <nav aria-label="Основная навигация" className="hidden md:block">
            <ul className="flex items-center gap-7">
              {mainNavigation.map((item) => (
                <li key={item.href}>
                  <NavLink href={item.href} isActive={isActiveItem(pathname, item)}>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1">
            <IconLink item={CART_ITEM} isActive={isActiveItem(pathname, CART_ITEM)} onClick={closeMenu}>
              <CartIcon />
              {/* Счётчик появляется только после чтения localStorage — иначе
                  разметка сервера и клиента разойдутся на первом рендере. */}
              {isReady && totalQuantity > 0 ? (
                <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-accent text-[0.625rem] text-accent-contrast">
                  {totalQuantity}
                </span>
              ) : null}
            </IconLink>

            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}
              className="p-2 text-ink-muted transition-colors hover:text-ink md:hidden"
            >
              {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </Container>

      {/* Панель раскрывается поверх содержимого, поэтому у неё свой фон. */}
      {isMenuOpen ? (
        <Container className="absolute inset-x-0 top-full pt-2 md:hidden">
          <nav
            id="mobile-navigation"
            aria-label="Мобильная навигация"
            className="rounded-3xl border border-line bg-surface px-5 py-2"
          >
            <ul className="flex flex-col">
              {mainNavigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={closeMenu}
                    aria-current={isActiveItem(pathname, item) ? "page" : undefined}
                    className="block py-3 text-base"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      ) : null}
    </header>
  );
}

function NavLink({
  href,
  isActive,
  children,
}: {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`text-sm transition-colors hover:text-ink ${isActive ? "text-ink" : "text-ink-muted"}`}
    >
      {children}
    </Link>
  );
}

/** Иконка без подписи: название раздела остаётся для скринридеров и подсказки. */
function IconLink({
  item,
  isActive,
  onClick,
  children,
}: {
  item: NavigationItem;
  isActive: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      title={item.label}
      aria-label={item.label}
      aria-current={isActive ? "page" : undefined}
      className={`relative p-2 transition-colors hover:text-ink ${isActive ? "text-ink" : "text-ink-muted"}`}
    >
      {children}
    </Link>
  );
}

/**
 * Пункт активен на своей странице и на вложенных. Главную сравниваем строго:
 * иначе «/» оказалась бы префиксом вообще всех адресов.
 */
function isActiveItem(pathname: string, item: NavigationItem): boolean {
  const prefixes = [...(item.href === "/" ? [] : [item.href]), ...(item.activePrefixes ?? [])];

  return (
    pathname === item.href ||
    prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
  );
}
