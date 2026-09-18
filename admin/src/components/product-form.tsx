"use client";

import { useActionState } from "react";

import { saveProduct, type ProductFormState } from "@/app/(workspace)/products/actions";
import { ImageUploader } from "@/components/image-uploader";
import { ErrorText, Field, GhostLink, inputClassName, PrimaryButton, Select } from "@/components/ui";
import { adminConfig } from "@/config/site";
import type { AdminOption, AdminProduct } from "@/lib/api/catalog";

const INITIAL: ProductFormState = { message: null };

export function ProductForm({
  product,
  types,
  styles,
}: {
  product?: AdminProduct;
  types: readonly AdminOption[];
  styles: readonly AdminOption[];
}) {
  const [state, formAction, isPending] = useActionState(saveProduct, INITIAL);

  return (
    <form action={formAction} className="mt-10 grid gap-10 lg:grid-cols-[1fr_20rem]">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}

      <div className="flex flex-col gap-6">
        <Field label="Название">
          <input name="name" defaultValue={product?.name} required className={inputClassName} />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Артикул">
            <input
              name="sku"
              defaultValue={product?.sku}
              required
              placeholder="OP-0001"
              className={`${inputClassName} font-mono`}
            />
          </Field>

          <Field label="Адрес" hint="латиницей">
            <input
              name="slug"
              defaultValue={product?.slug}
              required
              placeholder="oversize-hoodie"
              className={inputClassName}
            />
          </Field>
        </div>

        <Field label="Описание">
          <textarea
            name="description"
            defaultValue={product?.description}
            rows={4}
            className={`${inputClassName} resize-y`}
          />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label={`Цена, ${adminConfig.currencyLabel}`}>
            <input
              name="price"
              inputMode="numeric"
              defaultValue={product?.price}
              required
              placeholder="450000"
              className={inputClassName}
            />
          </Field>

          <Field label="Старая цена" hint="необязательно">
            <input
              name="comparePrice"
              inputMode="numeric"
              defaultValue={product?.comparePrice ?? ""}
              placeholder="620000"
              className={inputClassName}
            />
          </Field>
        </div>

        <Field label="Себестоимость" hint="только для нас, в каталог не уходит">
          <input
            name="costPrice"
            inputMode="numeric"
            defaultValue={product?.costPrice ?? ""}
            placeholder="210000"
            className={inputClassName}
          />
        </Field>

        <Field label="Размеры" hint="по одному в строке">
          <textarea
            name="sizes"
            defaultValue={product?.sizes.join("\n")}
            rows={4}
            required
            placeholder={"S\nM\nL"}
            className={`${inputClassName} resize-y`}
          />
        </Field>

        <Field label="Фото">
          <ImageUploader images={product?.images} />
        </Field>
      </div>

      <div className="flex h-fit flex-col gap-6 rounded-2xl border border-line p-6">
        <Field label="Тип">
          <Select name="typeSlug" defaultValue={product?.typeSlug ?? ""} required>
            <option value="" disabled>
              Выберите тип
            </option>
            {types.map((type) => (
              <option key={type.id} value={type.slug}>
                {type.name}
              </option>
            ))}
          </Select>
        </Field>

        <fieldset>
          <legend className="text-xs tracking-widest text-ink-muted uppercase">Стили</legend>

          <div className="mt-3 flex flex-col gap-2">
            {styles.length === 0 ? (
              <p className="text-sm text-ink-muted">Стилей пока нет.</p>
            ) : (
              styles.map((style) => (
                <label key={style.id} className="flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    name="styleSlugs"
                    value={style.slug}
                    defaultChecked={product?.styleSlugs.includes(style.slug)}
                    className="size-4 accent-[var(--color-accent)]"
                  />
                  {style.name}
                </label>
              ))
            )}
          </div>
        </fieldset>

        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            name="isPublished"
            defaultChecked={product?.isPublished ?? true}
            className="size-4 accent-[var(--color-accent)]"
          />
          Показывать на витрине
        </label>

        <ErrorText>{state.message}</ErrorText>

        <div className="flex items-center gap-3">
          <PrimaryButton type="submit" disabled={isPending}>
            {isPending ? "Сохраняем…" : "Сохранить"}
          </PrimaryButton>

          <GhostLink href="/products">Отмена</GhostLink>
        </div>
      </div>
    </form>
  );
}
