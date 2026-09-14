"use client";

import { useEffect, useState } from "react";

import { formatPrice } from "@/lib/money";
import { fetchMyOrders, type PublicOrder } from "@/lib/orders/api";
import { useTelegram } from "@/lib/telegram/use-telegram";

type State =
  | { kind: "loading" }
  | { kind: "ready"; orders: PublicOrder[] }
  | { kind: "failed" }
  | { kind: "outside-telegram" };

/** Сколько ждём скрипт Telegram, прежде чем решить, что мы не в нём. */
const TELEGRAM_WAIT_MS = 3000;

const dateFormatter = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" });

/**
 * История заказов покупателя. Опознаёт его подпись Telegram, поэтому работает
 * только внутри мини-аппа: в обычном браузере подписи нет.
 */
export function OrdersList() {
  const webApp = useTelegram();
  const [state, setState] = useState<State>({ kind: "loading" });

  const initData = webApp?.initData ?? "";

  useEffect(() => {
    let isCurrent = true;

    if (!initData) {
      // Вне Telegram подпись не появится никогда, но ждать её пару секунд надо:
      // скрипт мини-аппа подгружается не мгновенно.
      const timer = setTimeout(() => {
        if (isCurrent) {
          setState({ kind: "outside-telegram" });
        }
      }, TELEGRAM_WAIT_MS);

      return () => {
        isCurrent = false;
        clearTimeout(timer);
      };
    }

    void fetchMyOrders(initData).then((orders) => {
      if (isCurrent) {
        setState(orders ? { kind: "ready", orders } : { kind: "failed" });
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [initData]);

  if (state.kind === "loading") {
    return <p className="mt-8 text-sm text-ink-muted">Загружаем заказы…</p>;
  }

  if (state.kind === "outside-telegram") {
    return <p className="mt-8 text-sm text-ink-muted">История заказов доступна внутри Telegram.</p>;
  }

  if (state.kind === "failed") {
    return <p className="mt-8 text-sm text-ink-muted">Не получилось загрузить заказы. Попробуйте позже.</p>;
  }

  if (state.orders.length === 0) {
    return <p className="mt-8 text-sm text-ink-muted">Заказов пока нет.</p>;
  }

  return (
    <ul className="mt-6 flex flex-col gap-3">
      {state.orders.map((order) => (
        <li key={order.token} className="rounded-2xl border border-line p-4">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm">{order.number}</p>
            <p className="text-xs text-ink-muted">{dateFormatter.format(new Date(order.createdAt))}</p>
          </div>

          <p className="mt-1 text-xs text-ink-muted">{order.statusLabel}</p>

          <ul className="mt-3 flex flex-col gap-1 border-t border-line pt-3">
            {order.items.map((item) => (
              <li key={`${item.productSlug}-${item.size}`} className="flex justify-between gap-3 text-xs">
                <span className="leading-snug">
                  {item.name}
                  <span className="text-ink-muted">
                    {" "}
                    · {item.size} × {item.quantity}
                  </span>
                </span>
                <span className="shrink-0 tabular-nums">{formatPrice(item.unitPrice * item.quantity)}</span>
              </li>
            ))}
          </ul>

          <p className="mt-3 flex justify-between text-sm">
            <span>Итого</span>
            <span className="tabular-nums">{formatPrice(order.total)}</span>
          </p>
        </li>
      ))}
    </ul>
  );
}
