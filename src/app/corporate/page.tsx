import Link from "next/link";
import { Building2, HandCoins, Landmark, ShieldCheck } from "lucide-react";
import { getCurrentMemberships, getCorporateDashboard, getOrganizationById } from "@/lib/ngo-data";
import { StatCard } from "@/components/shared/stat-card";
import { Money } from "@/components/shared/money";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/shared/empty-state";
import { PageTour } from "@/components/tour/page-tour";
import { corporateDashboardTourSteps } from "@/components/tour/steps";

export default async function CorporateDashboardPage() {
  const { companyId } = await getCurrentMemberships();

  if (!companyId) {
    return <EmptyState icon={Building2} title="No company linked" description="Log in as a corporate donor to see this dashboard." />;
  }

  const dash = await getCorporateDashboard(companyId);
  if (!dash.company) return null;

  const orgsById = new Map(
    await Promise.all(
      Array.from(new Set(dash.activeGrants.map((g) => g.organizationId))).map(async (id) => [id, await getOrganizationById(id)] as const)
    )
  );

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">{dash.company.name}</h1>
      <p className="text-sm text-muted-foreground">Corporate philanthropy overview.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-tour="corporate-stats">
        <StatCard label="Total giving" value={fmt(dash.totalGiving, dash.currency)} icon={HandCoins} />
        <StatCard label="Organizations funded" value={String(dash.organizationsFundedCount)} icon={Landmark} />
        <StatCard label="Active grants" value={String(dash.activeGrants.length)} icon={Building2} />
        <StatCard label="Overall utilization" value={`${(dash.totalUtilizationPct * 100).toFixed(1)}%`} icon={ShieldCheck} />
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-foreground">Active grants</h2>
          <Link href="/corporate/grants" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-4 space-y-3" data-tour="corporate-grants-list">
          {dash.activeGrants.map((grant) => {
            const org = orgsById.get(grant.organizationId);
            const utilizedPct = grant.amountTransferred > 0 ? Math.min(100, (grant.amountUtilized / grant.amountTransferred) * 100) : 0;
            return (
              <Link
                key={grant.id}
                href={`/corporate/grants/${grant.id}`}
                className="block rounded-2xl border border-border bg-card p-5 trail-card-shadow transition-transform hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{grant.title}</p>
                    <p className="text-xs text-muted-foreground">{org?.name}</p>
                  </div>
                  <Money amount={grant.amount} currency={grant.currency} className="font-heading font-semibold text-foreground" />
                </div>
                <Progress value={utilizedPct} className="mt-3 h-1.5" />
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{utilizedPct.toFixed(1)}% utilized</span>
                  <span className="capitalize">{grant.status.replace("_", " ")}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      <PageTour tourId="corporate-dashboard" steps={corporateDashboardTourSteps} />
    </div>
  );
}

function fmt(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount / 100);
}
