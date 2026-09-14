import Link from "next/link";
import { ChevronLeft, HandCoins } from "lucide-react";
import { getGrantDetail } from "@/lib/ngo-data";
import { Money } from "@/components/shared/money";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/utils/format";
import type { Currency } from "@/lib/types";

export default async function GrantDetailPage({ params }: { params: Promise<{ grantId: string }> }) {
  const { grantId } = await params;
  const detail = await getGrantDetail(grantId);

  if (!detail) return <EmptyState icon={HandCoins} title="Grant not found" />;
  const { grant, organization, campaign, budgetVsActual } = detail;

  const utilizedPct = grant.amountTransferred > 0 ? Math.min(100, (grant.amountUtilized / grant.amountTransferred) * 100) : 0;
  const verifiedPct = grant.amountUtilized > 0 ? Math.min(100, (grant.amountVerified / grant.amountUtilized) * 100) : 0;
  const remaining = Math.max(0, grant.amount - grant.amountTransferred);

  return (
    <div className="max-w-3xl">
      <Link href="/corporate/grants" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> Back to grants
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">{grant.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {organization.name} {campaign && `· ${campaign.title}`} · Issued {formatDate(grant.createdAt)}
          </p>
        </div>
        <Money amount={grant.amount} currency={grant.currency} className="font-heading text-2xl font-semibold text-foreground" />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        <SummaryCard label="Transferred" value={grant.amountTransferred} currency={grant.currency} />
        <SummaryCard label="Utilized" value={grant.amountUtilized} currency={grant.currency} />
        <SummaryCard label="Verified" value={grant.amountVerified} currency={grant.currency} />
        <SummaryCard label="Remaining to transfer" value={remaining} currency={grant.currency} />
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6 trail-card-shadow">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Utilization</span>
          <span className="font-medium text-foreground">{utilizedPct.toFixed(1)}%</span>
        </div>
        <Progress value={utilizedPct} className="mt-2 h-2" />
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Documentation of utilized funds</span>
          <span className="font-medium text-foreground">{verifiedPct.toFixed(1)}%</span>
        </div>
        <Progress value={verifiedPct} className="mt-2 h-2" />
      </div>

      <div className="mt-8">
        <h2 className="font-heading text-lg font-semibold text-foreground">Budget vs. actual</h2>
        <div className="mt-4 space-y-4">
          {budgetVsActual.map((line) => {
            const pct = line.budget > 0 ? Math.min(100, (line.actual / line.budget) * 100) : 0;
            return (
              <div key={line.label} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{line.label}</span>
                  <span className="text-muted-foreground">
                    <Money amount={line.actual} currency={grant.currency} /> of <Money amount={line.budget} currency={grant.currency} />
                  </span>
                </div>
                <Progress value={pct} className="mt-2.5 h-1.5" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, currency }: { label: string; value: number; currency: Currency }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <Money amount={value} currency={currency} className="mt-1 block font-heading text-lg font-semibold text-foreground" />
    </div>
  );
}
