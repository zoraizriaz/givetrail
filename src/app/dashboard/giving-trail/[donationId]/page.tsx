"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { TrailDetail } from "@/components/trail/trail-detail";
import { getDonationTrail, type DonationTrail } from "@/lib/data";
import { getSessionDonation, computeSessionDonationTrail, isSessionDonationId } from "@/lib/session-donations";

export default function GivingTrailPage({ params }: { params: Promise<{ donationId: string }> }) {
  const { donationId } = use(params);
  const [trail, setTrail] = useState<DonationTrail | undefined | null>(null);

  useEffect(() => {
    if (isSessionDonationId(donationId)) {
      const record = getSessionDonation(donationId);
      setTrail(record ? computeSessionDonationTrail(record) : undefined);
    } else {
      setTrail(getDonationTrail(donationId));
    }
  }, [donationId]);

  if (trail === null) return null;

  if (!trail) {
    return (
      <div className="text-center">
        <p className="font-heading text-lg font-semibold text-foreground">Donation not found</p>
        <Link href="/dashboard" className="mt-2 inline-block text-sm text-primary hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> Back to dashboard
      </Link>
      <div className="mt-4">
        <TrailDetail trail={trail} />
      </div>
    </div>
  );
}
