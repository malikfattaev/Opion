export type ProductImage = {
  url: string;
  alt: string;
};

export type Category = {
  slug: string;
  name: string;
  description: string;
};

export type Product = {
  slug: string;
  name: string;
  categorySlug: string;
  description: string;
  /** Цена в минорных единицах, см. lib/money.ts */
  priceMinor: number;
  /** Зачёркнутая старая цена, если товар со скидкой. */
  compareAtPriceMinor?: number;
  sizes: readonly string[];
  colors: readonly string[];
  images: readonly ProductImage[];
};
