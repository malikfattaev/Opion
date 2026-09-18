import { z } from "zod";

import { OrderStatus } from "@/generated/prisma/enums";
import { serverEnv } from "@/lib/env";
import { decideOrder, orderNumber } from "@/lib/orders/repository";
import { statusLabel } from "@/lib/orders/status";
import { WEBHOOK_SECRET_HEADER } from "@/lib/telegram/headers";
import { answerCallback, isOrdersChatAdmin, ORDER_ACTIONS, updateOrderMessage } from "@/lib/telegram/orders";
import { sendWelcome } from "@/lib/telegram/welcome";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  message: z
    .object({
      chat: z.object({ id: z.number().int(), type: z.string() }),
      text: z.string().optional(),
    })
    .optional(),
  callback_query: z
    .object({
      id: z.string(),
      data: z.string().optional(),
      from: z.object({
        id: z.number().int().positive(),
        first_name: z.string(),
        last_name: z.string().optional(),
        username: z.string().optional(),
      }),
    })
    .optional(),
});

/** Решение по кнопке: что ставим и что говорим нажавшему. */
const DECISIONS = {
  [ORDER_ACTIONS.confirm]: OrderStatus.CONFIRMED,
  [ORDER_ACTIONS.reject]: OrderStatus.REJECTED,
} as const;

/**
 * Всё, что приходит от Telegram: /start в личке и кнопки «Подтвердить»
 * и «Отклонить» под заказом в группе основателей. Вызов подписан секретом,
 * который мы задали в setWebhook.
 */
export async function POST(request: Request) {
  const { TELEGRAM_WEBHOOK_SECRET } = serverEnv();

  if (!TELEGRAM_WEBHOOK_SECRET || request.headers.get(WEBHOOK_SECRET_HEADER) !== TELEGRAM_WEBHOOK_SECRET) {
    return new Response(null, { status: 401 });
  }

  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  const update = parsed.success ? parsed.data : undefined;
  const callback = update?.callback_query;

  // В группе заказов бот молчит: там он только присылает заказы.
  if (update?.message?.chat.type === "private" && isStart(update.message.text)) {
    const sent = await sendWelcome(update.message.chat.id);

    if (!sent.ok) {
      console.error("Не удалось ответить на /start:", sent.reason);
    }

    return Response.json({ ok: true });
  }

  // Telegram повторяет доставку, пока не получит 200, поэтому на всё,
  // что мы не умеем обрабатывать, отвечаем спокойным успехом.
  if (!callback?.data) {
    return Response.json({ ok: true });
  }

  const decision = readDecision(callback.data);

  if (!decision) {
    return Response.json({ ok: true });
  }

  if (!(await isOrdersChatAdmin(callback.from.id))) {
    await answerCallback(callback.id, "Решение по заказам принимают администраторы группы.");

    return Response.json({ ok: true });
  }

  const order = await decideOrder({
    id: decision.orderId,
    status: decision.status,
    expectedStatus: OrderStatus.NEW,
    decidedByName: formatName(callback.from),
  });

  if (!order) {
    await answerCallback(callback.id, "По этому заказу решение уже принято.");

    return Response.json({ ok: true });
  }

  const updated = await updateOrderMessage(order);

  if (!updated.ok) {
    console.error("Не удалось обновить сообщение заказа:", updated.reason);
  }

  await answerCallback(callback.id, `${orderNumber(order)}: ${statusLabel(order.status)}`);

  return Response.json({ ok: true });
}

/** Команда приходит как «/start», «/start код» или «/start@opion_bot». */
function isStart(text: string | undefined): boolean {
  return (text ?? "").trim().split(/\s+/)[0]?.split("@")[0] === "/start";
}

function readDecision(data: string): { status: OrderStatus; orderId: string } | null {
  const separator = data.lastIndexOf(":");
  const action = data.slice(0, separator);
  const orderId = data.slice(separator + 1);

  if (!orderId || !isKnownAction(action)) {
    return null;
  }

  return { status: DECISIONS[action], orderId };
}

function isKnownAction(action: string): action is keyof typeof DECISIONS {
  return action in DECISIONS;
}

function formatName(from: { first_name: string; last_name?: string; username?: string }): string {
  const name = [from.first_name, from.last_name].filter(Boolean).join(" ");

  return from.username ? `${name} (@${from.username})` : name;
}
