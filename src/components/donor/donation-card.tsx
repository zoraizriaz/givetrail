import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { DonationTrail } from "@/lib/data";
import { Money } from "@/components/shared/money";
import { Progress } from "@/components/ui/progress";
import { formatDateShort } from "@/lib/utils/format";
import { PAYMENT_STATUS_META } from "@/lib/payment-status-meta";

export function DonationCard({ trail }: { trail: DonationTrail }) {
  const pct = Math.min(100, trail.pctOfProgramAllocationUtilized * 100);
  const statusMeta = trail.paymentStatus ? PAYMENT_STATUS_META[trail.paymentStatus] : undefined;
  const isSettled = trail.paymentStatus === "available_to_ngo" || trail.paymentStatus === "funds_transferred";

  return (
    <Link
      href={`/dashboard/giving-trail/${trail.donation.id}`}
      className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 trail-card-shadow transition-transform hover:-translate-y-0.5"
    >
      <div className="min-w-0">
        <Money amount={trail.donation.grossAmount} currency={trail.donation.currency} className="font-heading text-xl font-semibold text-foreground" />
        <p className="mt-1 truncate text-sm text-muted-foreground">
          {trail.campaign ? trail.campaign.title : `${trail.organization.name} · General Fund`}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{formatDateShort(trail.donation.createdAt)}</p>
      </div>
      <div className="w-36 shrink-0 text-right">
        {isSettled ? (
          <>
            <p className="text-xs font-medium text-foreground">{pct.toFixed(0)}% allocated</p>
            <Progress value={pct} className="mt-2 h-1.5" />
          </>
        ) : (
          statusMeta && <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusMeta.className}`}>{statusMeta.label}</span>
        )}
      </div>
      <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}
