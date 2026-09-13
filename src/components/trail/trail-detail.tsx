import { CheckCircle2, CircleDashed } from "lucide-react";
import Link from "next/link";
import type { DonationTrail } from "@/lib/data";
import { Money } from "@/components/shared/money";
import { VerificationLevelBadge } from "@/components/shared/verification-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PAYMENT_STATUS_META } from "@/lib/payment-status-meta";
import { formatDate, formatDateShort } from "@/lib/utils/format";
import { formatPercent } from "@/lib/utils/currency";
import { initials } from "@/lib/utils/format";
import { PageTour } from "@/components/tour/page-tour";
import { givingTrailTourSteps } from "@/components/tour/steps";

export function TrailDetail({ trail }: { trail: DonationTrail }) {
  const { donation, organization, campaign } = trail;
  const isComplete = trail.programAllocation > 0 && trail.pctOfProgramAllocationUtilized >= 0.999;
  const statusMeta = trail.paymentStatus ? PAYMENT_STATUS_META[trail.paymentStatus] : undefined;

  const flowSteps = [
    { label: "Donated", amount: donation.grossAmount },
    { label: "GiveTrail transparency fee", amount: -donation.platformFee, muted: true },
    { label: "Payment processing", amount: -donation.paymentProcessingFee, muted: true },
    { label: "Received by organization", amount: donation.amountReceivedByOrg, strong: true },
    { label: "Organizational / delivery allocation", amount: -trail.operatingAllocation, muted: true },
    { label: "Program allocation", amount: trail.programAllocation, strong: true },
  ];

  return (
    <div>
      <div className="rounded-3xl border border-border bg-card p-6 trail-card-shadow sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-2xl trail-gradient-bg font-heading text-lg font-semibold text-foreground">
              {initials(organization.name)}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{formatDate(donation.createdAt)}</p>
              <Link href={`/organizations/${organization.slug}`} className="font-heading text-lg font-semibold text-foreground hover:underline">
                {organization.name}
              </Link>
              {campaign && <p className="text-sm text-muted-foreground">{campaign.title}</p>}
            </div>
          </div>
          <div className="text-right">
            <Money amount={donation.grossAmount} currency={donation.currency} className="font-heading text-2xl font-semibold text-foreground" />
            {statusMeta && (
              <span className={`mt-1 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusMeta.className}`}>
                {statusMeta.label}
              </span>
            )}
          </div>
        </div>
      </div>

      {isComplete && (
        <div className="mt-6 rounded-3xl border border-success/30 bg-[color-mix(in_oklab,var(--success)_10%,var(--background))] p-6 text-center sm:p-8">
          <p className="font-heading text-xl font-semibold text-success sm:text-2xl">Your Giving Trail is complete ✓</p>
          <p className="mt-2 text-sm text-muted-foreground">
            100% of your program allocation has been attributed to documented expenditures.
          </p>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.3fr]">
        <div data-tour="trail-flow">
          <h2 className="font-heading text-lg font-semibold text-foreground">How your donation moved</h2>
          <div className="mt-4 space-y-0">
            {flowSteps.map((step, i) => (
              <div key={step.label}>
                <div className="flex items-center justify-between py-2.5">
                  <span className={step.muted ? "text-sm text-muted-foreground" : "text-sm font-medium text-foreground"}>{step.label}</span>
                  <Money
                    amount={Math.abs(step.amount)}
                    currency={donation.currency}
                    className={step.strong ? "font-heading font-semibold text-foreground" : "text-sm text-muted-foreground"}
                  />
                </div>
                {i < flowSteps.length - 1 && <div className="h-px w-full bg-border" />}
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-accent p-5">
            <p className="text-sm text-accent-foreground">
              <Money amount={trail.allocatedToExpenditures} currency={donation.currency} className="font-semibold" /> of your{" "}
              <Money amount={trail.programAllocation} currency={donation.currency} className="font-semibold" /> program allocation has been attributed
              to documented expenditures.
            </p>
            <div className="mt-3 flex items-center justify-between text-xs text-accent-foreground/80">
              <span>{formatPercent(trail.pctOfProgramAllocationUtilized, 1)} utilized</span>
              {trail.awaitingAllocation > 0 && (
                <span>
                  <Money amount={trail.awaitingAllocation} currency={donation.currency} /> awaiting allocation
                </span>
              )}
            </div>
          </div>
        </div>

        <div data-tour="trail-expenditures">
          <h2 className="font-heading text-lg font-semibold text-foreground">Expenditures</h2>
          {trail.expenditures.length === 0 ? (
            <EmptyState
              className="mt-4"
              icon={CircleDashed}
              title="Not yet allocated"
              description="This organization hasn't matched your contribution to a specific expenditure yet. Impact evidence will appear here as soon as it does."
            />
          ) : (
            <div className="mt-4 space-y-3">
              {trail.expenditures.map(({ expense, allocatedAmount }) => (
                <div key={expense.id} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{expense.donorSafeDescription}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{formatDateShort(expense.expenseDate)}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <Money amount={allocatedAmount} currency={donation.currency} className="font-heading text-sm font-semibold text-foreground" />
                      {allocatedAmount < expense.amount && (
                        <p className="text-[11px] text-muted-foreground">
                          of <Money amount={expense.amount} currency={expense.currency} /> total
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-2.5">
                    <VerificationLevelBadge level={expense.verificationLevel} />
                  </div>
                </div>
              ))}
              {trail.awaitingAllocation > 0 && (
                <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                  <CircleDashed className="size-4 shrink-0" />
                  <Money amount={trail.awaitingAllocation} currency={donation.currency} className="font-medium text-foreground" /> awaiting
                  allocation to a documented expenditure
                </div>
              )}
              {isComplete && (
                <div className="flex items-center gap-2 text-sm text-success">
                  <CheckCircle2 className="size-4" /> Fully accounted for
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <PageTour tourId="giving-trail" steps={givingTrailTourSteps} />
    </div>
  );
}
