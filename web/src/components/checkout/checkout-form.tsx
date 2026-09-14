"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

import { Container } from "@/components/layout/container";
import { useCart } from "@/lib/cart/use-cart";
import { apiUrl } from "@/lib/env";
import type { PaymentDetails } from "@/lib/payment";
import { formatPrice } from "@/lib/money";

const COPY_FEEDBACK_MS = 2000;

export function CheckoutForm({ payment }: { payment: PaymentDetails | null }) {
  const { lines, isReady, total, clear } = useCart();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<{ number: string | null } | null>(null);
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
      JSON.stringify(
        lines.map((line) => ({ productSlug: line.productSlug, size: line.size, quantity: line.quantity })),
      ),
    );

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiUrl}/orders`, { method: "POST", body: formData });
      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        setError(readMessage(payload) ?? "Не получилось отправить заказ. Попробуйте ещё раз.");

        return;
      }

      // Признак успеха ставим первым: очистка корзины опустошит экран оформления.
      setCompletedOrder({ number: readOrderNumber(payload) });
      clear();
    } catch {
      setError("Нет связи с сервером. Проверьте интернет и попробуйте ещё раз.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (completedOrder) {
    return (
      <Container className="pt-16 pb-24">
        <h1 className="font-display text-4xl leading-tight sm:text-5xl">Заказ отправлен</h1>
        <p className="mt-4 max-w-md text-sm text-ink-muted">
          {completedOrder.number ? (
            <>
              Номер заказа <span className="text-ink">{completedOrder.number}</span>.{" "}
            </>
          ) : null}
          Мы проверим перевод и напишем вам, чтобы подтвердить доставку.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-full bg-accent px-8 py-3 text-sm text-accent-contrast transition-opacity hover:opacity-90"
        >
          Вернуться в каталог
        </Link>
      </Container>
    );
  }

  // До чтения localStorage состав заказа неизвестен.
  if (!isReady) {
    return null;
  }

  if (lines.length === 0) {
    return (
      <Container className="pt-16 pb-24">
        <h1 className="font-display text-4xl leading-tight sm:text-5xl">Оформление</h1>
        <p className="mt-4 text-sm text-ink-muted">Корзина пуста. Сначала выберите вещи.</p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-full bg-accent px-8 py-3 text-sm text-accent-contrast transition-opacity hover:opacity-90"
        >
          В каталог
        </Link>
      </Container>
    );
  }

  return (
    <Container className="pt-16 pb-24">
      <h1 className="font-display text-4xl leading-tight sm:text-5xl">Оформление</h1>

      <form onSubmit={handleSubmit} className="mt-10 grid gap-12 lg:grid-cols-[1fr_22rem] lg:gap-16">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field name="firstName" label="Имя" autoComplete="given-name" required />
          <Field name="lastName" label="Фамилия" autoComplete="family-name" required />
          <Field
            name="phone"
            label="Телефон"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+7 900 000-00-00"
            required
            className="sm:col-span-2"
          />
          <Field
            name="address"
            label="Адрес доставки"
            autoComplete="street-address"
            placeholder="Город, улица, дом, квартира, индекс"
            required
            className="sm:col-span-2"
          />
          <Field
            name="comment"
            label="Комментарий"
            hint="Необязательно"
            multiline
            className="sm:col-span-2"
          />
        </div>

        <aside className="flex flex-col gap-6 rounded-3xl border border-line p-6">
          <div>
            <h2 className="text-xs tracking-widest text-ink-muted uppercase">Заказ</h2>

            <ul className="mt-4 flex flex-col gap-3">
              {lines.map((line) => (
                <li key={`${line.productSlug}-${line.size}`} className="flex justify-between gap-4 text-sm">
                  <span>
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

            <p className="mt-5 flex justify-between border-t border-line pt-5 text-base">
              <span>Итого</span>
              <span className="tabular-nums">{formatPrice(total)}</span>
            </p>
          </div>

          {payment ? (
            <div>
              <h2 className="text-xs tracking-widest text-ink-muted uppercase">Перевод</h2>

              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard?.writeText(payment.cardNumber.replace(/\s/g, ""));
                  setIsCopied(true);
                }}
                className="mt-3 w-full rounded-2xl border border-line px-4 py-3 text-left transition-colors hover:border-ink-muted"
              >
                <span className="block text-lg tracking-wider tabular-nums">{payment.cardNumber}</span>
                <span className="mt-1 block text-xs text-ink-muted">
                  {isCopied ? "Номер скопирован" : "Нажмите, чтобы скопировать"}
                </span>
              </button>

              {payment.cardHolder || payment.bank ? (
                <p className="mt-3 text-xs text-ink-muted">
                  {[payment.cardHolder, payment.bank].filter(Boolean).join(" · ")}
                </p>
              ) : null}

              <p className="mt-4 text-xs text-ink-muted">
                Переведите {formatPrice(total)} и приложите скриншот перевода. Он придёт нам вместе с заказом.
              </p>
            </div>
          ) : (
            <p className="text-sm text-ink-muted">
              Реквизиты для перевода ещё не настроены. Напишите нам, оформим заказ вручную.
            </p>
          )}

          <div>
            <label
              htmlFor="screenshot"
              className="block cursor-pointer rounded-2xl border border-dashed border-line px-4 py-4 text-center text-sm text-ink-muted transition-colors hover:border-ink-muted hover:text-ink"
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
          </div>

          <div className="mt-auto flex flex-col gap-4">
            {error ? <p className="text-sm text-ink">{error}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting || payment === null}
              className="rounded-full bg-accent py-3.5 text-sm text-accent-contrast transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
            >
              {isSubmitting ? "Отправляем…" : "Отправить заказ"}
            </button>
          </div>
        </aside>
      </form>
    </Container>
  );
}

function Field({
  name,
  label,
  hint,
  multiline = false,
  className = "",
  ...inputProps
}: {
  name: string;
  label: string;
  hint?: string;
  multiline?: boolean;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const fieldClassName =
    "mt-2 w-full rounded-2xl border border-line bg-transparent px-4 py-3 text-sm text-ink placeholder:text-ink-muted/60 transition-colors hover:border-ink-muted focus:border-ink focus:outline-none";

  return (
    <div className={className}>
      <label htmlFor={name} className="text-xs tracking-widest text-ink-muted uppercase">
        {label}
        {hint ? <span className="ml-2 normal-case tracking-normal">({hint})</span> : null}
      </label>

      {multiline ? (
        <textarea id={name} name={name} rows={3} className={`${fieldClassName} resize-none`} />
      ) : (
        <input id={name} name={name} className={fieldClassName} {...inputProps} />
      )}
    </div>
  );
}

function readMessage(payload: unknown): string | null {
  if (typeof payload !== "object" || payload === null) {
    return null;
  }

  const message = (payload as Record<string, unknown>).message;

  return typeof message === "string" ? message : null;
}

function readOrderNumber(payload: unknown): string | null {
  if (typeof payload === "object" && payload !== null) {
    const value = (payload as Record<string, unknown>).orderNumber;

    if (typeof value === "string") {
      return value;
    }
  }

  return null;
}
