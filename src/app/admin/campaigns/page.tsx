"use client";

import Link from "next/link";
import { campaigns, getOrganizationById } from "@/lib/data";
import { Money } from "@/components/shared/money";
import { Progress } from "@/components/ui/progress";

export default function AdminCampaignsPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Campaigns</h1>
      <p className="text-sm text-muted-foreground">Every campaign across all organizations on GiveTrail.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {campaigns.map((c) => {
          const org = getOrganizationById(c.organizationId);
          const pct = c.fundingGoal > 0 ? Math.min(100, (c.amountRaised / c.fundingGoal) * 100) : 0;
          return (
            <Link
              key={c.id}
              href={org ? `/organizations/${org.slug}/campaigns/${c.slug}` : "#"}
              className="rounded-2xl border border-border bg-card p-5 trail-card-shadow transition-transform hover:-translate-y-0.5"
            >
              <p className="text-xs text-muted-foreground">{org?.name}</p>
              <p className="mt-1 font-heading text-base font-semibold text-foreground">{c.title}</p>
              <Progress value={pct} className="mt-3 h-1.5" />
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <Money amount={c.amountRaised} currency={c.currency} />
                <span className="capitalize">{c.status}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
