import type { Metadata } from "next";

import { EmptyState, PageHeader } from "@/components/ui";
import { readCashflow } from "@/lib/api/finance";
import { formatMonth, formatNumber, formatPrice } from "@/lib/money";

export const metadata: Metadata = { title: "Кешфлоу" };

export default async function CashflowPage() {
  const months = await readCashflow();
  const peak = Math.max(...months.map((month) => month.revenue), 1);
  const revenue = months.reduce((sum, month) => sum + month.revenue, 0);
  const profit = months.reduce((sum, month) => sum + month.profit, 0);

  return (
    <>
      <PageHeader title="Кешфлоу" />

      {months.length === 0 ? (
        <EmptyState>Пока пусто.</EmptyState>
      ) : (
        <>
          <div className="mt-8 overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-xl text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs tracking-widest whitespace-nowrap text-ink-muted uppercase">
                  <th scope="col" className="px-4 py-3 font-normal">Месяц</th>
                  <th scope="col" className="w-1/4 px-4 py-3 font-normal">Доля</th>
                  <th scope="col" className="px-4 py-3 text-right font-normal">Заказов</th>
                  <th scope="col" className="px-4 py-3 text-right font-normal">Приход</th>
                  <th scope="col" className="px-4 py-3 text-right font-normal">Себестоимость</th>
                  <th scope="col" className="px-4 py-3 text-right font-normal">Прибыль</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-line">
                {months.map((month) => (
                  <tr key={month.month} className="transition-colors hover:bg-surface/50">
                    <td className="px-4 py-4 whitespace-nowrap">{formatMonth(month.month)}</td>

                    <td className="px-4 py-4">
                      <span aria-hidden className="block h-1.5 rounded-full bg-surface">
                        <span
                          className="block h-full rounded-full bg-accent"
                          style={{ width: `${Math.round((month.revenue / peak) * 100)}%` }}
                        />
                      </span>
                    </td>

                    <td className="px-4 py-4 text-right tabular-nums">{formatNumber(month.orders)}</td>

                    <td className="px-4 py-4 text-right whitespace-nowrap tabular-nums">
                      {formatPrice(month.revenue)}
                    </td>

                    <td className="px-4 py-4 text-right whitespace-nowrap text-ink-muted tabular-nums">
                      {formatPrice(month.cost)}
                    </td>

                    <td className="px-4 py-4 text-right whitespace-nowrap tabular-nums">
                      {formatPrice(month.profit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs text-ink-muted">
            Всего за период: {formatPrice(revenue)}, прибыль {formatPrice(profit)}. Считаем только
            подтверждённые заказы.
          </p>
        </>
      )}
    </>
  );
}
