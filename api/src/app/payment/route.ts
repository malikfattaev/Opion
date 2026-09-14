import { jsonResponse, preflight } from "@/lib/cors";
import { formatCardNumber, getPaymentDetails } from "@/lib/payment";

/** Реквизиты для перевода. Номер карты живёт в переменных окружения API. */
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const details = getPaymentDetails();

  if (!details) {
    return jsonResponse(request, { payment: null });
  }

  return jsonResponse(request, {
    payment: {
      cardNumber: formatCardNumber(details.cardNumber),
      cardHolder: details.cardHolder ?? null,
      bank: details.bank ?? null,
    },
  });
}

export function OPTIONS(request: Request) {
  return preflight(request);
}
