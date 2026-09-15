import { getProducts, getProductStyles, getProductTypes } from "@/lib/catalog";
import { jsonResponse, preflight } from "@/lib/cors";

/** Каталог для сайта, мини-аппа и админки. Модель товара живёт только здесь. */
// Кешируют витрины, каждая у себя. Здесь всегда свежий ответ, иначе правка
// из админки доходила бы до покупателя вдвое дольше.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const [types, styles, products] = await Promise.all([
    getProductTypes(),
    getProductStyles(),
    getProducts(),
  ]);

  return jsonResponse(request, { types, styles, products });
}

export function OPTIONS(request: Request) {
  return preflight(request);
}
