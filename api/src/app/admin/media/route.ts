import { addMedia, listMedia, mediaSort } from "@/lib/admin/media";
import { fail, ok } from "@/lib/admin/respond";
import { requireMember } from "@/lib/auth/guard";
import { BrokenImageError, BucketNotConfiguredError, MAX_IMAGE_BYTES } from "@/lib/storage/images";

export const dynamic = "force-dynamic";

/** Галерея загруженных файлов: и для раздела «Медиа», и для выбора в карточке товара. */
export async function GET(request: Request) {
  const guarded = await requireMember(request);

  if (!guarded.ok) {
    return guarded.response;
  }

  const params = new URL(request.url).searchParams;
  const query = (params.get("q") ?? "").trim();

  return ok(await listMedia(query, mediaSort(params.get("sort"))));
}

/** Загрузка файла. Ответ - карточка галереи: её же кладут в форму товара. */
export async function POST(request: Request) {
  const guarded = await requireMember(request);

  if (!guarded.ok) {
    return guarded.response;
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return fail("Не удалось прочитать файл.", 400);
  }

  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return fail("Выберите файл.", 400);
  }

  if (!file.type.startsWith("image/")) {
    return fail("Это не изображение.", 415);
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return fail("Файл тяжелее 10 МБ.", 413);
  }

  try {
    return ok({ file: await addMedia(file) }, { status: 201 });
  } catch (error) {
    if (error instanceof BrokenImageError) {
      return fail(error.message, 415);
    }

    if (error instanceof BucketNotConfiguredError) {
      console.error("Админка: бакет не настроен", error);

      return fail("Хранилище картинок не настроено.", 503);
    }

    console.error("Админка: не удалось загрузить фото", error);

    return fail("Не получилось загрузить файл. Попробуйте ещё раз.", 500);
  }
}
