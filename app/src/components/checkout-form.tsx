"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

import { PageTitle } from "@/components/page-title";
import { useCart } from "@/lib/cart/use-cart";
import { formatPrice } from "@/lib/money";
import { submitOrder, type PublicOrder } from "@/lib/orders/api";
import type { PaymentDetails } from "@/lib/payment";
import { haptic, hapticSuccess, useTelegram } from "@/lib/telegram/use-telegram";

const COPY_FEEDBACK_MS = 2000;

export function CheckoutForm({ payment }: { payment: PaymentDetails | null }) {
  const { lines, isReady, total, clear } = useCart();
  const webApp = useTelegram();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState<PublicOrder | null>(null);
  const [screenshotName, setScreenshotName] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) {
      return;
    }

    const timer = setTimeout(() => setIsCopied(false), COPY_FEEDBACK_MS);

    return () => clearTimeout(timer);
  }, [isCopied]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    formData.set(
      "items",
      JSON.stringify(lines.map((line) => ({ productSlug: line.productSlug, size: line.size, quantity: line.quantity }))),
    );

    // Подписанные данные Telegram: API проверит подпись и укажет в заказе,
    // от какого аккаунта он пришёл.
    if (webApp?.initData) {
      formData.set("initData", webApp.initData);
    }

    setError(null);
    setIsSubmitting(true);

    const result = await submitOrder(formData);

    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.message);

      return;
    }

    hapticSuccess();
    setCompleted(result.order);
    clear();
  };

  if (completed) {
    return (
      <div className="flex flex-col items-center px-5 pt-20 text-center">
        <p className="font-display text-3xl leading-tight">Заказ отправлен</p>
        <p className="mt-3 max-w-xs text-sm text-ink-muted">
          Номер заказа <span className="text-ink">{completed.number}</span>. Проверим перевод и подтвердим его.
        </p>
        <p className="mt-1 text-sm text-ink-muted">
          Статус: <span className="text-ink">{completed.statusLabel}</span>
        </p>
        <Link href="/orders" className="mt-6 rounded-full bg-accent px-8 py-3 text-sm text-accent-contrast">
          Мои заказы
        </Link>
      </div>
    );
  }

  if (!isReady) {
    return null;
  }

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center px-5 pt-20 text-center">
        <p className="font-display text-2xl leading-tight">Корзина пуста</p>
        <p className="mt-2 text-sm text-ink-muted">Выберите что-нибудь в каталоге.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex min-h-full flex-col px-5">
      <PageTitle>Оформление</PageTitle>

      <div className="mt-6 flex flex-col gap-4">
        <Field name="firstName" label="Имя" autoComplete="given-name" required />
        <Field name="lastName" label="Фамилия" autoComplete="family-name" required />
        <Field
          name="phone"
          label="Телефон"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+998 90 000-00-00"
          required
        />
        <Field
          name="address"
          label="Адрес доставки"
          autoComplete="street-address"
          placeholder="Город, улица, дом, квартира"
          required
        />
        <Field name="comment" label="Комментарий" hint="Необязательно" multiline />
      </div>

      <div className="mt-8 rounded-2xl border border-line p-4">
        <h2 className="text-xs tracking-widest text-ink-muted uppercase">Заказ</h2>

        <ul className="mt-3 flex flex-col gap-2">
          {lines.map((line) => (
            <li key={`${line.productSlug}-${line.size}`} className="flex justify-between gap-3 text-sm">
              <span className="leading-snug">
                {line.name}
                <span className="text-ink-muted">
                  {" "}
                  · {line.size} × {line.quantity}
                </span>
              </span>
              <span className="shrink-0 tabular-nums">{formatPrice(line.price * line.quantity)}</span>
            </li>
          ))}
        </ul>

        <p className="mt-4 flex justify-between border-t border-line pt-4 text-base">
          <span>Итого</span>
          <span className="tabular-nums">{formatPrice(total)}</span>
        </p>
      </div>

      {payment ? (
        <div className="mt-6">
          <h2 className="text-xs tracking-widest text-ink-muted uppercase">Перевод</h2>

          <button
            type="button"
            onClick={() => {
              void navigator.clipboard?.writeText(payment.cardNumber.replace(/\s/g, ""));
              haptic();
              setIsCopied(true);
            }}
            className="mt-3 w-full rounded-2xl border border-line px-4 py-3 text-left active:bg-surface"
          >
            <span className="block text-lg tracking-wider tabular-nums">{payment.cardNumber}</span>
            <span className="mt-1 block text-xs text-ink-muted">
              {isCopied ? "Номер скопирован" : "Нажмите, чтобы скопировать"}
            </span>
          </button>

          {payment.cardHolder || payment.bank ? (
            <p className="mt-2 text-xs text-ink-muted">
              {[payment.cardHolder, payment.bank].filter(Boolean).join(" · ")}
            </p>
          ) : null}

          <p className="mt-3 text-xs text-ink-muted">
            Переведите {formatPrice(total)} и приложите скриншот перевода. Он придёт нам вместе с заказом.
          </p>
        </div>
      ) : (
        <p className="mt-6 text-sm text-ink-muted">
          Реквизиты для перевода ещё не настроены. Напишите нам, оформим заказ вручную.
        </p>
      )}

      <label
        htmlFor="screenshot"
        className="mt-6 block rounded-2xl border border-dashed border-line px-4 py-4 text-center text-sm text-ink-muted active:bg-surface"
      >
        {screenshotName ?? "Приложить скриншот перевода"}
      </label>
      <input
        id="screenshot"
        name="screenshot"
        type="file"
        accept="image/*"
        required
        onChange={(event) => setScreenshotName(event.currentTarget.files?.[0]?.name ?? null)}
        className="sr-only"
      />

      <div className="-mx-5 mt-8 border-t border-line px-5 pt-4">
        {error ? <p className="mb-3 text-sm text-ink">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting || payment === null}
          className="w-full rounded-full bg-accent py-3.5 text-sm text-accent-contrast active:opacity-80 disabled:opacity-30"
        >
          {isSubmitting ? "Отправляем…" : "Отправить заказ"}
        </button>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  hint,
  multiline = false,
  ...inputProps
}: {
  name: string;
  label: string;
  hint?: string;
  multiline?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const className =
    "mt-2 w-full rounded-2xl border border-line bg-transparent px-4 py-3 text-base text-ink placeholder:text-ink-muted/60 focus:border-ink focus:outline-none";

  return (
    <div>
      <label htmlFor={name} className="text-xs tracking-widest text-ink-muted uppercase">
        {label}
        {hint ? <span className="ml-2 normal-case tracking-normal">({hint})</span> : null}
      </label>

      {multiline ? (
        <textarea id={name} name={name} rows={3} className={`${className} resize-none`} />
      ) : (
        <input id={name} name={name} className={className} {...inputProps} />
      )}
    </div>
  );
}
