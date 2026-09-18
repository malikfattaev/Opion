import type { Metadata } from "next";

import { EmptyState, PageHeader } from "@/components/ui";
import { listSales } from "@/lib/api/finance";
import { formatDate, formatNumber, formatPrice } from "@/lib/money";

export const metadata: Metadata = { title: "Продажи" };

const SOURCE_LABELS: Record<string, string> = {
  WEBSITE: "сайт",
  MINI_APP: "мини-апп",
  MANUAL: "вручную",
};

export default async function SalesPage() {
  const sales = await listSales();

  return (
    <>
      <PageHeader title="Продажи" />

      {sales.length === 0 ? (
        <EmptyState>Пока пусто.</EmptyState>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-2xl text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs tracking-widest whitespace-nowrap text-ink-muted uppercase">
                <th scope="col" className="px-4 py-3 font-normal">Заказ</th>
                <th scope="col" className="w-2/5 px-4 py-3 font-normal">Покупатель</th>
                <th scope="col" className="px-4 py-3 font-normal">Состав</th>
                <th scope="col" className="px-4 py-3 text-right font-normal">Сумма</th>
                <th scope="col" className="px-4 py-3 text-right font-normal">Прибыль</th>
                <th scope="col" className="px-4 py-3 font-normal">Статус</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-line">
              {sales.map((sale) => (
                <tr key={sale.id} className="transition-colors hover:bg-surface/50">
                  <td className="px-4 py-4">
                    <p className="font-mono text-xs whitespace-nowrap">{sale.number}</p>
                    <p className="mt-1 text-xs whitespace-nowrap text-ink-muted">{formatDate(sale.createdAt)}</p>
                  </td>

                  <td className="px-4 py-4">
                    <p>{sale.customer}</p>
                    <p className="mt-1 text-xs text-ink-muted">
                      {sale.phone}
                      {sale.telegramUsername ? ` · @${sale.telegramUsername}` : ""}
                      {` · ${SOURCE_LABELS[sale.source] ?? sale.source}`}
                    </p>
                  </td>

                  <td className="px-4 py-4">
                    <ul className="flex flex-col gap-1">
                      {sale.items.map((item, index) => (
                        <li key={`${sale.id}-${index}`} className="text-xs text-ink-muted">
                          <span className="font-mono">{item.sku}</span> {item.name}, {item.size} × {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </td>

                  <td className="px-4 py-4 text-right whitespace-nowrap tabular-nums">{formatPrice(sale.total)}</td>

                  <td className="px-4 py-4 text-right whitespace-nowrap text-ink-muted tabular-nums">
                    {formatPrice(sale.profit)}
                  </td>

                  <td className="px-4 py-4 text-xs whitespace-nowrap text-ink-muted">{sale.statusLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sales.length === 0 ? null : (
        <p className="mt-4 text-xs text-ink-muted">Показаны последние {formatNumber(sales.length)} заказов.</p>
      )}
    </>
  );
}
