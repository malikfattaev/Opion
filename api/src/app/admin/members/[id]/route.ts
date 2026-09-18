import { deleteMember, isLastOwner, updateMember } from "@/lib/admin/members";
import { fail, notFound, ok, parseBody } from "@/lib/admin/respond";
import { memberUpdateSchema } from "@/lib/admin/schema";
import { requireOwner } from "@/lib/auth/guard";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: RouteContext<"/admin/members/[id]">) {
  const guarded = await requireOwner(request);

  if (!guarded.ok) {
    return guarded.response;
  }

  const parsed = await parseBody(request, memberUpdateSchema);

  if (!parsed.ok) {
    return parsed.response;
  }

  const { id } = await params;

  // Иначе владелец способен снять с себя права и запереть раздел «Пользователи».
  if (id === guarded.member.id && (parsed.data.role === "MANAGER" || parsed.data.isActive === false)) {
    return fail("Нельзя снять доступ с самого себя.", 409);
  }

  if (parsed.data.role === "MANAGER" && (await isLastOwner(id))) {
    return fail("Это единственный владелец.", 409);
  }

  const member = await updateMember(id, parsed.data);

  return member ? ok({ member }) : notFound();
}

export async function DELETE(request: Request, { params }: RouteContext<"/admin/members/[id]">) {
  const guarded = await requireOwner(request);

  if (!guarded.ok) {
    return guarded.response;
  }

  const { id } = await params;

  if (id === guarded.member.id) {
    return fail("Нельзя удалить самого себя.", 409);
  }

  if (await isLastOwner(id)) {
    return fail("Это единственный владелец.", 409);
  }

  return (await deleteMember(id)) ? new Response(null, { status: 204 }) : notFound();
}
