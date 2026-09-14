import { ExploreClient } from "@/components/explore/explore-client";
import { exploreOrganizations, exploreCampaigns, getOrgTransparency } from "@/lib/supabase-data";

export default async function ExplorePage() {
  const [organizations, campaigns] = await Promise.all([exploreOrganizations(), exploreCampaigns()]);
  const fundsReceivedEntries = await Promise.all(
    organizations.map(async (o) => [o.id, (await getOrgTransparency(o.id, o.baseCurrency, o.allocationPolicy.programPct)).fundsReceived] as const)
  );
  const fundsReceivedByOrgId = Object.fromEntries(fundsReceivedEntries);

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Explore</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold text-foreground sm:text-4xl">
          Give to a verified cause you can follow
        </h1>
        <p className="mt-3 text-muted-foreground">
          Every organization below has completed GiveTrail&rsquo;s verification process. Browse by cause, or search
          for an organization or campaign by name.
        </p>
      </div>

      <div className="mt-10">
        <ExploreClient organizations={organizations} campaigns={campaigns} fundsReceivedByOrgId={fundsReceivedByOrgId} />
      </div>
    </div>
  );
}
