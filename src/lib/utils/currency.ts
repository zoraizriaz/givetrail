import type { Currency } from "@/lib/types";

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  GBP: "£",
  EUR: "€",
  CAD: "CA$",
  AED: "AED ",
  PKR: "Rs ",
  AUD: "AU$",
};

export const CURRENCY_NAMES: Record<Currency, string> = {
  USD: "US Dollar",
  GBP: "British Pound",
  EUR: "Euro",
  CAD: "Canadian Dollar",
  AED: "UAE Dirham",
  PKR: "Pakistani Rupee",
  AUD: "Australian Dollar",
};

export const ALL_CURRENCIES: Currency[] = ["USD", "GBP", "EUR", "CAD", "AED", "PKR", "AUD"];

/** Format an integer minor-unit amount (cents) as a display string, e.g. 42599 -> "$425.99" */
export function formatMoney(amountMinorUnits: number, currency: Currency, opts?: { compact?: boolean }): string {
  const value = amountMinorUnits / 100;
  const symbol = CURRENCY_SYMBOLS[currency];

  if (opts?.compact && Math.abs(value) >= 1000) {
    const compact = new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
    return `${symbol}${compact}`;
  }

  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);

  return `${symbol}${formatted}`;
}

export function formatPercent(fraction: number, digits = 0): string {
  return `${(fraction * 100).toFixed(digits)}%`;
}

export function toMinorUnits(major: number): number {
  return Math.round(major * 100);
}
