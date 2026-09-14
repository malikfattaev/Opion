export type ProductImage = {
  url: string;
  alt: string;
};

/** Тип вещи: худи, джинсы, футболка. Ровно один на товар. */
export type ProductType = {
  slug: string;
  name: string;
};

/** Стиль: y2k, нефор, стритвир. Одна вещь может попадать в несколько. */
export type ProductStyle = {
  slug: string;
  name: string;
};

export type Product = {
  slug: string;
  name: string;
  description: string;
  typeSlug: string;
  styleSlugs: readonly string[];
  /** Цена в минорных единицах, см. lib/money.ts */
  price: number;
  /** Зачёркнутая старая цена, если товар со скидкой. */
  compareAtPrice?: number;
  sizes: readonly string[];
  images: readonly ProductImage[];
};
