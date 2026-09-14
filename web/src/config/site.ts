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

export type NavigationItem = {
  href: string;
  label: string;
  /** Пути, на которых пункт тоже подсвечивается: страницы категорий, например. */
  activePrefixes?: readonly string[];
};

/**
 * Вся навигация сайта. Подвала нет, поэтому каждый раздел должен быть
 * достижим отсюда — иначе страница окажется без единой ссылки на себя.
 */
export const mainNavigation: readonly NavigationItem[] = [
  { href: "/", label: "Каталог", activePrefixes: ["/catalog"] },
  { href: "/lookbook", label: "Лукбук" },
  { href: "/about", label: "О бренде" },
  { href: "/delivery", label: "Доставка" },
  { href: "/contacts", label: "Контакты" },
];
