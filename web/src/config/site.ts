import { publicEnv } from "@/lib/env";

/** Всё, что описывает магазин как таковой, живёт здесь, а не в компонентах. */
export const siteConfig = {
  name: "Opion",
  title: "Opion. Магазин одежды",
  description: "Лаконичная одежда на каждый день.",
  locale: "ru-UZ",
  /** Код валюты по ISO 4217: нужен для данных и интеграций. */
  currency: "UZS",
  /** Как валюта подписана в интерфейсе. Intl для UZS выдаёт «UZS», а не «сум». */
  currencyLabel: "сум",
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
 * достижим отсюда, иначе страница окажется без единой ссылки на себя.
 */
export const mainNavigation: readonly NavigationItem[] = [
  { href: "/delivery", label: "Доставка" },
  { href: "/contacts", label: "Контакты" },
  { href: "/about", label: "О нас" },
];
