"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/layout/container";
import { mainNavigation } from "@/config/site";

export function SiteHeader() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Меню закрывается по клику на ссылку, а не эффектом на смену адреса:
  // так нет лишнего рендера и состояние меняется ровно там, где его меняет человек.
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="bg-canvas/90 sticky top-0 z-50 border-b border-line backdrop-blur">
      <Container>
        <div className="flex h-16 items-center justify-between gap-6">
          <Link href="/" aria-label="На главную" onClick={closeMenu} className="shrink-0">
            <Logo />
          </Link>

          <nav aria-label="Основная навигация" className="hidden md:block">
            <ul className="flex items-center gap-8">
              {mainNavigation.map((item) => (
                <li key={item.href}>
                  <NavLink href={item.href} isActive={isActivePath(pathname, item.href)}>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-5">
            <NavLink href="/cart" isActive={isActivePath(pathname, "/cart")} onClick={closeMenu}>
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

      {isMenuOpen ? (
        <nav id="mobile-navigation" aria-label="Мобильная навигация" className="border-t border-line md:hidden">
          <Container>
            <ul className="flex flex-col py-2">
              {mainNavigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={closeMenu}
                    aria-current={isActivePath(pathname, item.href) ? "page" : undefined}
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

/** Раздел считается активным и на вложенных страницах: /catalog/[category]. */
function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
