"use client";

import Image from "next/image";
import Link from "next/link";

import { appConfig } from "@/config/site";
import { haptic } from "@/lib/telegram/use-telegram";

/**
 * Шапка держит только логотип по центру: вся навигация ушла вниз, в док,
 * куда дотягивается большой палец.
 */
export function AppHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-center px-5">
      <Link href="/" onClick={() => haptic()} aria-label={`${appConfig.wordmark}, в каталог`}>
        <Image
          src={appConfig.logo.src}
          alt={appConfig.wordmark}
          width={appConfig.logo.width}
          height={appConfig.logo.height}
          priority
          style={{ height: appConfig.logo.headerHeight, width: "auto" }}
        />
      </Link>
    </header>
  );
}
