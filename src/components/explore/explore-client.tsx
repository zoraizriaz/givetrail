"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CATEGORY_META, ALL_CATEGORIES } from "@/lib/category-meta";
import { OrganizationCard } from "@/components/shared/organization-card";
import { CampaignCard } from "@/components/shared/campaign-card";
import { EmptyState } from "@/components/shared/empty-state";
import { exploreOrganizations, exploreCampaigns } from "@/lib/data";
import { applyRuntimeOverrides } from "@/lib/runtime-overrides";
import type { Campaign, Organization, OrgCategory } from "@/lib/types";

export function ExploreClient({
  organizations: initialOrganizations,
  campaigns: initialCampaigns,
}: {
  organizations: Organization[];
  campaigns: Campaign[];
}) {
  const [organizations, setOrganizations] = useState(initialOrganizations);
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<OrgCategory | null>(null);

  useEffect(() => {
    applyRuntimeOverrides();
    setOrganizations(exploreOrganizations());
    setCampaigns(exploreCampaigns());
  }, []);

  const filteredOrgs = useMemo(() => {
    return organizations.filter((o) => {
      if (category && !o.category.includes(category)) return false;
      if (query && !o.name.toLowerCase().includes(query.toLowerCase()) && !o.mission.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [organizations, query, category]);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      if (category && c.category !== category) return false;
      if (query && !c.title.toLowerCase().includes(query.toLowerCase()) && !c.description.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [campaigns, query, category]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search organizations or campaigns…"
            className="pl-9"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={category === null ? "default" : "outline"}
          onClick={() => setCategory(null)}
          className="rounded-full"
        >
          All causes
        </Button>
        {ALL_CATEGORIES.map((c) => {
          const meta = CATEGORY_META[c];
          return (
            <Button
              key={c}
              size="sm"
              variant={category === c ? "default" : "outline"}
              onClick={() => setCategory(category === c ? null : c)}
              className={cn("gap-1.5 rounded-full")}
            >
              <meta.icon className="size-3.5" />
              {meta.label}
            </Button>
          );
        })}
      </div>

      <Tabs defaultValue="organizations" className="mt-8">
        <TabsList>
          <TabsTrigger value="organizations">Organizations ({filteredOrgs.length})</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns ({filteredCampaigns.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="organizations" className="mt-6">
          {filteredOrgs.length === 0 ? (
            <EmptyState icon={Search} title="No organizations match your search" description="Try a different keyword or clear your filters." />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredOrgs.map((o) => (
                <OrganizationCard key={o.id} organization={o} />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="campaigns" className="mt-6">
          {filteredCampaigns.length === 0 ? (
            <EmptyState icon={Search} title="No campaigns match your search" description="Try a different keyword or clear your filters." />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCampaigns.map((c) => (
                <CampaignCard key={c.id} campaign={c} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
