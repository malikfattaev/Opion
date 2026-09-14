import "server-only";

import { serverEnv } from "@/lib/env";

export type PaymentDetails = {
  cardNumber: string;
  cardHolder?: string;
  bank?: string;
};

/**
 * Реквизиты для перевода. `null` означает, что магазин ещё не настроен,
 * и страница оплаты скажет об этом честно, вместо пустых полей.
 */
export function getPaymentDetails(): PaymentDetails | null {
  const { PAYMENT_CARD_NUMBER, PAYMENT_CARD_HOLDER, PAYMENT_BANK } = serverEnv();

  if (!PAYMENT_CARD_NUMBER) {
    return null;
  }

  return {
    cardNumber: PAYMENT_CARD_NUMBER,
    cardHolder: PAYMENT_CARD_HOLDER,
    bank: PAYMENT_BANK,
  };
}

/** 2202202212345678 → 2202 2022 1234 5678: так номер проще перенести вручную. */
export function formatCardNumber(cardNumber: string): string {
  const digits = cardNumber.replace(/\D/g, "");

  return digits.length === 0 ? cardNumber : (digits.match(/.{1,4}/g) ?? [digits]).join(" ");
}
