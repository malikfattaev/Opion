import type { Metadata } from "next";

import { PageHeader } from "@/components/ui";
import { readStats } from "@/lib/api/stats";
import { formatNumber, formatPrice } from "@/lib/money";

export const metadata: Metadata = { title: "Панель управления" };

export default async function DashboardPage() {
  const stats = await readStats();

  return (
    <>
      <PageHeader title="Панель управления" />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Tile title="На витрине" value={formatNumber(stats.products.published)} note={hiddenNote(stats.products.hidden)} />
        <Tile title="Продано вещей" value={formatNumber(stats.sales.items)} note={`заказов: ${formatNumber(stats.sales.orders)}`} />
        <Tile title="Ждут подтверждения" value={formatNumber(stats.orders.awaiting)} note={`всего заказов: ${formatNumber(stats.orders.total)}`} />
        <Tile title="Выручка" value={formatPrice(stats.sales.revenue)} note={`за 30 дней: ${formatPrice(stats.sales.lastMonthRevenue)}`} />
        <Tile title="Прибыль" value={formatPrice(stats.sales.profit)} note={`себестоимость: ${formatPrice(stats.sales.cost)}`} />
        <Tile title="Средний чек" value={formatPrice(stats.sales.averageCheck)} />
        <Tile title="Разделы" value={`${formatNumber(stats.catalog.types)} / ${formatNumber(stats.catalog.styles)}`} note="типов и стилей" />
      </div>
    </>
  );
}

function Tile({ title, value, note }: { title: string; value: string; note?: string }) {
  return (
    <div className="rounded-2xl border border-line p-6">
      <p className="text-xs tracking-widest text-ink-muted uppercase">{title}</p>
      <p className="mt-4 font-display text-3xl leading-tight tabular-nums">{value}</p>
      {note ? <p className="mt-2 text-xs text-ink-muted">{note}</p> : null}
    </div>
  );
}

function hiddenNote(hidden: number): string | undefined {
  return hidden === 0 ? undefined : `скрыто: ${formatNumber(hidden)}`;
}
