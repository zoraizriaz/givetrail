import "server-only";
import { FX_RATES_PER_USD } from "@/lib/mock-data/helpers";
import type { Currency } from "@/lib/types";
export { settlementCurrencyFor } from "@/lib/utils/currency";

let cache: { ratesPerUsd: Record<string, number>; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000;

/** Live rates (units per 1 USD) from a free, keyless FX API, cached for an hour with a static fallback. */
async function getRatesPerUsd(): Promise<Record<string, number>> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) return cache.ratesPerUsd;

  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`FX API returned ${res.status}`);
    const json = (await res.json()) as { result: string; rates: Record<string, number> };
    if (json.result !== "success" || !json.rates) throw new Error("Malformed FX API response");
    cache = { ratesPerUsd: json.rates, fetchedAt: Date.now() };
    return json.rates;
  } catch {
    // Live FX is unavailable — fall back to the static table rather than blocking checkout.
    return FX_RATES_PER_USD;
  }
}

/** Converts a major-unit amount between any two of the 7 supported display currencies. */
export async function convertCurrency(amountMajor: number, from: Currency, to: Currency): Promise<{ amount: number; rate: number }> {
  if (from === to) return { amount: amountMajor, rate: 1 };
  const rates = await getRatesPerUsd();
  const fromRate = rates[from] ?? FX_RATES_PER_USD[from];
  const toRate = rates[to] ?? FX_RATES_PER_USD[to];
  const rate = toRate / fromRate;
  return { amount: amountMajor * rate, rate };
}
