import { requireMember } from "@/lib/auth/guard";
import { ok } from "@/lib/admin/respond";

export const dynamic = "force-dynamic";

/** Кто вошёл. Админка спрашивает это, чтобы показать имя и права. */
export async function GET(request: Request) {
  const guarded = await requireMember(request);

  return guarded.ok ? ok({ member: guarded.member }) : guarded.response;
}
