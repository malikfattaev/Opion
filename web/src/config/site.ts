import { publicEnv } from "@/lib/env";

/** Всё, что описывает магазин как таковой, живёт здесь, а не в компонентах. */
export const siteConfig = {
  name: "Opion",
  title: "Opion — магазин одежды",
  description: "Opion — лаконичная одежда на каждый день.",
  locale: "ru-RU",
  /** Код валюты по ISO 4217. Используется для форматирования цен. */
  currency: "RUB",
  url: publicEnv.NEXT_PUBLIC_SITE_URL,
  miniAppUrl: publicEnv.NEXT_PUBLIC_MINI_APP_URL,
} as const;

/** Основная навигация в шапке и подвале. */
export const mainNavigation = [
  { href: "/catalog", label: "Каталог" },
  { href: "/lookbook", label: "Лукбук" },
  { href: "/about", label: "О бренде" },
] as const;

/** Служебные ссылки — только в подвале. */
export const footerNavigation = [
  { href: "/delivery", label: "Доставка и оплата" },
  { href: "/returns", label: "Возврат" },
  { href: "/contacts", label: "Контакты" },
] as const;

export type NavigationItem = (typeof mainNavigation)[number] | (typeof footerNavigation)[number];
