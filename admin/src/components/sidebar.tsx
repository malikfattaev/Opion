import Image from "next/image";
import Link from "next/link";

import { logout } from "@/app/login/actions";
import { LogoutIcon } from "@/components/icons";
import { SidebarLink } from "@/components/sidebar-link";
import { adminConfig, adminNavigation, adminRoleLabels, type NavigationGroup } from "@/config/site";
import type { Member } from "@/lib/api/session";

/**
 * Колонка разделов. На широком экране прибита слева во всю высоту,
 * на узком превращается в шапку с горизонтальным списком.
 */
export function Sidebar({ member }: { member: Member }) {
  return (
    <aside className="sticky top-0 z-20 flex flex-col gap-4 border-b border-line bg-canvas px-5 py-4 lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:gap-8 lg:border-r lg:border-b-0 lg:px-5 lg:py-8">
      <div className="flex items-center justify-between gap-4 lg:flex-col lg:gap-6">
        <Link href="/" aria-label={`${adminConfig.wordmark}, админка`}>
          <Image
            src={adminConfig.logo.src}
            alt={adminConfig.wordmark}
            width={adminConfig.logo.width}
            height={adminConfig.logo.height}
            priority
            style={{ height: adminConfig.logo.sidebarHeight, width: "auto" }}
          />
        </Link>

        <div className="flex items-center gap-3 lg:hidden">
          <Avatar name={member.name} />
          <LogoutButton />
        </div>

        {/* Короткая черта: отделяет знак от разделов, но не режет колонку насквозь. */}
        <span aria-hidden className="hidden h-px w-24 bg-line lg:block" />
      </div>

      <nav aria-label="Разделы админки" className="-mx-5 overflow-x-auto px-5 lg:mx-0 lg:overflow-visible lg:px-0">
        <div className="flex items-center gap-6 lg:flex-col lg:items-stretch lg:gap-6">
          {visibleGroups(member.role).map((group, index) => (
            <div key={group.title ?? index}>
              {group.title ? (
                <p className="hidden px-3 pb-2 text-xs tracking-widest text-ink-muted uppercase lg:block">
                  {group.title}
                </p>
              ) : null}

              <ul className="flex items-center gap-1 lg:flex-col lg:items-stretch">
                {group.items.map((item) => (
                  <li key={item.href} className="lg:w-full">
                    <SidebarLink item={item} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      <div className="mt-auto hidden items-center gap-3 border-t border-line pt-5 lg:flex">
        <Avatar name={member.name} />

        <div className="min-w-0">
          <p className="truncate text-sm">{member.name}</p>
          <p className="text-xs text-ink-muted">{adminRoleLabels[member.role] ?? member.role}</p>
        </div>

        <div className="ml-auto">
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}

/** Менеджеру не показываем то, куда его всё равно не пустят. */
function visibleGroups(role: Member["role"]): NavigationGroup[] {
  return adminNavigation
    .map((group) => ({ ...group, items: group.items.filter((item) => !item.ownerOnly || role === "OWNER") }))
    .filter((group) => group.items.length > 0);
}

/** Фотографий у команды нет, поэтому в кружке первая буква имени. */
function Avatar({ name }: { name: string }) {
  return (
    <span
      aria-hidden
      className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-sm"
    >
      {[...name.trim()][0]?.toUpperCase() ?? "?"}
    </span>
  );
}

function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        aria-label="Выйти"
        title="Выйти"
        className="flex size-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface hover:text-ink"
      >
        <LogoutIcon className="size-4.5" />
      </button>
    </form>
  );
}
