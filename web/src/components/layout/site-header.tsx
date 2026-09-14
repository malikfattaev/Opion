"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/layout/container";
import { mainNavigation, type NavigationItem } from "@/config/site";

export function SiteHeader() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Меню закрывается по клику на ссылку, а не эффектом на смену адреса:
  // так нет лишнего рендера и состояние меняется там, где его меняет человек.
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="relative z-50">
      <Container>
        <div className="flex h-20 items-center justify-between gap-6">
          <Link href="/" aria-label="На главную" onClick={closeMenu} className="shrink-0">
            <Logo />
          </Link>

          <nav aria-label="Основная навигация" className="hidden md:block">
            <ul className="flex items-center gap-8">
              {mainNavigation.map((item) => (
                <li key={item.href}>
                  <NavLink href={item.href} isActive={isActiveItem(pathname, item)}>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-5">
            <NavLink href="/cart" isActive={isActiveItem(pathname, CART_ITEM)} onClick={closeMenu}>
              Корзина
            </NavLink>

            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
              className="-mr-2 p-2 text-sm md:hidden"
            >
              {isMenuOpen ? "Закрыть" : "Меню"}
            </button>
          </div>
        </div>
      </Container>

      {/* Панель раскрывается поверх содержимого, поэтому у неё свой фон. */}
      {isMenuOpen ? (
        <nav
          id="mobile-navigation"
          aria-label="Мобильная навигация"
          className="absolute inset-x-0 top-full bg-canvas md:hidden"
        >
          <Container>
            <ul className="flex flex-col pb-4">
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
          </Container>
        </nav>
      ) : null}
    </header>
  );
}

function NavLink({
  href,
  isActive,
  onClick,
  children,
}: {
  href: string;
  isActive: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={`text-sm transition-colors hover:text-ink ${isActive ? "text-ink" : "text-ink-muted"}`}
    >
      {children}
    </Link>
  );
}

const CART_ITEM: NavigationItem = { href: "/cart", label: "Корзина" };

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
