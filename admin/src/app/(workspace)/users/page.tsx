import type { Metadata } from "next";

import { MembersManager } from "@/components/members-manager";
import { EmptyState, PageHeader } from "@/components/ui";
import { listMembers, readMe } from "@/lib/api/members";

export const metadata: Metadata = { title: "Пользователи" };

export default async function UsersPage() {
  const me = await readMe();

  // Менеджеру API всё равно откажет, но экран ошибки вместо ответа - это грубо.
  if (me.role !== "OWNER") {
    return (
      <>
        <PageHeader title="Пользователи" />
        <EmptyState>Раздел открыт только владельцу.</EmptyState>
      </>
    );
  }

  return <MembersManager members={await listMembers()} currentId={me.id} />;
}
