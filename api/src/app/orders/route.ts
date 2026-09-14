import { getProductBySlug } from "@/lib/catalog";
import { jsonResponse, preflight } from "@/lib/cors";
import { buildOrderCaption, createOrderNumber, type ResolvedOrderLine } from "@/lib/orders/message";
import {
  ACCEPTED_SCREENSHOT_TYPES,
  MAX_SCREENSHOT_BYTES,
  orderRequestSchema,
  type OrderItemInput,
} from "@/lib/orders/schema";
import { sendOrderPhoto } from "@/lib/telegram";
import { verifyInitData } from "@/lib/telegram/init-data";

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
      name: product.name,
      size: item.size,
      quantity: item.quantity,
      unitPrice: product.price,
    });
  }

  const total = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const orderNumber = createOrderNumber();

  // Из мини-аппа приходит подписанный initData: если подпись сходится,
  // в заказ попадёт настоящий аккаунт покупателя, а не только введённое имя.
  const telegramUser = verifyInitData(readText(formData.get("initData")) ?? "");

  const sent = await sendOrderPhoto({
    photo: screenshot,
    caption: buildOrderCaption({ orderNumber, order: parsed.data, lines, total, telegramUser }),
  });

  if (!sent.ok) {
    console.error("Заказ не доставлен в Telegram:", sent.reason);

    return fail(request, "Не получилось отправить заказ. Напишите нам в Telegram, оформим вручную.", 502);
  }

  return jsonResponse(request, { orderNumber, total });
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

export function OPTIONS(request: Request) {
  return preflight(request);
}

function fail(request: Request, message: string, status: number) {
  return jsonResponse(request, { message }, { status });
}
