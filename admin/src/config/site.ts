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
      { href: "/products", label: "Товары", icon: "tag" },
      { href: "/types", label: "Типы", icon: "layers" },
      { href: "/styles", label: "Стили", icon: "spark" },
    ],
  },
];

export const adminRoleLabels: Record<string, string> = {
  OWNER: "владелец",
  MANAGER: "менеджер",
};

/** Тип и стиль устроены одинаково, различается только раздел API и подписи. */
export type OptionKind = "types" | "styles";

/** Подписи разделов пишем целиком: так не приходится склонять слова в коде. */
export const optionSections: Record<
  OptionKind,
  { plural: string; add: string; create: string; edit: string; empty: string }
> = {
  types: {
    plural: "Типы",
    add: "Добавить тип",
    create: "Новый тип",
    edit: "Изменить тип",
    empty: "Типов пока нет. Добавьте первый.",
  },
  styles: {
    plural: "Стили",
    add: "Добавить стиль",
    create: "Новый стиль",
    edit: "Изменить стиль",
    empty: "Стилей пока нет. Добавьте первый.",
  },
};
