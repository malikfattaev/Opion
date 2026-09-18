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
    headerHeight: 28,
  },
} as const;

/** Ключ картинки раздела: сами иконки живут в компонентах, конфиг остаётся без JSX. */
export type NavigationIcon = "tag" | "layers" | "spark";

export type NavigationItem = {
  href: string;
  label: string;
  icon: NavigationIcon;
  /** Подпись под названием: по ней сразу понятно, что внутри раздела. */
  hint: string;
};

export type NavigationGroup = {
  title: string;
  items: readonly NavigationItem[];
};

/** Разделы админки. Заказы и команда появятся следующими шагами. */
export const adminNavigation: readonly NavigationGroup[] = [
  {
    title: "Каталог",
    items: [
      { href: "/products", label: "Товары", icon: "tag", hint: "витрина" },
      { href: "/types", label: "Типы", icon: "layers", hint: "худи, джинсы" },
      { href: "/styles", label: "Стили", icon: "spark", hint: "Y2K, Archive" },
    ],
  },
];

export const adminRoleLabels: Record<string, string> = {
  OWNER: "владелец",
  MANAGER: "менеджер",
};
