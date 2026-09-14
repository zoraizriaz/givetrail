import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifySafepayWebhookSignature, type SafepayWebhookPayload } from "@/lib/safepay/client";
import { paymentStatusHistory } from "@/lib/mock-data/helpers";
import type { PaymentStatus } from "@/lib/types";

/**
 * Real-money source of truth for GiveTrail donations. Safepay POSTs here
 * whenever a payment's status changes; we verify the HMAC signature (never
 * trust an unverified webhook body) and update the donation/payment rows
 * accordingly. The donor-facing success page never marks a donation "paid"
 * on its own — it only reflects whatever this handler has already written.
 */

function mapSafepayState(state: string): PaymentStatus {
  const s = state.toUpperCase();
  if (s.includes("REFUND")) return "refunded";
  if (s.includes("FAIL") || s.includes("DECLINE") || s.includes("ERROR") || s.includes("CANCEL") || s.includes("VOID")) return "failed";
  if (s.includes("PAID") || s.includes("SUCCESS") || s.includes("COMPLETE")) {
    // Safepay is single-merchant hosted checkout: a confirmed charge lands
    // directly in GiveTrail's own Safepay balance, not the NGO's. There is
    // no separate "in transit" state from Safepay's side — disbursing to
    // the NGO's bank account is a manual GiveTrail treasury operation for
    // now, so "available_to_ngo" is the most accurate label for what a real
    // confirmed payment means today (money is on hand, ready to pay out).
    return "available_to_ngo";
  }
  return "processing";
}

export async function POST(request: NextRequest) {
  let body: { data: SafepayWebhookPayload };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const signatureHeader = request.headers.get("x-sfpy-signature");
  if (!verifySafepayWebhookSignature(body, signatureHeader)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const notification = body.data?.notification;
  const donationId = notification?.metadata?.order_id;
  if (!notification || !donationId) {
    return NextResponse.json({ error: "Missing order_id in webhook metadata" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: donation } = await admin
    .from("donations")
    .select("id, organization_id, donor_user_id, platform_fee, gross_amount")
    .eq("id", donationId)
    .maybeSingle();

  if (!donation) {
    return NextResponse.json({ error: "Unknown donation" }, { status: 404 });
  }

  const status = mapSafepayState(notification.state);
  const now = new Date().toISOString();

  const { error: paymentError } = await admin
    .from("payments")
    .update({ status, history: paymentStatusHistory(status, now), updated_at: now })
    .eq("donation_id", donationId);

  if (paymentError) {
    return NextResponse.json({ error: paymentError.message }, { status: 500 });
  }

  if (status === "available_to_ngo") {
    const realProcessingFee = Math.round(parseFloat(notification.fee) * 100);
    const amountReceivedByOrg = Math.max(0, donation.gross_amount - donation.platform_fee - realProcessingFee);

    await admin
      .from("donations")
      .update({
        payment_processing_fee: realProcessingFee,
        amount_received_by_org: amountReceivedByOrg,
        net_proceeds: amountReceivedByOrg
      })
      .eq("id", donationId);
  }

  if (donation.donor_user_id) {
    const message =
      status === "available_to_ngo"
        ? "Your donation was received and confirmed. Thank you!"
        : status === "failed"
          ? "Your donation could not be processed. No charge was made."
          : status === "refunded"
            ? "Your donation was refunded."
            : "Your donation is being processed.";

    await admin.from("notifications").insert({
      user_id: donation.donor_user_id,
      message,
      href: `/donate/success/${donationId}`,
      read: false,
      created_at: now
    });
  }

  return NextResponse.json({ received: true });
}
