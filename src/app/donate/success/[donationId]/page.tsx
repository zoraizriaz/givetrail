import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleDashed, Loader2, Route, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { Money } from "@/components/shared/money";
import { getDonationTrail, canViewDonation } from "@/lib/supabase-data";
import { createClient } from "@/lib/supabase/server";
import { PaymentStatusPoller } from "@/components/checkout/payment-status-poller";

export default async function DonationSuccessPage({ params }: { params: Promise<{ donationId: string }> }) {
  const { donationId } = await params;
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const trail = await getDonationTrail(donationId);
  const visible = trail && canViewDonation(trail.donation, authUser?.id);

  if (!visible) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="font-heading text-xl font-semibold text-foreground">We couldn&rsquo;t find that donation</p>
        <p className="text-sm text-muted-foreground">Double-check the link, or start a new donation.</p>
        <Button asChild>
          <Link href="/explore">Explore causes</Link>
        </Button>
      </div>
    );
  }

  const firstName = trail.donorName?.split(" ")[0];
  const status = trail.paymentStatus;
  const isPending = status === "initiated" || status === "processing" || !status;
  const isFailed = status === "failed";
  const isRefunded = status === "refunded";
  const isConfirmed = !isPending && !isFailed && !isRefunded;

  return (
    <div className="min-h-screen trail-gradient-bg">
      <PaymentStatusPoller status={status} />
      <header className="px-4 py-6 sm:px-6 lg:px-8">
        <Logo markSize={26} />
      </header>

      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 pb-20 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-background shadow-sm">
          {isFailed ? (
            <XCircle className="size-8 text-destructive" />
          ) : isPending ? (
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          ) : (
            <CheckCircle2 className="size-8 text-success" />
          )}
        </div>
        <h1 className="mt-6 font-heading text-3xl font-semibold text-foreground sm:text-4xl">
          {isFailed ? "Your payment didn't go through." : isPending ? "Confirming your payment…" : "Your giving trail has started."}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {isFailed
            ? "No charge was made. You can try again whenever you're ready."
            : isPending
              ? "Safepay is confirming your payment — this page will update automatically."
              : `${firstName ? `Thank you, ${firstName}. ` : "Thank you. "}Here's exactly what happens next.`}
        </p>

        <div className="mt-10 w-full rounded-3xl border border-border bg-background p-8 text-left trail-card-shadow">
          <div className="flex items-center justify-between border-b border-border pb-5">
            <div>
              <p className="text-xs text-muted-foreground">Donation</p>
              <Money amount={trail.donation.grossAmount} currency={trail.donation.currency} className="font-heading text-2xl font-semibold text-foreground" />
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Organization</p>
              <p className="font-medium text-foreground">{trail.organization.name}</p>
            </div>
          </div>
          {trail.campaign && (
            <div className="border-b border-border py-4 text-sm">
              <span className="text-muted-foreground">Campaign: </span>
              <span className="font-medium text-foreground">{trail.campaign.title}</span>
            </div>
          )}

          <div className="mt-5 space-y-4">
            <StepRow
              icon={isPending ? CircleDashed : isFailed ? XCircle : CheckCircle2}
              tone={isPending ? "pending" : isFailed ? "failed" : "done"}
              label={isFailed ? "Payment failed" : isPending ? "Confirming payment with Safepay" : "Donation confirmed"}
            />
            <StepRow
              icon={isConfirmed ? CheckCircle2 : CircleDashed}
              tone={isConfirmed ? "done" : "future"}
              label="Funds received by GiveTrail"
            />
            <StepRow icon={CircleDashed} tone={isConfirmed ? "pending" : "future"} label="Awaiting allocation to a program" />
            <StepRow icon={Route} tone="future" label="Impact evidence will appear here" />
          </div>
        </div>

        {isFailed ? (
          <Button asChild size="lg" className="mt-8 gap-2">
            <Link href={`/organizations/${trail.organization.slug}`}>Try again</Link>
          </Button>
        ) : (
          <Button asChild size="lg" className="mt-8 gap-2" disabled={isPending}>
            <Link href={`/dashboard/giving-trail/${trail.donation.id}`}>
              Track My Donation <ArrowRight className="size-4" />
            </Link>
          </Button>
        )}

        {!authUser && isConfirmed && (
          <p className="mt-4 text-sm text-muted-foreground">
            Want to track this and future donations from one place?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Activate your GiveTrail account
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

function StepRow({
  icon: Icon,
  label,
  tone,
}: {
  icon: typeof CheckCircle2;
  label: string;
  tone: "done" | "pending" | "future" | "failed";
}) {
  const toneClass =
    tone === "done" ? "text-success" : tone === "pending" ? "text-warning" : tone === "failed" ? "text-destructive" : "text-muted-foreground/60";
  return (
    <div className="flex items-center gap-3">
      <Icon className={`size-5 shrink-0 ${toneClass}`} />
      <span className={tone === "future" ? "text-muted-foreground" : "text-foreground"}>{label}</span>
    </div>
  );
}
