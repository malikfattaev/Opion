import { siteConfig } from "@/config/site";

/**
 * Цены хранятся целым числом сумов. Тийины в обороте не используются, поэтому
 * дробной части у цены нет и округлять нечего.
 */
export function formatPrice(amount: number): string {
  const formatted = new Intl.NumberFormat(siteConfig.locale, { maximumFractionDigits: 0 }).format(amount);

  return `${formatted} ${siteConfig.currencyLabel}`;
}
