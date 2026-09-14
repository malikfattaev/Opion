import { siteConfig } from "@/config/site";

/**
 * Цены хранятся в минорных единицах (копейках) целым числом — так не возникает
 * ошибок округления, неизбежных для дробных чисел. Наружу они выходят только
 * через эти функции.
 */
const MINOR_UNITS_IN_MAJOR = 100;

export function toMinorUnits(amount: number): number {
  return Math.round(amount * MINOR_UNITS_IN_MAJOR);
}

export function formatPrice(
  minorAmount: number,
  { currency = siteConfig.currency, locale = siteConfig.locale }: { currency?: string; locale?: string } = {},
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    // Круглые суммы показываем без копеек: «7 900 ₽», а не «7 900,00 ₽».
    maximumFractionDigits: minorAmount % MINOR_UNITS_IN_MAJOR === 0 ? 0 : 2,
  }).format(minorAmount / MINOR_UNITS_IN_MAJOR);
}
