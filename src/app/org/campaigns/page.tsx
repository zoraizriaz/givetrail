"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useCurrentUser } from "@/context/current-user-context";
import { getCampaignsByOrg } from "@/lib/data";
import { getSessionCampaigns } from "@/lib/session-campaigns";
import { Money } from "@/components/shared/money";
import { EmptyState } from "@/components/shared/empty-state";
import { Megaphone } from "lucide-react";
import type { Campaign } from "@/lib/types";

const STATUS_LABEL: Record<string, string> = { draft: "Draft", active: "Active", completed: "Completed", paused: "Paused" };

export default function OrgCampaignsPage() {
  const { organizationId } = useCurrentUser();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    if (!organizationId) return;
    setCampaigns([...getSessionCampaigns(organizationId), ...getCampaignsByOrg(organizationId)]);
  }, [organizationId]);

  if (!organizationId) return null;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Campaigns</h1>
          <p className="text-sm text-muted-foreground">Manage your fundraising campaigns and programs.</p>
        </div>
        <Button asChild className="gap-1.5">
          <Link href="/org/campaigns/new">
            <Plus className="size-4" /> New Campaign
          </Link>
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <EmptyState className="mt-8" icon={Megaphone} title="No campaigns yet" description="Create your first campaign to start raising funds for a specific program." />
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((c) => {
            const pct = c.fundingGoal > 0 ? Math.min(100, (c.amountRaised / c.fundingGoal) * 100) : 0;
            return (
              <Link key={c.id} href={`/org/campaigns/${c.id}`} className="rounded-2xl border border-border bg-card p-5 trail-card-shadow transition-transform hover:-translate-y-0.5">
                <div className="flex items-center justify-between">
                  <p className="font-heading text-base font-semibold text-foreground">{c.title}</p>
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium capitalize text-secondary-foreground">
                    {STATUS_LABEL[c.status]}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{c.location}</p>
                <Progress value={pct} className="mt-4 h-1.5" />
                <div className="mt-2 flex items-center justify-between text-xs">
                  <Money amount={c.amountRaised} currency={c.currency} className="font-medium text-foreground" />
                  <span className="text-muted-foreground">of <Money amount={c.fundingGoal} currency={c.currency} /></span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
