import Image from "next/image";
import Link from "next/link";

import { logout } from "@/app/login/actions";
import { NavigationLink } from "@/components/navigation-link";
import { adminConfig, adminNavigation } from "@/config/site";
import type { Member } from "@/lib/api/session";

export function WorkspaceHeader({ member }: { member: Member }) {
  return (
    <header className="flex flex-wrap items-center gap-x-8 gap-y-4 border-b border-line py-6">
      <Link href="/products" aria-label={`${adminConfig.wordmark}, админка`}>
        <Image
          src={adminConfig.logo.src}
          alt={adminConfig.wordmark}
          width={adminConfig.logo.width}
          height={adminConfig.logo.height}
          priority
          style={{ height: adminConfig.logo.headerHeight, width: "auto" }}
        />
      </Link>

      <nav aria-label="Разделы админки">
        <ul className="flex items-center gap-6">
          {adminNavigation.map((item) => (
            <li key={item.href}>
              <NavigationLink href={item.href}>{item.label}</NavigationLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="ml-auto flex items-center gap-4">
        <span className="text-sm text-ink-muted">{member.name}</span>

        <form action={logout}>
          <button type="submit" className="text-sm text-ink-muted underline underline-offset-4 hover:text-ink">
            Выйти
          </button>
        </form>
      </div>
    </header>
  );
}
