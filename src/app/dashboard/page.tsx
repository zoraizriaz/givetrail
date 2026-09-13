"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HandHeart, Landmark, Route, ShieldCheck } from "lucide-react";
import { useCurrentUser } from "@/context/current-user-context";
import { getDonorDashboard, type DonorDashboard } from "@/lib/data";
import { getSessionDonationsForDonor, mergeDonorDashboardWithSession } from "@/lib/session-donations";
import { StatCard } from "@/components/shared/stat-card";
import { DonationCard } from "@/components/donor/donation-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { PageTour } from "@/components/tour/page-tour";
import { donorDashboardTourSteps } from "@/components/tour/steps";

export default function DonorDashboardPage() {
  const { user, isReady } = useCurrentUser();
  const [dashboard, setDashboard] = useState<DonorDashboard | null>(null);

  useEffect(() => {
    if (!user) return;
    const base = getDonorDashboard(user.id);
    const sessionRecords = getSessionDonationsForDonor(user.id);
    setDashboard(mergeDonorDashboardWithSession(base, sessionRecords));
  }, [user]);

  if (!isReady) return null;

  if (!user) {
    return (
      <EmptyState
        icon={HandHeart}
        title="Log in to see your giving"
        description="Sign in to view your donation history and follow your Giving Trail."
        action={
          <Button asChild>
            <Link href="/login">Log in</Link>
          </Button>
        }
      />
    );
  }

  if (!dashboard) return null;

  return (
    <div>
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold text-foreground">Welcome back, {user.fullName.split(" ")[0]}</h1>
        <p className="text-sm text-muted-foreground">Here&rsquo;s everything you&rsquo;ve given and where it stands.</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-tour="donor-stats">
        <StatCard label="Total lifetime giving" value={fmt(dashboard.totalLifetimeGiving, dashboard.currency)} icon={HandHeart} />
        <StatCard label="Organizations supported" value={String(dashboard.organizationsSupportedCount)} icon={Landmark} />
        <StatCard label="Campaigns supported" value={String(dashboard.campaignsSupportedCount)} icon={Route} />
        <StatCard label="Fully documented donations" value={String(dashboard.fullyDocumentedDonationsCount)} icon={ShieldCheck} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3" data-tour="donor-allocation-summary">
        <StatCard label="Fully allocated" value={fmt(dashboard.amountFullyAllocated, dashboard.currency)} tone="success" />
        <StatCard label="Currently being utilized" value={fmt(dashboard.amountBeingUtilized, dashboard.currency)} tone="warning" />
        <StatCard label="Awaiting allocation" value={fmt(dashboard.amountAwaitingAllocation, dashboard.currency)} />
      </div>

      <div className="mt-10" data-tour="donor-donations-list">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-foreground">Your donations</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/explore">Give again</Link>
          </Button>
        </div>

        {dashboard.cards.length === 0 ? (
          <EmptyState
            className="mt-4"
            icon={HandHeart}
            title="No donations yet"
            description="When you make your first donation, you'll be able to follow its full Giving Trail here."
            action={
              <Button asChild>
                <Link href="/explore">Explore causes</Link>
              </Button>
            }
          />
        ) : (
          <div className="mt-4 space-y-3">
            {dashboard.cards.map(({ trail }) => (
              <DonationCard key={trail.donation.id} trail={trail} />
            ))}
          </div>
        )}
      </div>
      <PageTour tourId="donor-dashboard" steps={donorDashboardTourSteps} />
    </div>
  );
}

function fmt(amount: number, currency: DonorDashboard["currency"]) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount / 100);
}
