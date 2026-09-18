import Image from "next/image";
import Link from "next/link";

import { logout } from "@/app/login/actions";
import { SidebarLink } from "@/components/sidebar-link";
import { adminConfig, adminNavigation, adminRoleLabels } from "@/config/site";
import type { Member } from "@/lib/api/session";

/**
 * Колонка разделов. На широком экране прибита слева во всю высоту,
 * на узком превращается в шапку с горизонтальным списком.
 */
export function Sidebar({ member }: { member: Member }) {
  return (
    <aside className="sticky top-0 z-20 flex flex-col gap-4 border-b border-line bg-canvas px-5 py-4 lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:gap-10 lg:border-r lg:border-b-0 lg:px-5 lg:py-8">
      <div className="flex items-center justify-between gap-4">
        <Link href="/products" aria-label={`${adminConfig.wordmark}, админка`} className="lg:px-3">
          <Image
            src={adminConfig.logo.src}
            alt={adminConfig.wordmark}
            width={adminConfig.logo.width}
            height={adminConfig.logo.height}
            priority
            style={{ height: adminConfig.logo.headerHeight, width: "auto" }}
          />
        </Link>

        <div className="lg:hidden">
          <LogoutButton />
        </div>
      </div>

      <nav aria-label="Разделы админки" className="-mx-5 overflow-x-auto px-5 lg:mx-0 lg:overflow-visible lg:px-0">
        <div className="flex flex-col gap-6">
          {adminNavigation.map((group) => (
            <div key={group.title}>
              <p className="hidden px-3 pb-2 text-xs tracking-widest text-ink-muted uppercase lg:block">
                {group.title}
              </p>

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

      <div className="mt-auto hidden border-t border-line px-3 pt-5 lg:block">
        <p className="text-sm">{member.name}</p>
        <p className="mt-0.5 text-xs text-ink-muted">{adminRoleLabels[member.role] ?? member.role}</p>

        <div className="mt-3">
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}

function LogoutButton() {
  return (
    <form action={logout}>
      <button type="submit" className="text-xs text-ink-muted underline underline-offset-4 hover:text-ink">
        Выйти
      </button>
    </form>
  );
}
