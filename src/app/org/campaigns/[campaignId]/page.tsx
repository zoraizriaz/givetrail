"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/shared/money";
import { EmptyState } from "@/components/shared/empty-state";
import { getCampaignByIdAnywhere } from "@/lib/session-campaigns";
import type { Campaign, CampaignUpdate } from "@/lib/types";
import { formatDate } from "@/lib/utils/format";
import { Megaphone } from "lucide-react";

export default function OrgCampaignDetailPage({ params }: { params: Promise<{ campaignId: string }> }) {
  const { campaignId } = use(params);
  const [campaign, setCampaign] = useState<Campaign | undefined | null>(null);
  const [draft, setDraft] = useState("");
  const [extraUpdates, setExtraUpdates] = useState<CampaignUpdate[]>([]);

  useEffect(() => {
    setCampaign(getCampaignByIdAnywhere(campaignId));
  }, [campaignId]);

  if (campaign === null) return null;
  if (!campaign) {
    return <EmptyState icon={Megaphone} title="Campaign not found" />;
  }

  const pct = campaign.fundingGoal > 0 ? Math.min(100, (campaign.amountRaised / campaign.fundingGoal) * 100) : 0;
  const allUpdates = [...extraUpdates, ...campaign.updates];

  function postUpdate() {
    if (!draft.trim()) return;
    setExtraUpdates((prev) => [
      { id: `local-${Date.now()}`, campaignId: campaign!.id, title: "Campaign update", body: draft, postedAt: new Date().toISOString() },
      ...prev,
    ]);
    setDraft("");
  }

  return (
    <div className="max-w-3xl">
      <Link href="/org/campaigns" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> Back to campaigns
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold text-foreground">{campaign.title}</h1>
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium capitalize text-secondary-foreground">{campaign.status}</span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{campaign.description}</p>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6 trail-card-shadow">
        <div className="flex items-center justify-between text-sm">
          <Money amount={campaign.amountRaised} currency={campaign.currency} className="font-heading text-xl font-semibold text-foreground" />
          <span className="text-muted-foreground">of <Money amount={campaign.fundingGoal} currency={campaign.currency} /> goal</span>
        </div>
        <Progress value={pct} className="mt-3 h-2" />
        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Utilized</p>
            <Money amount={campaign.amountUtilized} currency={campaign.currency} className="font-medium text-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Location</p>
            <p className="font-medium text-foreground">{campaign.location}</p>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-heading text-lg font-semibold text-foreground">Post an update</h2>
        <div className="mt-3 rounded-2xl border border-border bg-card p-5">
          <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Share progress with your donors…" rows={3} />
          <Button className="mt-3" onClick={postUpdate} disabled={!draft.trim()}>
            Post update
          </Button>
        </div>

        <div className="mt-6 space-y-4">
          {allUpdates.length === 0 ? (
            <p className="text-sm text-muted-foreground">No updates posted yet.</p>
          ) : (
            allUpdates.map((u) => (
              <div key={u.id} className="rounded-2xl border border-border bg-card p-5">
                <p className="text-xs text-muted-foreground">{formatDate(u.postedAt)}</p>
                <p className="mt-1 font-medium text-foreground">{u.title}</p>
                <p className="mt-1.5 text-sm text-muted-foreground">{u.body}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
