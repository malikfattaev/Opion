import type { Metadata } from "next";

import { CheckoutForm, type PaymentView } from "@/components/checkout/checkout-form";
import { formatCardNumber, getPaymentDetails } from "@/lib/payment";

export const metadata: Metadata = { title: "Оформление заказа" };

/** Реквизиты читаются из переменных окружения при каждом запросе, не при сборке. */
export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  const details = getPaymentDetails();

  const payment: PaymentView = details
    ? {
        cardNumber: formatCardNumber(details.cardNumber),
        cardHolder: details.cardHolder,
        bank: details.bank,
      }
    : null;

  return <CheckoutForm payment={payment} />;
}
