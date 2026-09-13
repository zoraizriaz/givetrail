"use client";

import Link from "next/link";
import { AlertCircle, Banknote, FileWarning, Landmark, ShieldCheck, Users, Wallet } from "lucide-react";
import { useCurrentUser } from "@/context/current-user-context";
import { getOrgDashboard } from "@/lib/data";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { MiniBarChart } from "@/components/shared/mini-bar-chart";
import { Money } from "@/components/shared/money";
import { EXPENSE_CATEGORY_LABELS, VERIFICATION_LEVEL_LABELS } from "@/lib/expense-category-meta";
import { formatMoney } from "@/lib/utils/currency";
import { PageTour } from "@/components/tour/page-tour";
import { orgDashboardTourSteps } from "@/components/tour/steps";

export default function OrgDashboardPage() {
  const { organizationId } = useCurrentUser();

  if (!organizationId) {
    return <EmptyState icon={Landmark} title="No organization linked" description="Log in as an NGO administrator to see this dashboard." />;
  }

  const dash = getOrgDashboard(organizationId);
  const currency = dash.transparency.currency;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">{dash.organization.name}</h1>
          <p className="text-sm text-muted-foreground">Here&rsquo;s your organization&rsquo;s transparency snapshot.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-tour="org-stats">
        <StatCard label="Total funds received" value={formatMoney(dash.totalFundsReceived, currency)} icon={Banknote} />
        <StatCard label="Active donors" value={String(dash.activeDonorCount)} icon={Users} />
        <StatCard label="Available balance" value={formatMoney(dash.availableBalance, currency)} icon={Wallet} />
        <StatCard label="Program allocation" value={formatMoney(dash.programAllocationTotal, currency)} icon={Landmark} />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Verified expenses" value={String(dash.verifiedExpenseCount)} icon={ShieldCheck} tone="success" />
        <StatCard label="Awaiting documentation" value={String(dash.awaitingDocumentationCount)} icon={FileWarning} tone="warning" />
        <StatCard label="Unallocated donations" value={String(dash.unallocatedDonationCount)} icon={AlertCircle} />
        <StatCard
          label="Transparency completeness"
          value={`${((dash.transparency.documentedExpenditure / Math.max(1, dash.transparency.allocatedToPrograms)) * 100).toFixed(0)}%`}
        />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 trail-card-shadow">
          <h2 className="font-heading text-base font-semibold text-foreground">Funds received over time</h2>
          {dash.fundsReceivedByMonth.length === 0 ? (
            <EmptyState className="mt-4" title="No donations yet" />
          ) : (
            <MiniBarChart
              className="mt-5"
              data={dash.fundsReceivedByMonth.map((m) => ({ label: m.month, value: m.amount }))}
              formatValue={(v) => formatMoney(v, currency, { compact: true })}
            />
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 trail-card-shadow">
          <h2 className="font-heading text-base font-semibold text-foreground">Expenditure by category</h2>
          <MiniBarChart
            className="mt-5"
            data={dash.expenditureByCategory
              .filter((c) => c.amount > 0)
              .map((c) => ({ label: EXPENSE_CATEGORY_LABELS[c.category as keyof typeof EXPENSE_CATEGORY_LABELS], value: c.amount }))}
            formatValue={(v) => formatMoney(v, currency, { compact: true })}
          />
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 trail-card-shadow">
          <h2 className="font-heading text-base font-semibold text-foreground">Verification status</h2>
          <MiniBarChart
            className="mt-5"
            data={dash.verificationBreakdown.map((v) => ({ label: VERIFICATION_LEVEL_LABELS[v.level], value: v.count }))}
          />
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 trail-card-shadow">
          <h2 className="font-heading text-base font-semibold text-foreground">Campaign performance</h2>
          <div className="mt-4 space-y-3">
            {dash.campaignPerformance.map(({ campaign, raisedPct }) => (
              <Link key={campaign.id} href={`/org/campaigns/${campaign.id}`} className="block">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{campaign.title}</span>
                  <span className="text-muted-foreground">{(raisedPct * 100).toFixed(0)}% raised</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, raisedPct * 100)}%` }} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <OperationalWidget
          title="Expenses awaiting receipts"
          count={dash.expensesAwaitingReceipts.length}
          href="/org/expenses?status=declared"
        >
          {dash.expensesAwaitingReceipts.slice(0, 3).map((e) => (
            <div key={e.id} className="flex items-center justify-between text-sm">
              <span className="truncate text-foreground">{e.title}</span>
              <Money amount={e.amount} currency={e.currency} className="text-muted-foreground" />
            </div>
          ))}
        </OperationalWidget>

        <OperationalWidget title="Unallocated donations" count={dash.unallocatedDonationCount} href="/org/allocations">
          <p className="text-sm text-muted-foreground">
            <Money amount={dash.unallocatedDonationsAmount} currency={currency} className="font-medium text-foreground" /> waiting to be
            matched to a documented expenditure.
          </p>
        </OperationalWidget>

        <OperationalWidget title="Campaigns nearing deadline" count={dash.campaignsNearingDeadline.length} href="/org/campaigns">
          {dash.campaignsNearingDeadline.length === 0 ? (
            <p className="text-sm text-muted-foreground">No campaigns closing in the next 30 days.</p>
          ) : (
            dash.campaignsNearingDeadline.map((c) => (
              <p key={c.id} className="truncate text-sm text-foreground">
                {c.title}
              </p>
            ))
          )}
        </OperationalWidget>
      </div>
      <PageTour tourId="org-dashboard" steps={orgDashboardTourSteps} />
    </div>
  );
}

function OperationalWidget({ title, count, href, children }: { title: string; count: number; href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="block rounded-2xl border border-border bg-card p-5 trail-card-shadow transition-transform hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">{count}</span>
      </div>
      <div className="mt-3 space-y-1.5">{children}</div>
    </Link>
  );
}
