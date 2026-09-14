import { OrderSource } from "@/generated/prisma/enums";
import { getProductBySlug } from "@/lib/catalog";
import { jsonResponse, preflight } from "@/lib/cors";
import type { ResolvedOrderLine } from "@/lib/orders/message";
import { toPublicOrder } from "@/lib/orders/public";
import { attachTelegramMessage, createOrder } from "@/lib/orders/repository";
import {
  ACCEPTED_SCREENSHOT_TYPES,
  MAX_SCREENSHOT_BYTES,
  orderRequestSchema,
  type OrderItemInput,
} from "@/lib/orders/schema";
import { verifyInitData } from "@/lib/telegram/init-data";
import { sendOrderMessage } from "@/lib/telegram/orders";

/** Заказ уходит в Telegram в момент запроса, кешировать здесь нечего. */
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return fail(request, "Не удалось прочитать форму заказа.", 400);
  }

  const parsed = orderRequestSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    comment: readOptional(formData.get("comment")),
    items: readItems(formData.get("items")),
  });

  if (!parsed.success) {
    return fail(request, parsed.error.issues[0]?.message ?? "Проверьте заполнение формы.", 400);
  }

  const screenshot = formData.get("screenshot");

  if (!(screenshot instanceof File) || screenshot.size === 0) {
    return fail(request, "Приложите скриншот перевода.", 400);
  }

  if (!ACCEPTED_SCREENSHOT_TYPES.includes(screenshot.type as (typeof ACCEPTED_SCREENSHOT_TYPES)[number])) {
    return fail(request, "Скриншот должен быть изображением: JPG, PNG, WEBP или HEIC.", 400);
  }

  if (screenshot.size > MAX_SCREENSHOT_BYTES) {
    return fail(request, "Скриншот тяжелее 10 МБ. Сожмите его или сделайте заново.", 400);
  }

  // Цены берём из каталога, а не из присланной корзины: клиент мог их подменить.
  const lines: ResolvedOrderLine[] = [];

  for (const item of parsed.data.items) {
    const product = await getProductBySlug(item.productSlug);

    if (!product) {
      return fail(request, "Одной из вещей в корзине больше нет в каталоге.", 409);
    }

    if (!product.sizes.includes(item.size)) {
      return fail(request, `Размер ${item.size} для «${product.name}» недоступен.`, 409);
    }

    lines.push({
      productSlug: product.slug,
      name: product.name,
      size: item.size,
      quantity: item.quantity,
      unitPrice: product.price,
    });
  }

  // Из мини-аппа приходит подписанный initData: если подпись сходится,
  // к заказу привяжется настоящий аккаунт покупателя и он увидит статус.
  const telegramUser = verifyInitData(readText(formData.get("initData")) ?? "");

  const order = await createOrder({
    source: telegramUser ? OrderSource.MINI_APP : OrderSource.WEBSITE,
    order: parsed.data,
    lines,
    total: lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
    telegramUserId: telegramUser ? String(telegramUser.id) : null,
    telegramUsername: telegramUser?.username ?? null,
  });

  const sent = await sendOrderMessage(order, screenshot);

  if (!sent.ok) {
    console.error("Заказ не доставлен в Telegram:", sent.reason);

    return fail(request, "Не получилось отправить заказ. Напишите нам в Telegram, оформим вручную.", 502);
  }

  await attachTelegramMessage(order.id, sent.result);

  return jsonResponse(request, { order: toPublicOrder(order) });
}

export function OPTIONS(request: Request) {
  return preflight(request);
}

function readOptional(value: FormDataEntryValue | null): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

function readText(value: FormDataEntryValue | null): string | null {
  return typeof value === "string" ? value : null;
}

/** Состав заказа приходит строкой JSON: форма не умеет отправлять вложенные объекты. */
function readItems(value: FormDataEntryValue | null): OrderItemInput[] | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  try {
    const parsed: unknown = JSON.parse(value);

    return Array.isArray(parsed) ? (parsed as OrderItemInput[]) : undefined;
  } catch {
    return undefined;
  }
}

function fail(request: Request, message: string, status: number) {
  return jsonResponse(request, { message }, { status });
}
