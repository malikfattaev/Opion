import { toMinorUnits } from "@/lib/money";

import type { Category, Product } from "./types";

/**
 * Временные данные, чтобы витрина была видимой до подключения базы.
 * Заменяются запросами к PostgreSQL — точка замены одна, `lib/catalog/index.ts`.
 */

export const placeholderCategories: readonly Category[] = [
  { slug: "outerwear", name: "Верхняя одежда", description: "Куртки и пальто на межсезонье." },
  { slug: "tops", name: "Верх", description: "Футболки, лонгсливы, рубашки." },
  { slug: "knitwear", name: "Трикотаж", description: "Худи, свитшоты, свитеры." },
  { slug: "bottoms", name: "Низ", description: "Брюки, джинсы, шорты." },
  { slug: "accessories", name: "Аксессуары", description: "Головные уборы и сумки." },
];

export const placeholderProducts: readonly Product[] = [
  {
    slug: "oversize-hoodie",
    name: "Худи оверсайз",
    categorySlug: "knitwear",
    description: "Плотный футер, свободная посадка, кулиска с металлическими люверсами.",
    priceMinor: toMinorUnits(7900),
    sizes: ["S", "M", "L", "XL"],
    colors: ["Чёрный", "Кремовый"],
    images: [],
  },
  {
    slug: "cotton-tee",
    name: "Футболка из плотного хлопка",
    categorySlug: "tops",
    description: "Хлопок 240 г/м², прямой силуэт, укреплённая горловина.",
    priceMinor: toMinorUnits(3200),
    sizes: ["S", "M", "L", "XL"],
    colors: ["Чёрный", "Белый"],
    images: [],
  },
  {
    slug: "wide-trousers",
    name: "Брюки широкого кроя",
    categorySlug: "bottoms",
    description: "Костюмная ткань, высокая посадка, свободная штанина.",
    priceMinor: toMinorUnits(9400),
    compareAtPriceMinor: toMinorUnits(11900),
    sizes: ["44", "46", "48", "50"],
    colors: ["Чёрный"],
    images: [],
  },
  {
    slug: "bomber-jacket",
    name: "Бомбер",
    categorySlug: "outerwear",
    description: "Тонкий утеплитель, резинки по низу и манжетам, потайные карманы.",
    priceMinor: toMinorUnits(16500),
    sizes: ["S", "M", "L"],
    colors: ["Чёрный"],
    images: [],
  },
  {
    slug: "knit-beanie",
    name: "Шапка бини",
    categorySlug: "accessories",
    description: "Мериносовая шерсть, двойной отворот.",
    priceMinor: toMinorUnits(2400),
    sizes: ["OS"],
    colors: ["Чёрный", "Кремовый"],
    images: [],
  },
  {
    slug: "poplin-shirt",
    name: "Рубашка из поплина",
    categorySlug: "tops",
    description: "Хлопковый поплин, прямой крой, перламутровые пуговицы.",
    priceMinor: toMinorUnits(6700),
    sizes: ["S", "M", "L", "XL"],
    colors: ["Белый", "Чёрный"],
    images: [],
  },
];
