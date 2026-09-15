/** Константы админки. Написание бренда одно на все три приложения. */
export const adminConfig = {
  wordmark: "OPIØN",
  name: "Opion",
  locale: "ru-UZ",
  currencyLabel: "сум",
  logo: {
    src: "/brand/logo.png",
    width: 1200,
    height: 481,
    headerHeight: 24,
  },
} as const;

export type NavigationItem = { href: string; label: string };

/** Разделы админки. Заказы и команда появятся следующими шагами. */
export const adminNavigation: readonly NavigationItem[] = [
  { href: "/products", label: "Товары" },
  { href: "/types", label: "Типы" },
  { href: "/styles", label: "Стили" },
];
