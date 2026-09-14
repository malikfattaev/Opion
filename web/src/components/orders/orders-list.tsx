"use client";

import { useEffect, useState } from "react";

import { Container } from "@/components/layout/container";
import { formatPrice } from "@/lib/money";
import { fetchOrderByToken, type PublicOrder } from "@/lib/orders/api";
import { useOrderTokens } from "@/lib/orders/use-order-tokens";

const dateFormatter = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" });

/**
 * История заказов этого браузера. Токены выдаются при оформлении и лежат
 * в localStorage, поэтому на другом устройстве список будет пустым.
 */
export function OrdersList() {
  const { tokens, isReady } = useOrderTokens();
  const [orders, setOrders] = useState<PublicOrder[] | null>(null);

  useEffect(() => {
    if (!isReady || tokens.length === 0) {
      return;
    }

    let isCurrent = true;

    void Promise.all(tokens.map(fetchOrderByToken)).then((loaded) => {
      if (isCurrent) {
        setOrders(loaded.filter((order): order is PublicOrder => order !== null));
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [isReady, tokens]);

  return (
    <Container className="pt-16 pb-24">
      <h1 className="font-display text-4xl leading-tight sm:text-5xl">Мои заказы</h1>

      <Body isReady={isReady} hasTokens={tokens.length > 0} orders={orders} />
    </Container>
  );
}

function Body({
  isReady,
  hasTokens,
  orders,
}: {
  isReady: boolean;
  hasTokens: boolean;
  orders: PublicOrder[] | null;
}) {
  // До чтения localStorage список заказов неизвестен.
  if (!isReady) {
    return null;
  }

  if (!hasTokens) {
    return (
      <p className="mt-4 max-w-md text-sm text-ink-muted">
        Заказов пока нет. Они появятся здесь после оформления и сохранятся в этом браузере.
      </p>
    );
  }

  if (orders === null) {
    return <p className="mt-4 text-sm text-ink-muted">Загружаем заказы…</p>;
  }

  if (orders.length === 0) {
    return <p className="mt-4 text-sm text-ink-muted">Не получилось загрузить заказы. Попробуйте позже.</p>;
  }

  return (
    <ul className="mt-10 flex flex-col gap-4">
      {orders.map((order) => (
        <li key={order.token} className="rounded-3xl border border-line p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <p className="text-sm">{order.number}</p>
            <p className="text-xs text-ink-muted">{dateFormatter.format(new Date(order.createdAt))}</p>
          </div>

          <p className="mt-1 text-xs text-ink-muted">{order.statusLabel}</p>

          <ul className="mt-5 flex flex-col gap-2 border-t border-line pt-5">
            {order.items.map((item) => (
              <li key={`${item.productSlug}-${item.size}`} className="flex justify-between gap-4 text-sm">
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

          <p className="mt-5 flex justify-between border-t border-line pt-5 text-base">
            <span>Итого</span>
            <span className="tabular-nums">{formatPrice(order.total)}</span>
          </p>
        </li>
      ))}
    </ul>
  );
}
