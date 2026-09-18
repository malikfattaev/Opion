import { readCashflow } from "@/lib/admin/finance";
import { ok } from "@/lib/admin/respond";
import { requireMember } from "@/lib/auth/guard";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const guarded = await requireMember(request);

  return guarded.ok ? ok({ months: await readCashflow() }) : guarded.response;
}
