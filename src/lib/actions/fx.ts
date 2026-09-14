"use server";

import { convertCurrency, settlementCurrencyFor } from "@/lib/fx";
import type { Currency } from "@/lib/types";

/** What a donor's chosen amount/currency will actually settle as through Safepay (PKR or USD). */
export async function previewSettlement(amountMajor: number, currency: Currency) {
  const settlementCurrency = settlementCurrencyFor(currency);
  if (currency === settlementCurrency) {
    return { settlementCurrency, settlementAmount: amountMajor, rate: 1 };
  }
  const { amount, rate } = await convertCurrency(amountMajor, currency, settlementCurrency);
  const settlementAmount = settlementCurrency === "PKR" ? Math.round(amount) : Math.round(amount * 100) / 100;
  return { settlementCurrency, settlementAmount, rate };
}
