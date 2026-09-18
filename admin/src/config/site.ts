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
    sidebarHeight: 40,
  },
} as const;

/** Ключ картинки раздела: сами иконки живут в компонентах, конфиг остаётся без JSX. */
export type NavigationIcon = "gauge" | "tag" | "layers" | "spark" | "image" | "wallet" | "chart" | "users";

export type NavigationItem = {
  href: string;
  label: string;
  icon: NavigationIcon;
  /** Раздел виден только владельцу: менеджеру там всё равно откажет API. */
  ownerOnly?: boolean;
};

export type NavigationGroup = {
  /** У первой группы заголовка нет: панель управления стоит особняком. */
  title?: string;
  items: readonly NavigationItem[];
};

export const adminNavigation: readonly NavigationGroup[] = [
  {
    items: [{ href: "/", label: "Панель управления", icon: "gauge" }],
  },
  {
    title: "Каталог",
    items: [
      { href: "/products", label: "Товары", icon: "tag" },
      { href: "/types", label: "Типы", icon: "layers" },
      { href: "/styles", label: "Стили", icon: "spark" },
      { href: "/media", label: "Медиа", icon: "image" },
    ],
  },
  {
    title: "Финансы",
    items: [
      { href: "/cashflow", label: "Кешфлоу", icon: "wallet" },
      { href: "/sales", label: "Продажи", icon: "chart" },
    ],
  },
  {
    title: "Администрирование",
    items: [{ href: "/users", label: "Пользователи", icon: "users", ownerOnly: true }],
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
  { plural: string; add: string; create: string; edit: string }
> = {
  types: {
    plural: "Типы",
    add: "Добавить тип",
    create: "Новый тип",
    edit: "Изменить тип",
  },
  styles: {
    plural: "Стили",
    add: "Добавить стиль",
    create: "Новый стиль",
    edit: "Изменить стиль",
  },
};

/** Порядок в галерее медиа. Те же значения понимает API. */
export const mediaSorts = [
  { value: "new", label: "Сначала новые" },
  { value: "old", label: "Сначала старые" },
  { value: "large", label: "Сначала тяжёлые" },
  { value: "name", label: "По названию" },
] as const;

export type MediaSort = (typeof mediaSorts)[number]["value"];

/** Чужое значение из адреса страницы не должно ломать запрос. */
export function mediaSort(value: string | undefined): MediaSort {
  return mediaSorts.find((sort) => sort.value === value)?.value ?? "new";
}
