/** Константы мини-аппа. Держим их рядом с сайтом, чтобы бренд не расходился. */
export const appConfig = {
  /** Начертание из логотипа. */
  wordmark: "OPIØN",
  name: "Opion",
  locale: "ru-UZ",
  currencyLabel: "сум",
  logo: {
    src: "/brand/logo.png",
    width: 1200,
    height: 481,
    /** Высота в шапке. Ширина считается по пропорции. */
    headerHeight: 30,
  },
  /** Сколько вещей показываем на одной странице каталога. */
  productsPerPage: 6,
} as const;

export type AppLink = {
  href: string;
  label: string;
  description: string;
};

/**
 * Разделы из кнопки «Ещё». Каталог и корзина живут в доке,
 * поэтому здесь только всё остальное.
 */
export const moreLinks: readonly AppLink[] = [
  { href: "/orders", label: "Мои заказы", description: "История и статусы" },
  { href: "/delivery", label: "Доставка и оплата", description: "Как получить заказ" },
  { href: "/contacts", label: "Контакты", description: "Как с нами связаться" },
  { href: "/about", label: "О нас", description: "Что такое OPIØN" },
];
