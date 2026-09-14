import { appConfig } from "@/config/site";

/** Цены целые, в сумах: тийины в обороте не используются. */
export function formatPrice(amount: number): string {
  const formatted = new Intl.NumberFormat(appConfig.locale, { maximumFractionDigits: 0 }).format(amount);

  return `${formatted} ${appConfig.currencyLabel}`;
}
