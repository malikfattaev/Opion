import { z } from "zod";

/** Одинаковые правила для всех форм админки: ошибки читает человек, а не машина. */

export const slugSchema = z
  .string()
  .trim()
  .min(2, "Слишком короткий адрес")
  .max(60, "Слишком длинный адрес")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "В адресе только латиница, цифры и дефис");

const nameSchema = z.string().trim().min(2, "Укажите название").max(80, "Слишком длинное название");

/** Артикул пишут руками, поэтому разрешаем привычную запись: OP-0001, TEE/24-M. */
const skuSchema = z
  .string()
  .trim()
  .min(2, "Слишком короткий артикул")
  .max(32, "Слишком длинный артикул")
  .regex(/^[A-Za-z0-9][A-Za-z0-9./_-]*$/, "В артикуле только латиница, цифры и знаки . / _ -");

const positionSchema = z.number().int().min(0).max(9999);

/** Цена в сумах. Тийины не в обороте, поэтому дробей нет. */
const priceSchema = z.number().int().min(0, "Цена не может быть отрицательной").max(1_000_000_000);

export const optionCreateSchema = z.object({
  slug: slugSchema,
  name: nameSchema,
  position: positionSchema.optional(),
});

export const optionUpdateSchema = optionCreateSchema.partial();

export const imageSchema = z.object({
  url: z.url("Ссылка на фото должна быть полной"),
  alt: z.string().trim().max(160).default(""),
});

export const productCreateSchema = z.object({
  slug: slugSchema,
  sku: skuSchema,
  name: nameSchema,
  description: z.string().trim().max(2000, "Описание длиннее 2000 символов").default(""),
  price: priceSchema,
  comparePrice: priceSchema.nullable().optional(),
  typeSlug: slugSchema,
  styleSlugs: z.array(slugSchema).max(20).default([]),
  sizes: z.array(z.string().trim().min(1).max(12)).min(1, "Добавьте хотя бы один размер").max(30),
  images: z.array(imageSchema).max(10).default([]),
  isPublished: z.boolean().default(true),
  position: positionSchema.optional(),
});

export const productUpdateSchema = productCreateSchema.partial();

export const credentialsSchema = z.object({
  username: z.string().trim().min(3, "Укажите логин").max(40),
  password: z.string().min(8, "Пароль короче 8 символов").max(200),
});

export const memberCreateSchema = credentialsSchema.extend({
  name: nameSchema,
  role: z.enum(["OWNER", "MANAGER"]).default("MANAGER"),
});

export const memberUpdateSchema = z.object({
  name: nameSchema.optional(),
  role: z.enum(["OWNER", "MANAGER"]).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(8, "Пароль короче 8 символов").max(200).optional(),
});

export type MemberCreate = z.infer<typeof memberCreateSchema>;
export type MemberUpdate = z.infer<typeof memberUpdateSchema>;
export type OptionCreate = z.infer<typeof optionCreateSchema>;
export type ProductCreate = z.infer<typeof productCreateSchema>;
export type ProductUpdate = z.infer<typeof productUpdateSchema>;
