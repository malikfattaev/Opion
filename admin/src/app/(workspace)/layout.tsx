import { redirect } from "next/navigation";
import { z } from "zod";

import { WorkspaceHeader } from "@/components/workspace-header";
import { apiRequest } from "@/lib/api/client";
import { memberSchema, sessionToken } from "@/lib/api/session";

/**
 * Общая оболочка разделов. Здесь же проверка входа: страницы под ней
 * рисуются только для живой сессии.
 */
export default async function WorkspaceLayout({ children }: LayoutProps<"/">) {
  if (!(await sessionToken())) {
    redirect("/login");
  }

  const result = await apiRequest("/admin/me", z.object({ member: memberSchema }), {});

  if (!result.ok) {
    redirect("/login");
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-24">
      <WorkspaceHeader member={result.data.member} />
      <main>{children}</main>
    </div>
  );
}
