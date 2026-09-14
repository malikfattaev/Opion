import { jsonResponse, preflight } from "@/lib/cors";
import { toPublicOrder } from "@/lib/orders/public";
import { findOrderByToken } from "@/lib/orders/repository";

/** Статус меняется в любой момент, поэтому ответ не кешируется. */
export const dynamic = "force-dynamic";

/**
 * Статус заказа по секретной ссылке. Профиля на сайте нет, поэтому токен
 * выдаётся при оформлении и хранится в браузере покупателя.
 */
export async function GET(request: Request, { params }: RouteContext<"/orders/[token]">) {
  const { token } = await params;
  const order = await findOrderByToken(token);

  if (!order) {
    return jsonResponse(request, { message: "Заказ не найден." }, { status: 404 });
  }

  return jsonResponse(request, { order: toPublicOrder(order) });
}

export function OPTIONS(request: Request) {
  return preflight(request);
}
