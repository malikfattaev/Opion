import { getProductBySlug } from "@/lib/catalog";
import { buildOrderCaption, createOrderNumber, type ResolvedOrderLine } from "@/lib/orders/message";
import {
  ACCEPTED_SCREENSHOT_TYPES,
  MAX_SCREENSHOT_BYTES,
  orderRequestSchema,
  type OrderItemInput,
} from "@/lib/orders/schema";
import { sendOrderPhoto } from "@/lib/telegram";

/** Заказ уходит в Telegram в момент запроса, кешировать здесь нечего. */
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return fail("Не удалось прочитать форму заказа.", 400);
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
    return fail(parsed.error.issues[0]?.message ?? "Проверьте заполнение формы.", 400);
  }

  const screenshot = formData.get("screenshot");

  if (!(screenshot instanceof File) || screenshot.size === 0) {
    return fail("Приложите скриншот перевода.", 400);
  }

  if (!ACCEPTED_SCREENSHOT_TYPES.includes(screenshot.type as (typeof ACCEPTED_SCREENSHOT_TYPES)[number])) {
    return fail("Скриншот должен быть изображением: JPG, PNG, WEBP или HEIC.", 400);
  }

  if (screenshot.size > MAX_SCREENSHOT_BYTES) {
    return fail("Скриншот тяжелее 10 МБ. Сожмите его или сделайте заново.", 400);
  }

  // Цены берём из каталога, а не из присланной корзины: клиент мог их подменить.
  const lines: ResolvedOrderLine[] = [];

  for (const item of parsed.data.items) {
    const product = await getProductBySlug(item.productSlug);

    if (!product) {
      return fail("Одной из вещей в корзине больше нет в каталоге.", 409);
    }

    if (!product.sizes.includes(item.size)) {
      return fail(`Размер ${item.size} для «${product.name}» недоступен.`, 409);
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

  const sent = await sendOrderPhoto({
    photo: screenshot,
    caption: buildOrderCaption({ orderNumber, order: parsed.data, lines, total }),
  });

  if (!sent.ok) {
    console.error("Заказ не доставлен в Telegram:", sent.reason);

    return fail("Не получилось отправить заказ. Напишите нам в Telegram, оформим вручную.", 502);
  }

  return Response.json({ orderNumber, total });
}

function readOptional(value: FormDataEntryValue | null): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
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

function fail(message: string, status: number) {
  return Response.json({ message }, { status });
}
