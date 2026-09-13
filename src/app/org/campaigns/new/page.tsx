"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrentUser } from "@/context/current-user-context";
import { getOrganizationById } from "@/lib/data";
import { createSessionCampaign } from "@/lib/session-campaigns";
import { CATEGORY_META, ALL_CATEGORIES } from "@/lib/category-meta";
import type { OrgCategory } from "@/lib/types";

export default function NewCampaignPage() {
  const router = useRouter();
  const { organizationId } = useCurrentUser();
  const org = organizationId ? getOrganizationById(organizationId) : undefined;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<OrgCategory>("health");
  const [location, setLocation] = useState("");
  const [goal, setGoal] = useState("");

  if (!org) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const campaign = createSessionCampaign({
      organizationId: org!.id,
      title,
      description,
      category,
      location,
      currency: org!.baseCurrency,
      fundingGoalMajor: Number(goal) || 0,
      startDate: new Date().toISOString(),
    });
    router.push(`/org/campaigns/${campaign.id}`);
  }

  return (
    <div className="max-w-xl">
      <h1 className="font-heading text-2xl font-semibold text-foreground">New Campaign</h1>
      <p className="mt-1 text-sm text-muted-foreground">Create a fundraising campaign for a specific program.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-6 trail-card-shadow">
        <div className="space-y-1.5">
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Emergency Flood Relief" />
        </div>
        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as OrgCategory)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {CATEGORY_META[c].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Location</Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} required placeholder={org.operatingCountry} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Funding goal ({org.baseCurrency})</Label>
          <Input value={goal} onChange={(e) => setGoal(e.target.value.replace(/[^0-9]/g, ""))} required inputMode="numeric" />
        </div>
        <Button type="submit" className="w-full">
          Create campaign
        </Button>
      </form>
    </div>
  );
}
