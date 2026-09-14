import { z } from "zod";

import { apiUrl } from "@/lib/env";

const publicOrderSchema = z.object({
  number: z.string(),
  token: z.string(),
  status: z.string(),
  statusLabel: z.string(),
  total: z.number(),
  createdAt: z.string(),
  items: z.array(
    z.object({
      productSlug: z.string(),
      name: z.string(),
      size: z.string(),
      quantity: z.number(),
      unitPrice: z.number(),
    }),
  ),
});

export type PublicOrder = z.infer<typeof publicOrderSchema>;

/** Заголовок, которым мини-апп подтверждает покупателя перед API. */
const INIT_DATA_HEADER = "x-telegram-init-data";

export type SubmitResult = { ok: true; order: PublicOrder } | { ok: false; message: string };

export async function submitOrder(body: FormData): Promise<SubmitResult> {
  let response: Response;

  try {
    response = await fetch(`${apiUrl}/orders`, { method: "POST", body });
  } catch {
    return { ok: false, message: "Нет связи. Проверьте интернет и попробуйте ещё раз." };
  }

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    return { ok: false, message: readMessage(payload) ?? "Не получилось отправить заказ. Попробуйте ещё раз." };
  }

  const parsed = z.object({ order: publicOrderSchema }).safeParse(payload);

  return parsed.success
    ? { ok: true, order: parsed.data.order }
    : { ok: false, message: "API ответил неожиданно. Напишите нам, оформим заказ вручную." };
}

/**
 * История заказов покупателя. Личность подтверждает подпись Telegram,
 * поэтому отдельный вход не нужен.
 */
export async function fetchMyOrders(initData: string): Promise<PublicOrder[] | null> {
  try {
    const response = await fetch(`${apiUrl}/orders/mine`, {
      headers: { [INIT_DATA_HEADER]: initData },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const parsed = z.object({ orders: z.array(publicOrderSchema) }).safeParse(await response.json());

    return parsed.success ? parsed.data.orders : null;
  } catch {
    return null;
  }
}

function readMessage(payload: unknown): string | null {
  if (typeof payload !== "object" || payload === null) {
    return null;
  }

  const message = (payload as Record<string, unknown>).message;

  return typeof message === "string" ? message : null;
}
