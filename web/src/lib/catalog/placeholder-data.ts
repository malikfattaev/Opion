import { toMinorUnits } from "@/lib/money";

import type { Product, ProductStyle, ProductType } from "./types";

/**
 * Временные данные, чтобы витрина была видимой до подключения базы.
 * Заменяются запросами к PostgreSQL — точка замены одна, `lib/catalog/index.ts`.
 */

export const placeholderTypes: readonly ProductType[] = [
  { slug: "hoodie", name: "Худи" },
  { slug: "sweatshirt", name: "Свитшот" },
  { slug: "tee", name: "Футболка" },
  { slug: "shirt", name: "Рубашка" },
  { slug: "jeans", name: "Джинсы" },
  { slug: "trousers", name: "Брюки" },
  { slug: "jacket", name: "Куртка" },
  { slug: "accessory", name: "Аксессуары" },
];

export const placeholderStyles: readonly ProductStyle[] = [
  { slug: "y2k", name: "Y2K" },
  { slug: "alt", name: "Нефор" },
  { slug: "streetwear", name: "Стритвир" },
  { slug: "minimal", name: "Минимализм" },
  { slug: "vintage", name: "Винтаж" },
];

export const placeholderProducts: readonly Product[] = [
  {
    slug: "oversize-hoodie",
    name: "Худи оверсайз",
    description: "Плотный футер, свободная посадка, кулиска с металлическими люверсами.",
    typeSlug: "hoodie",
    styleSlugs: ["streetwear", "alt"],
    priceMinor: toMinorUnits(7900),
    sizes: ["S", "M", "L", "XL"],
    images: [],
  },
  {
    slug: "cotton-tee",
    name: "Футболка из плотного хлопка",
    description: "Хлопок 240 г/м², прямой силуэт, укреплённая горловина.",
    typeSlug: "tee",
    styleSlugs: ["minimal", "streetwear"],
    priceMinor: toMinorUnits(3200),
    sizes: ["S", "M", "L", "XL"],
    images: [],
  },
  {
    slug: "wide-jeans",
    name: "Джинсы широкого кроя",
    description: "Плотный деним, высокая посадка, свободная штанина.",
    typeSlug: "jeans",
    styleSlugs: ["y2k", "streetwear"],
    priceMinor: toMinorUnits(9400),
    compareAtPriceMinor: toMinorUnits(11900),
    sizes: ["44", "46", "48", "50"],
    images: [],
  },
  {
    slug: "bomber-jacket",
    name: "Бомбер",
    description: "Тонкий утеплитель, резинки по низу и манжетам, потайные карманы.",
    typeSlug: "jacket",
    styleSlugs: ["streetwear", "vintage"],
    priceMinor: toMinorUnits(16500),
    sizes: ["S", "M", "L"],
    images: [],
  },
  {
    slug: "knit-beanie",
    name: "Шапка бини",
    description: "Мериносовая шерсть, двойной отворот.",
    typeSlug: "accessory",
    styleSlugs: ["minimal", "alt"],
    priceMinor: toMinorUnits(2400),
    sizes: ["OS"],
    images: [],
  },
  {
    slug: "poplin-shirt",
    name: "Рубашка из поплина",
    description: "Хлопковый поплин, прямой крой, перламутровые пуговицы.",
    typeSlug: "shirt",
    styleSlugs: ["minimal", "vintage"],
    priceMinor: toMinorUnits(6700),
    sizes: ["S", "M", "L", "XL"],
    images: [],
  },
  {
    slug: "cargo-trousers",
    name: "Брюки карго",
    description: "Плотный хлопок, накладные карманы, регулируемый низ.",
    typeSlug: "trousers",
    styleSlugs: ["y2k", "alt"],
    priceMinor: toMinorUnits(8900),
    sizes: ["44", "46", "48", "50"],
    images: [],
  },
  {
    slug: "heavy-sweatshirt",
    name: "Свитшот",
    description: "Начёс изнутри, приспущенное плечо, широкая резинка по низу.",
    typeSlug: "sweatshirt",
    styleSlugs: ["minimal", "streetwear"],
    priceMinor: toMinorUnits(6400),
    sizes: ["S", "M", "L", "XL"],
    images: [],
  },
];
