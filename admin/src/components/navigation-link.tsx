"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Активный раздел подсвечивается: иначе непонятно, где находишься. */
export function NavigationLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

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
