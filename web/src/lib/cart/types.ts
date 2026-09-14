/**
 * Строка корзины хранит снимок товара: название и цену на момент добавления.
 * Так корзина рисуется мгновенно, без запроса к серверу. Итоговую сумму заказа
 * сервер всё равно пересчитывает сам по артикулам: снимку с клиента доверять нельзя.
 */
export type CartLine = {
  productSlug: string;
  name: string;
  size: string;
  price: number;
  quantity: number;
};

/** Одну и ту же вещь в разных размерах считаем разными строками. */
export function cartLineKey(line: Pick<CartLine, "productSlug" | "size">): string {
  return `${line.productSlug}::${line.size}`;
}
