"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  ChartIcon,
  GaugeIcon,
  ImageIcon,
  LayersIcon,
  SparkIcon,
  TagIcon,
  UsersIcon,
  WalletIcon,
} from "@/components/icons";
import type { NavigationItem, NavigationIcon } from "@/config/site";

/** Картинки лежат рядом с ссылкой: через границу сервер-клиент компоненты не передать. */
const ICONS: Record<NavigationIcon, (props: { className?: string }) => React.ReactElement> = {
  gauge: GaugeIcon,
  tag: TagIcon,
  layers: LayersIcon,
  spark: SparkIcon,
  image: ImageIcon,
  wallet: WalletIcon,
  chart: ChartIcon,
  users: UsersIcon,
};

/** Активный раздел подсвечен: иначе непонятно, где находишься. */
export function SidebarLink({ item }: { item: NavigationItem }) {
  const pathname = usePathname();
  const Icon = ICONS[item.icon];

  // У панели управления адрес корневой, и «начинается с /» подошло бы всему.
  const isActive = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);

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
