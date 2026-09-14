import Link from "next/link";
import { MapPin } from "lucide-react";
import type { Campaign, Organization } from "@/lib/types";
import { Money } from "@/components/shared/money";
import { Progress } from "@/components/ui/progress";
import { CATEGORY_META } from "@/lib/category-meta";

export function CampaignCard({ campaign, organization: org }: { campaign: Campaign; organization?: Organization }) {
  const pct = campaign.fundingGoal > 0 ? Math.min(100, (campaign.amountRaised / campaign.fundingGoal) * 100) : 0;
  const Icon = CATEGORY_META[campaign.category].icon;

  return (
    <Link
      href={org ? `/organizations/${org.slug}/campaigns/${campaign.slug}` : "#"}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card trail-card-shadow transition-transform hover:-translate-y-0.5"
    >
      <div className="trail-gradient-bg flex h-32 items-center justify-center">
        <Icon className="size-9 text-foreground/70" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-medium text-muted-foreground">{org?.name}</p>
        <h3 className="mt-1 font-heading text-base font-semibold leading-snug text-foreground">{campaign.title}</h3>
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3.5" /> {campaign.location}
        </div>
        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{campaign.description}</p>
        <div className="mt-4">
          <Progress value={pct} className="h-2" />
          <div className="mt-2 flex items-center justify-between text-xs">
            <Money amount={campaign.amountRaised} currency={campaign.currency} className="font-semibold text-foreground" />
            <span className="text-muted-foreground">of <Money amount={campaign.fundingGoal} currency={campaign.currency} /> goal</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
