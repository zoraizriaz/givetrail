"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { buildDonationFinancials, paymentStatusHistory } from "@/lib/mock-data/helpers";
import type { Currency, DonationDesignation, PaymentMethod } from "@/lib/types";

interface CreateDonationInput {
  organizationId: string;
  designation: DonationDesignation;
  donorName: string;
  donorEmail: string;
  grossMajor: number;
  currency: Currency;
  method: PaymentMethod;
  isAnonymous: boolean;
}

/**
 * Writes a real donation + payment row. Runs server-side with the service-role
 * client so fee math and payment status can't be tampered with from the
 * browser — donations/payments have no client-writable RLS policy by design.
 * There's no real payment gateway wired up yet (Stage B), so the payment is
 * recorded straight through to "confirmed".
 */
export async function createDonation(input: CreateDonationInput) {
  const supabaseServer = await createClient();
  const {
    data: { user: authUser },
  } = await supabaseServer.auth.getUser();

  const now = new Date().toISOString();
  const admin = createAdminClient();
  const { data: settings } = await admin.from("platform_settings").select("platform_fee_pct").eq("id", true).maybeSingle();
  const financials = buildDonationFinancials(input.grossMajor, input.method, Number(settings?.platform_fee_pct ?? 0.01));

  const { data: donation, error: donationError } = await admin
    .from("donations")
    .insert({
      donor_user_id: authUser?.id ?? null,
      organization_id: input.organizationId,
      designation_type: input.designation.type,
      campaign_id: input.designation.type === "campaign" ? input.designation.campaignId : null,
      gross_amount: financials.grossAmount,
      currency: input.currency,
      platform_fee_pct: financials.platformFeePct,
      platform_fee: financials.platformFee,
      payment_processing_fee: financials.paymentProcessingFee,
      amount_received_by_org: financials.amountReceivedByOrg,
      net_proceeds: financials.netProceeds,
      is_anonymous: input.isAnonymous,
      donor_name: input.isAnonymous ? null : input.donorName,
      donor_email: input.donorEmail,
      created_at: now,
    })
    .select("id")
    .single();

  if (donationError || !donation) {
    throw new Error(`Failed to create donation: ${donationError?.message}`);
  }

  const { error: paymentError } = await admin.from("payments").insert({
    donation_id: donation.id,
    method: input.method,
    status: "confirmed",
    processing_fee: financials.paymentProcessingFee,
    history: paymentStatusHistory("confirmed", now),
    updated_at: now,
  });

  if (paymentError) {
    throw new Error(`Failed to create payment: ${paymentError.message}`);
  }

  if (authUser) {
    await admin.from("notifications").insert({
      user_id: authUser.id,
      message: `Your donation of ${input.currency} ${input.grossMajor} was received and is being processed.`,
      href: `/donate/success/${donation.id}`,
      read: false,
      created_at: now,
    });
  }

  return { donationId: donation.id as string };
}
