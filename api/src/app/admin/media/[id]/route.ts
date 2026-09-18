import { MediaInUseError, removeMedia } from "@/lib/admin/media";
import { fail, notFound } from "@/lib/admin/respond";
import { requireMember } from "@/lib/auth/guard";

export const dynamic = "force-dynamic";

export async function DELETE(request: Request, { params }: RouteContext<"/admin/media/[id]">) {
  const guarded = await requireMember(request);

  if (!guarded.ok) {
    return guarded.response;
  }

  try {
    return (await removeMedia((await params).id)) ? new Response(null, { status: 204 }) : notFound();
  } catch (error) {
    if (error instanceof MediaInUseError) {
      return fail(`${error.message} Сначала уберите его оттуда.`, 409);
    }

    console.error("Админка: не удалось удалить файл", error);

    return fail("Не получилось удалить файл. Попробуйте ещё раз.", 500);
  }
}
