import { redirect } from "next/navigation";
import { z } from "zod";

import { Sidebar } from "@/components/sidebar";
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
    <div className="lg:pl-64">
      <Sidebar member={result.data.member} />

      <main className="mx-auto w-full max-w-6xl px-5 pb-24 lg:px-10">{children}</main>
    </div>
  );
}
