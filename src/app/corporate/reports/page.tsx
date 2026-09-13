"use client";

import { FileBarChart } from "lucide-react";
import { useCurrentUser } from "@/context/current-user-context";
import { getCorporateDashboard, getGrantDetail } from "@/lib/data";
import { Money } from "@/components/shared/money";
import { EmptyState } from "@/components/shared/empty-state";

export default function CorporateReportsPage() {
  const { companyId } = useCurrentUser();
  if (!companyId) return null;
  const dash = getCorporateDashboard(companyId);
  if (!dash.company) return null;

  return (
    <div className="max-w-3xl">
      <h1 className="font-heading text-2xl font-semibold text-foreground">CSR Reports</h1>
      <p className="text-sm text-muted-foreground">A consolidated view across every grant issued by {dash.company.name}.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <ReportStat label="Total giving" value={dash.totalGiving} currency={dash.currency} />
        <ReportStat label="Organizations funded" value={dash.organizationsFundedCount} />
        <ReportStat label="Overall utilization" value={`${(dash.totalUtilizationPct * 100).toFixed(1)}%`} />
      </div>

      <div className="mt-10 space-y-6">
        {dash.activeGrants.length === 0 ? (
          <EmptyState icon={FileBarChart} title="No active grants" />
        ) : (
          dash.activeGrants.map((grant) => {
            const detail = getGrantDetail(grant.id);
            if (!detail) return null;
            return (
              <div key={grant.id} className="rounded-2xl border border-border bg-card p-6 trail-card-shadow">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-base font-semibold text-foreground">{grant.title}</h2>
                  <Money amount={grant.amount} currency={grant.currency} className="font-semibold text-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">{detail.organization.name}</p>
                <div className="mt-4 space-y-2">
                  {detail.budgetVsActual.map((line) => (
                    <div key={line.label} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{line.label}</span>
                      <span className="text-foreground">
                        <Money amount={line.actual} currency={grant.currency} /> / <Money amount={line.budget} currency={grant.currency} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function ReportStat({ label, value, currency }: { label: string; value: number | string; currency?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-heading text-lg font-semibold text-foreground">
        {typeof value === "number" && currency ? new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(value / 100) : value}
      </p>
    </div>
  );
}
