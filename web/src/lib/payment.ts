import { z } from "zod";

import { apiUrl } from "@/lib/env";

/** Реквизиты приходят из API: номер карты хранится в его переменных окружения. */
const paymentSchema = z.object({
  payment: z
    .object({
      cardNumber: z.string(),
      cardHolder: z.string().nullable(),
      bank: z.string().nullable(),
    })
    .nullable(),
});

export type PaymentDetails = NonNullable<z.infer<typeof paymentSchema>["payment"]>;

export async function getPaymentDetails(): Promise<PaymentDetails | null> {
  try {
    const response = await fetch(`${apiUrl}/payment`, { cache: "no-store" });

    if (!response.ok) {
      return null;
    }

    const parsed = paymentSchema.safeParse(await response.json());

    return parsed.success ? parsed.data.payment : null;
  } catch {
    return null;
  }
}
