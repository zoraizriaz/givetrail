"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { buildDonationFinancials, paymentStatusHistory } from "@/lib/mock-data/helpers";
import { convertCurrency, settlementCurrencyFor } from "@/lib/fx";
import { createSafepayPayment, buildSafepayCheckoutUrl } from "@/lib/safepay/client";
import type { Currency, DonationDesignation } from "@/lib/types";

interface CreateDonationInput {
  organizationId: string;
  organizationSlug: string;
  designation: DonationDesignation;
  donorName: string;
  donorEmail: string;
  grossMajor: number;
  currency: Currency;
  isAnonymous: boolean;
}

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

/**
 * Creates a donation + payment row (status "initiated") and starts a real
 * Safepay hosted-checkout session, returning the URL to redirect the donor
 * to. Safepay only settles in PKR or USD, so non-PKR donor currencies are
 * converted to USD under the hood at today's rate — the donor sees this
 * conversion before being redirected (see CheckoutForm). The donation is
 * NOT marked paid here; that only happens once the Safepay webhook confirms
 * the charge (see /api/webhooks/safepay), which is the trusted source of
 * truth for real money having moved.
 */
export async function createDonation(input: CreateDonationInput) {
  const now = new Date().toISOString();
  const admin = createAdminClient();
  const supabaseServer = await createClient();
  const {
    data: { user: authUser }
  } = await supabaseServer.auth.getUser();

  const { data: settings } = await admin.from("platform_settings").select("platform_fee_pct").eq("id", true).maybeSingle();
  const platformFeePct = Number(settings?.platform_fee_pct ?? 0.01);

  const settlementCurrency = settlementCurrencyFor(input.currency);
  const { amount: settlementGrossMajor, rate } = await convertCurrency(input.grossMajor, input.currency, settlementCurrency);
  const roundedSettlementGrossMajor = settlementCurrency === "PKR" ? Math.round(settlementGrossMajor) : Math.round(settlementGrossMajor * 100) / 100;

  const financials = buildDonationFinancials(roundedSettlementGrossMajor, "card", platformFeePct);

  const { data: donation, error: donationError } = await admin
    .from("donations")
    .insert({
      donor_user_id: authUser?.id ?? null,
      organization_id: input.organizationId,
      designation_type: input.designation.type,
      campaign_id: input.designation.type === "campaign" ? input.designation.campaignId : null,
      gross_amount: financials.grossAmount,
      currency: settlementCurrency,
      exchange_rate: input.currency === settlementCurrency ? null : rate,
      platform_fee_pct: financials.platformFeePct,
      platform_fee: financials.platformFee,
      payment_processing_fee: financials.paymentProcessingFee,
      amount_received_by_org: financials.amountReceivedByOrg,
      net_proceeds: financials.netProceeds,
      is_anonymous: input.isAnonymous,
      donor_name: input.isAnonymous ? null : input.donorName,
      donor_email: input.donorEmail,
      created_at: now
    })
    .select("id")
    .single();

  if (donationError || !donation) {
    throw new Error(`Failed to create donation: ${donationError?.message}`);
  }

  const { error: paymentError } = await admin.from("payments").insert({
    donation_id: donation.id,
    method: "card",
    status: "initiated",
    processing_fee: financials.paymentProcessingFee,
    history: paymentStatusHistory("initiated", now),
    updated_at: now
  });

  if (paymentError) {
    throw new Error(`Failed to create payment: ${paymentError.message}`);
  }

  try {
    const { token } = await createSafepayPayment({ amount: roundedSettlementGrossMajor, currency: settlementCurrency });
    const checkoutUrl = buildSafepayCheckoutUrl({
      token,
      orderId: donation.id,
      cancelUrl: `${siteUrl()}/donate/checkout/${input.organizationSlug}?cancelled=1`,
      redirectUrl: `${siteUrl()}/donate/success/${donation.id}`,
      webhooks: true
    });

    return { donationId: donation.id as string, checkoutUrl };
  } catch (error) {
    await admin
      .from("payments")
      .update({ status: "failed", history: paymentStatusHistory("failed", new Date().toISOString()) })
      .eq("donation_id", donation.id);
    throw error;
  }
}
