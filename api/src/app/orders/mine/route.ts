import { jsonResponse, preflight } from "@/lib/cors";
import { INIT_DATA_HEADER } from "@/lib/telegram/headers";
import { toPublicOrder } from "@/lib/orders/public";
import { listOrdersOfTelegramUser } from "@/lib/orders/repository";
import { verifyInitData } from "@/lib/telegram/init-data";

export const dynamic = "force-dynamic";

/**
 * История заказов покупателя из мини-аппа. Личность подтверждает подпись
 * Telegram, поэтому отдельный вход не нужен.
 */
export async function GET(request: Request) {
  const telegramUser = verifyInitData(request.headers.get(INIT_DATA_HEADER) ?? "");

  if (!telegramUser) {
    return jsonResponse(request, { message: "Подпись Telegram не подтверждена." }, { status: 401 });
  }

  const orders = await listOrdersOfTelegramUser(String(telegramUser.id));

  return jsonResponse(request, { orders: orders.map(toPublicOrder) });
}

export function OPTIONS(request: Request) {
  return preflight(request);
}
