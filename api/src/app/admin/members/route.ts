import { createMember, listMembers } from "@/lib/admin/members";
import { fail, isUniqueViolation, ok, parseBody } from "@/lib/admin/respond";
import { memberCreateSchema } from "@/lib/admin/schema";
import { requireOwner } from "@/lib/auth/guard";

export const dynamic = "force-dynamic";

/** Раздел «Пользователи» целиком принадлежит владельцу: менеджер сюда не заходит. */
export async function GET(request: Request) {
  const guarded = await requireOwner(request);

  return guarded.ok ? ok({ members: await listMembers() }) : guarded.response;
}

export async function POST(request: Request) {
  const guarded = await requireOwner(request);

  if (!guarded.ok) {
    return guarded.response;
  }

  const parsed = await parseBody(request, memberCreateSchema);

  if (!parsed.ok) {
    return parsed.response;
  }

  try {
    return ok({ member: await createMember(parsed.data) }, { status: 201 });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return fail("Такой логин уже занят.", 409);
    }

    console.error("Админка: не удалось завести пользователя", error);

    return fail("Не получилось сохранить. Попробуйте ещё раз.", 500);
  }
}
