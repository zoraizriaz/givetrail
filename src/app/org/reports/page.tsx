import { getCurrentMemberships, getOrgDashboard } from "@/lib/ngo-data";
import { Money } from "@/components/shared/money";
import { AllocationPolicyBar } from "@/components/org/allocation-policy-bar";
import { EXPENSE_CATEGORY_LABELS, VERIFICATION_LEVEL_LABELS } from "@/lib/expense-category-meta";
import { formatDate } from "@/lib/utils/format";

export default async function OrgReportsPage() {
  const { organizationId } = await getCurrentMemberships();
  if (!organizationId) return null;
  const dash = await getOrgDashboard(organizationId);
  const currency = dash.transparency.currency;
  const today = formatDate(new Date().toISOString());

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">GiveTrail Transparency Report</h1>
          <p className="text-sm text-muted-foreground">{dash.organization.name} · Generated {today}</p>
        </div>
        <button className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground" disabled title="Export coming soon">
          Export PDF
        </button>
      </div>

      <section className="mt-8 rounded-2xl border border-border bg-card p-6 trail-card-shadow">
        <h2 className="font-heading text-base font-semibold text-foreground">Financial summary</h2>
        <div className="mt-4 grid grid-cols-2 gap-y-3 text-sm sm:grid-cols-3">
          <ReportStat label="Total funds received" value={<Money amount={dash.transparency.fundsReceived} currency={currency} />} />
          <ReportStat label="Program allocation" value={<Money amount={dash.transparency.allocatedToPrograms} currency={currency} />} />
          <ReportStat label="Documented expenditure" value={<Money amount={dash.transparency.documentedExpenditure} currency={currency} />} />
          <ReportStat label="Awaiting documentation" value={<Money amount={dash.transparency.awaitingDocumentation} currency={currency} />} />
          <ReportStat label="Available balance" value={<Money amount={dash.availableBalance} currency={currency} />} />
          <ReportStat label="Active donors" value={String(dash.activeDonorCount)} />
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card p-6 trail-card-shadow">
        <h2 className="font-heading text-base font-semibold text-foreground">Disclosed allocation policy</h2>
        <div className="mt-4">
          <AllocationPolicyBar policy={dash.organization.allocationPolicy} />
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card p-6 trail-card-shadow">
        <h2 className="font-heading text-base font-semibold text-foreground">Verification breakdown</h2>
        <div className="mt-4 space-y-2.5">
          {dash.verificationBreakdown.map((v) => (
            <div key={v.level} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{VERIFICATION_LEVEL_LABELS[v.level]}</span>
              <span className="text-foreground">
                {v.count} expense{v.count === 1 ? "" : "s"} · <Money amount={v.amount} currency={currency} />
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card p-6 trail-card-shadow">
        <h2 className="font-heading text-base font-semibold text-foreground">Major expenditure categories</h2>
        <div className="mt-4 space-y-2.5">
          {dash.expenditureByCategory
            .filter((c) => c.amount > 0)
            .sort((a, b) => b.amount - a.amount)
            .map((c) => (
              <div key={c.category} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{EXPENSE_CATEGORY_LABELS[c.category as keyof typeof EXPENSE_CATEGORY_LABELS]}</span>
                <Money amount={c.amount} currency={currency} className="text-foreground" />
              </div>
            ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card p-6 trail-card-shadow">
        <h2 className="font-heading text-base font-semibold text-foreground">Campaign utilization</h2>
        <div className="mt-4 space-y-2.5">
          {dash.campaignPerformance.map(({ campaign, raisedPct, utilizedPct }) => (
            <div key={campaign.id} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{campaign.title}</span>
              <span className="text-foreground">
                {(raisedPct * 100).toFixed(0)}% raised · {(utilizedPct * 100).toFixed(0)}% utilized
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ReportStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-heading font-semibold text-foreground">{value}</p>
    </div>
  );
}
