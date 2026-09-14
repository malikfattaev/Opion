import { z } from "zod";

/** Телефон приходит как угодно набранным, поэтому проверяем количество цифр, а не форму. */
const phoneSchema = z
  .string()
  .trim()
  .refine((value) => {
    const digits = value.replace(/\D/g, "").length;

    return digits >= 10 && digits <= 15;
  }, "Проверьте номер телефона");

export const orderItemSchema = z.object({
  productSlug: z.string().min(1),
  size: z.string().min(1),
  quantity: z.number().int().min(1).max(20),
});

export const orderRequestSchema = z.object({
  firstName: z.string().trim().min(2, "Укажите имя"),
  lastName: z.string().trim().min(2, "Укажите фамилию"),
  phone: phoneSchema,
  address: z.string().trim().min(10, "Укажите адрес доставки полностью"),
  comment: z.string().trim().max(500, "Комментарий длиннее 500 символов").optional(),
  items: z.array(orderItemSchema).min(1, "Корзина пуста"),
});

export type OrderItemInput = z.infer<typeof orderItemSchema>;
export type OrderRequest = z.infer<typeof orderRequestSchema>;

/** Telegram принимает фото до 10 МБ. */
export const MAX_SCREENSHOT_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_SCREENSHOT_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"] as const;
