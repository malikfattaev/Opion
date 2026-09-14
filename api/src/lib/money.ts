import { formatConfig } from "@/config/format";

/**
 * Цены хранятся целым числом сумов: тийины в обороте не используются,
 * поэтому дробной части нет и округлять нечего.
 */
export function formatPrice(amount: number): string {
  const formatted = new Intl.NumberFormat(formatConfig.locale, { maximumFractionDigits: 0 }).format(amount);

  return `${formatted} ${formatConfig.currencyLabel}`;
}
