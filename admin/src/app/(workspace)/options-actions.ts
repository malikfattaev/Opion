"use server";

import { revalidatePath } from "next/cache";

import { createOption, deleteOption, updateOption, type OptionKind } from "@/lib/api/catalog";

export type OptionFormState = { message: string | null };

/**
 * Типы и стили правятся одними и теми же действиями: раздел приходит
 * скрытым полем формы, поэтому клиентский компонент один на оба списка.
 */
export async function saveOption(_state: OptionFormState, formData: FormData): Promise<OptionFormState> {
  const kind = readKind(formData);
  const id = readText(formData, "id");
  const input = { slug: readText(formData, "slug"), name: readText(formData, "name") };

  if (!input.slug || !input.name) {
    return { message: "Заполните адрес и название." };
  }

  const result = id ? await updateOption(kind, id, input) : await createOption(kind, input);

  if (!result.ok) {
    return { message: result.message };
  }

  revalidatePath(`/${kind}`);

  return { message: null };
}

export async function removeOption(_state: OptionFormState, formData: FormData): Promise<OptionFormState> {
  const kind = readKind(formData);
  const id = readText(formData, "id");

  if (!id) {
    return { message: "Нечего удалять." };
  }

  const result = await deleteOption(kind, id);

  if (!result.ok) {
    return { message: result.message };
  }

  revalidatePath(`/${kind}`);

  return { message: null };
}

function readKind(formData: FormData): OptionKind {
  return formData.get("kind") === "types" ? "types" : "styles";
}

function readText(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}
