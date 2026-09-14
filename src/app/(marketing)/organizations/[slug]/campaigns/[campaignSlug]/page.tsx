import Link from "next/link";
import { CalendarDays, MapPin, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Money } from "@/components/shared/money";
import { EmptyState } from "@/components/shared/empty-state";
import { CATEGORY_META } from "@/lib/category-meta";
import { formatDate } from "@/lib/utils/format";
import { getVerifiedOrganizationBySlug, getCampaignBySlug } from "@/lib/supabase-data";

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ slug: string; campaignSlug: string }>;
}) {
  const { slug, campaignSlug } = await params;
  const organization = await getVerifiedOrganizationBySlug(slug);
  const campaign = organization ? await getCampaignBySlug(organization.id, campaignSlug) : undefined;
  if (!organization || !campaign) {
    return <EmptyState icon={Megaphone} title="Campaign not found" className="mx-auto mt-20 max-w-lg" />;
  }

  const pct = campaign.fundingGoal > 0 ? Math.min(100, (campaign.amountRaised / campaign.fundingGoal) * 100) : 0;
  const Icon = CATEGORY_META[campaign.category].icon;

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="trail-gradient-bg flex h-48 items-center justify-center rounded-3xl">
        <Icon className="size-14 text-foreground/70" />
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <Link href={`/organizations/${organization.slug}`} className="text-sm font-medium text-primary hover:underline">
            {organization.name}
          </Link>
          <h1 className="mt-2 font-heading text-3xl font-semibold text-foreground">{campaign.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><MapPin className="size-4" /> {campaign.location}</span>
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-4" /> Started {formatDate(campaign.startDate)}</span>
          </div>
          <p className="mt-6 leading-relaxed text-muted-foreground">{campaign.description}</p>

          {campaign.updates.length > 0 && (
            <section className="mt-12">
              <h2 className="font-heading text-xl font-semibold text-foreground">Campaign Updates</h2>
              <div className="mt-4 space-y-5">
                {campaign.updates.map((u) => (
                  <div key={u.id} className="rounded-2xl border border-border bg-card p-5">
                    <p className="text-xs text-muted-foreground">{formatDate(u.postedAt)}</p>
                    <p className="mt-1 font-medium text-foreground">{u.title}</p>
                    <p className="mt-1.5 text-sm text-muted-foreground">{u.body}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside>
          <div className="rounded-2xl border border-border bg-card p-6 trail-card-shadow">
            <Money amount={campaign.amountRaised} currency={campaign.currency} className="font-heading text-2xl font-semibold text-foreground" />
            <span className="text-sm text-muted-foreground"> raised of <Money amount={campaign.fundingGoal} currency={campaign.currency} /> goal</span>
            <Progress value={pct} className="mt-3 h-2" />
            <p className="mt-2 text-xs text-muted-foreground">{pct.toFixed(0)}% funded</p>

            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-5 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Utilized</p>
                <Money amount={campaign.amountUtilized} currency={campaign.currency} className="font-semibold text-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="font-semibold capitalize text-foreground">{campaign.status}</p>
              </div>
            </div>

            {organization.verificationStatus === "verified" && campaign.status === "active" && (
              <Button asChild size="lg" className="mt-6 w-full">
                <Link href={`/donate/checkout/${organization.slug}?campaign=${campaign.id}`}>Donate to this campaign</Link>
              </Button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
