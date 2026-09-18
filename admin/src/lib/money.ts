import { adminConfig } from "@/config/site";

/** Числа и даты во всех разделах выглядят одинаково. */

const numbers = new Intl.NumberFormat(adminConfig.locale);
const dates = new Intl.DateTimeFormat(adminConfig.locale, { day: "2-digit", month: "2-digit", year: "numeric" });
const months = new Intl.DateTimeFormat(adminConfig.locale, { month: "long", year: "numeric" });

export function formatNumber(value: number): string {
  return numbers.format(value);
}

export function formatPrice(value: number): string {
  return `${numbers.format(value)} ${adminConfig.currencyLabel}`;
}

export function formatDate(iso: string): string {
  return dates.format(new Date(iso));
}

export function formatMonth(iso: string): string {
  return months.format(new Date(iso));
}
