import Link from "next/link";
import { ChevronLeft, Megaphone } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Money } from "@/components/shared/money";
import { EmptyState } from "@/components/shared/empty-state";
import { getCampaignById } from "@/lib/ngo-data";
import { formatDate } from "@/lib/utils/format";
import { PostCampaignUpdateForm } from "@/components/org/post-campaign-update-form";

export default async function OrgCampaignDetailPage({ params }: { params: Promise<{ campaignId: string }> }) {
  const { campaignId } = await params;
  const campaign = await getCampaignById(campaignId);

  if (!campaign) {
    return <EmptyState icon={Megaphone} title="Campaign not found" />;
  }

  const pct = campaign.fundingGoal > 0 ? Math.min(100, (campaign.amountRaised / campaign.fundingGoal) * 100) : 0;

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
        <PostCampaignUpdateForm campaignId={campaign.id} organizationId={campaign.organizationId} />

        <div className="mt-6 space-y-4">
          {campaign.updates.length === 0 ? (
            <p className="text-sm text-muted-foreground">No updates posted yet.</p>
          ) : (
            campaign.updates.map((u) => (
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
