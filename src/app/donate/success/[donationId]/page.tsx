"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleDashed, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { Money } from "@/components/shared/money";
import { getSessionDonation, computeSessionDonationTrail, type SessionDonationRecord } from "@/lib/session-donations";
import { useCurrentUser } from "@/context/current-user-context";

export default function DonationSuccessPage({ params }: { params: Promise<{ donationId: string }> }) {
  const { donationId } = use(params);
  const { user } = useCurrentUser();
  const [record, setRecord] = useState<SessionDonationRecord | undefined | null>(null);

  useEffect(() => {
    setRecord(getSessionDonation(donationId) ?? undefined);
  }, [donationId]);

  if (record === null) return null;

  if (!record) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="font-heading text-xl font-semibold text-foreground">We couldn&rsquo;t find that donation</p>
        <p className="text-sm text-muted-foreground">It may have been from a different browser session.</p>
        <Button asChild>
          <Link href="/explore">Explore causes</Link>
        </Button>
      </div>
    );
  }

  const trail = computeSessionDonationTrail(record);

  return (
    <div className="min-h-screen trail-gradient-bg">
      <header className="px-4 py-6 sm:px-6 lg:px-8">
        <Logo markSize={26} />
      </header>

      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 pb-20 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-background shadow-sm">
          <CheckCircle2 className="size-8 text-success" />
        </div>
        <h1 className="mt-6 font-heading text-3xl font-semibold text-foreground sm:text-4xl">Your giving trail has started.</h1>
        <p className="mt-3 text-muted-foreground">Thank you, {record.donorName.split(" ")[0]}. Here&rsquo;s exactly what happens next.</p>

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
            <StepRow icon={CheckCircle2} tone="done" label="Donation confirmed" />
            <StepRow icon={CheckCircle2} tone="done" label="Funds transferred to organization" />
            <StepRow icon={CircleDashed} tone="pending" label="Awaiting allocation to a program" />
            <StepRow icon={Route} tone="future" label="Impact evidence will appear here" />
          </div>
        </div>

        <Button asChild size="lg" className="mt-8 gap-2">
          <Link href={`/dashboard/giving-trail/${trail.donation.id}`}>
            Track My Donation <ArrowRight className="size-4" />
          </Link>
        </Button>

        {!user && (
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

function StepRow({ icon: Icon, label, tone }: { icon: typeof CheckCircle2; label: string; tone: "done" | "pending" | "future" }) {
  const toneClass = tone === "done" ? "text-success" : tone === "pending" ? "text-warning" : "text-muted-foreground/60";
  return (
    <div className="flex items-center gap-3">
      <Icon className={`size-5 shrink-0 ${toneClass}`} />
      <span className={tone === "future" ? "text-muted-foreground" : "text-foreground"}>{label}</span>
    </div>
  );
}
