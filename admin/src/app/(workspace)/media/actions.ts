"use server";

import { revalidatePath } from "next/cache";

import { mediaSort } from "@/config/site";
import { deleteMedia, readMedia, uploadMedia, type MediaFile } from "@/lib/api/media";

/** Раздел «Медиа» и выбор фото в карточке товара ходят в API через эти действия. */

export type UploadResult = { ok: true; file: MediaFile } | { ok: false; message: string };

export async function uploadMediaFile(formData: FormData): Promise<UploadResult> {
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Выберите файл." };
  }

  const result = await uploadMedia(file);

  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  revalidatePath("/media");

  return { ok: true, file: result.data };
}

export type MediaFormState = { message: string | null };

export async function removeMediaFile(
  _state: MediaFormState,
  formData: FormData,
): Promise<MediaFormState> {
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return { message: "Нечего удалять." };
  }

  const result = await deleteMedia(id);

  if (!result.ok) {
    return { message: result.message };
  }

  revalidatePath("/media");

  return { message: null };
}

/** Список для окна выбора: оно живёт в форме товара и грузит файлы само. */
export async function searchMediaFiles(query: string): Promise<MediaFile[]> {
  return (await readMedia(query.trim(), mediaSort("new"))).items;
}
