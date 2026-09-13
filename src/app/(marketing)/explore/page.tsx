import { ExploreClient } from "@/components/explore/explore-client";
import { exploreOrganizations, exploreCampaigns } from "@/lib/data";

export default function ExplorePage() {
  const organizations = exploreOrganizations();
  const campaigns = exploreCampaigns();

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
        <ExploreClient organizations={organizations} campaigns={campaigns} />
      </div>
    </div>
  );
}
