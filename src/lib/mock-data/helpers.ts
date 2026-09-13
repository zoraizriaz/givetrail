import type { Currency, PaymentMethod, PaymentStatus } from "@/lib/types";
import { toMinorUnits } from "@/lib/utils/currency";

/** Illustrative payment-processing cost by method, as a fraction of the gross donation. */
export const PROCESSING_FEE_PCT: Record<PaymentMethod, number> = {
  card: 0.028,
  bank_transfer: 0.006,
  ach: 0.005,
  international_wire: 0.015,
  corporate_transfer: 0.003,
};

export const DEFAULT_PLATFORM_FEE_PCT = 0.01;

export interface DonationFinancials {
  grossAmount: number;
  platformFeePct: number;
  platformFee: number;
  paymentProcessingFee: number;
  amountReceivedByOrg: number;
  netProceeds: number;
}

/** Computes the fee breakdown for a donation from its gross amount (major units) and method. */
export function buildDonationFinancials(
  grossMajor: number,
  method: PaymentMethod,
  platformFeePct = DEFAULT_PLATFORM_FEE_PCT
): DonationFinancials {
  const grossAmount = toMinorUnits(grossMajor);
  const platformFee = Math.round(grossAmount * platformFeePct);
  const paymentProcessingFee = Math.round(grossAmount * PROCESSING_FEE_PCT[method]);
  const amountReceivedByOrg = grossAmount - platformFee - paymentProcessingFee;
  return {
    grossAmount,
    platformFeePct,
    platformFee,
    paymentProcessingFee,
    amountReceivedByOrg,
    netProceeds: amountReceivedByOrg,
  };
}

/** The organization's disclosed program allocation, in minor units, for a given net proceeds figure. */
export function programAllocationFor(netProceeds: number, programPct: number): number {
  return Math.round(netProceeds * programPct);
}

/** Never allocate more than what's actually available — self-correcting guard for hand-authored demo data. */
export function capAllocation(desired: number, available: number): number {
  return Math.max(0, Math.min(desired, available));
}

export function paymentStatusHistory(finalStatus: PaymentStatus, confirmedAt: string): { status: PaymentStatus; at: string }[] {
  const order: PaymentStatus[] = ["initiated", "processing", "confirmed", "funds_transferred", "available_to_ngo"];
  if (finalStatus === "failed") {
    return [
      { status: "initiated", at: confirmedAt },
      { status: "failed", at: confirmedAt },
    ];
  }
  if (finalStatus === "refunded") {
    return [
      { status: "initiated", at: confirmedAt },
      { status: "confirmed", at: confirmedAt },
      { status: "refunded", at: confirmedAt },
    ];
  }
  const idx = order.indexOf(finalStatus);
  return order.slice(0, idx + 1).map((status, i) => ({ status, at: confirmedAt, ...(i === idx ? {} : {}) }));
}

/** Approximate FX rates against USD, for display-only conversions. Never used to move real money. */
export const FX_RATES_PER_USD: Record<Currency, number> = {
  USD: 1,
  GBP: 0.79,
  EUR: 0.92,
  CAD: 1.36,
  AED: 3.67,
  PKR: 278,
  AUD: 1.52,
};

export function fxConvert(amountMinor: number, from: Currency, to: Currency): number {
  if (from === to) return amountMinor;
  const usd = amountMinor / FX_RATES_PER_USD[from];
  return Math.round(usd * FX_RATES_PER_USD[to]);
}
