import { ok } from "@/lib/admin/respond";
import { readStats } from "@/lib/admin/stats";
import { requireMember } from "@/lib/auth/guard";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const guarded = await requireMember(request);

  return guarded.ok ? ok({ stats: await readStats() }) : guarded.response;
}
