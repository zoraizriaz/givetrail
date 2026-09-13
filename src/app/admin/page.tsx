"use client";

import Link from "next/link";
import { Banknote, Globe2, Landmark, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { getAdminAnalytics, getPendingVerificationOrgs } from "@/lib/data";
import { StatCard } from "@/components/shared/stat-card";
import { MiniBarChart } from "@/components/shared/mini-bar-chart";
import { OrgVerificationBadge } from "@/components/shared/verification-badge";
import { formatMoney } from "@/lib/utils/currency";

export default function AdminDashboardPage() {
  const analytics = getAdminAnalytics();
  const pending = getPendingVerificationOrgs();

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Platform Overview</h1>
      <p className="text-sm text-muted-foreground">GiveTrail-wide analytics across every organization and donor.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total donation volume" value={formatMoney(analytics.totalDonationVolumeUSD, "USD", { compact: true })} icon={Banknote} />
        <StatCard label="GiveTrail revenue" value={formatMoney(analytics.platformRevenueUSD, "USD")} icon={TrendingUp} />
        <StatCard label="NGOs onboarded" value={String(analytics.ngoCount)} icon={Landmark} />
        <StatCard label="Verified NGOs" value={String(analytics.verifiedNgoCount)} icon={ShieldCheck} tone="success" />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Individual donors" value={String(analytics.donorCount)} icon={Users} />
        <StatCard label="Corporate donors" value={String(analytics.corporateDonorCount)} icon={Users} />
        <StatCard label="Countries" value={String(analytics.countryCount)} icon={Globe2} />
        <StatCard label="Platform fee" value={`${(analytics.platformFeePct * 100).toFixed(1)}%`} />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 trail-card-shadow">
          <h2 className="font-heading text-base font-semibold text-foreground">Donation volume by donor country</h2>
          <MiniBarChart
            className="mt-5"
            data={analytics.countryVolume.map((c) => ({ label: c.countryCode, value: c.amount }))}
            formatValue={(v) => formatMoney(v, "USD", { compact: true })}
          />
        </div>

        <div className="space-y-4">
          <StatCard label="Average donation" value={formatMoney(analytics.avgDonationUSD, "USD")} />
          <StatCard label="Campaign utilization rate" value={`${(analytics.campaignUtilizationPct * 100).toFixed(1)}%`} />
          <StatCard label="Expense documentation rate" value={`${(analytics.documentationRate * 100).toFixed(1)}%`} />
        </div>
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-foreground">Verification queue</h2>
          <Link href="/admin/ngos" className="text-sm font-medium text-primary hover:underline">
            View all NGOs
          </Link>
        </div>
        <div className="mt-4 space-y-2">
          {pending.length === 0 ? (
            <p className="text-sm text-muted-foreground">No organizations are awaiting review.</p>
          ) : (
            pending.map((org) => (
              <Link
                key={org.id}
                href={`/admin/ngos/${org.id}`}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent/40"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{org.name}</p>
                  <p className="text-xs text-muted-foreground">{org.operatingCountry}</p>
                </div>
                <OrgVerificationBadge status={org.verificationStatus} />
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
