import type { Metadata } from "next";

import { CheckoutForm } from "@/components/checkout/checkout-form";
import { getPaymentDetails } from "@/lib/payment";

export const metadata: Metadata = { title: "Оформление заказа" };

/** Реквизиты запрашиваются у API при каждом заходе, а не на этапе сборки. */
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const payment = await getPaymentDetails();

  return <CheckoutForm payment={payment} />;
}
