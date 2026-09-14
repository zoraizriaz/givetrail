import Link from "next/link";
import { HandCoins } from "lucide-react";
import { getCurrentMemberships, getGrantsByCompany, getOrganizationById } from "@/lib/ngo-data";
import { Money } from "@/components/shared/money";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/shared/empty-state";

const STATUS_LABEL: Record<string, string> = {
  pending_transfer: "Pending Transfer",
  transferred: "Transferred",
  active: "Active",
  closed: "Closed",
};

export default async function CorporateGrantsPage() {
  const { companyId } = await getCurrentMemberships();
  if (!companyId) return null;
  const grants = await getGrantsByCompany(companyId);
  const orgsById = new Map(
    await Promise.all(Array.from(new Set(grants.map((g) => g.organizationId))).map(async (id) => [id, await getOrganizationById(id)] as const))
  );

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Grants</h1>
      <p className="text-sm text-muted-foreground">All grants issued through GiveTrail.</p>

      {grants.length === 0 ? (
        <EmptyState className="mt-8" icon={HandCoins} title="No grants yet" />
      ) : (
        <div className="mt-6 space-y-3">
          {grants.map((grant) => {
            const org = orgsById.get(grant.organizationId);
            const pct = grant.amountTransferred > 0 ? Math.min(100, (grant.amountUtilized / grant.amountTransferred) * 100) : 0;
            return (
              <Link
                key={grant.id}
                href={`/corporate/grants/${grant.id}`}
                className="block rounded-2xl border border-border bg-card p-5 trail-card-shadow transition-transform hover:-translate-y-0.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-foreground">{grant.title}</p>
                    <p className="text-xs text-muted-foreground">{org?.name}</p>
                  </div>
                  <div className="text-right">
                    <Money amount={grant.amount} currency={grant.currency} className="font-heading font-semibold text-foreground" />
                    <p className="text-xs text-muted-foreground">{STATUS_LABEL[grant.status]}</p>
                  </div>
                </div>
                <Progress value={pct} className="mt-3 h-1.5" />
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <span>Transferred: <Money amount={grant.amountTransferred} currency={grant.currency} /></span>
                  <span>Utilized: <Money amount={grant.amountUtilized} currency={grant.currency} /></span>
                  <span>Verified: <Money amount={grant.amountVerified} currency={grant.currency} /></span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
