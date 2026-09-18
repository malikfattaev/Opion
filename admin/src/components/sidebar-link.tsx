"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LayersIcon, SparkIcon, TagIcon } from "@/components/icons";
import type { NavigationItem, NavigationIcon } from "@/config/site";

/** Картинки лежат рядом с ссылкой: через границу сервер-клиент компоненты не передать. */
const ICONS: Record<NavigationIcon, (props: { className?: string }) => React.ReactElement> = {
  tag: TagIcon,
  layers: LayersIcon,
  spark: SparkIcon,
};

/** Активный раздел подсвечен: иначе непонятно, где находишься. */
export function SidebarLink({ item }: { item: NavigationItem }) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = ICONS[item.icon];

  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
        isActive ? "bg-surface text-ink" : "text-ink-muted hover:bg-surface/60 hover:text-ink"
      }`}
    >
      <Icon className="size-4.5 shrink-0" />

      <span className="text-sm whitespace-nowrap">{item.label}</span>
    </Link>
  );
}
