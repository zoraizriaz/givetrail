"use client";

import type { Campaign, Currency, OrgCategory } from "@/lib/types";
import { readList, appendToList } from "@/lib/local-store";
import { toMinorUnits } from "@/lib/utils/currency";
import { getCampaignById } from "@/lib/data";

const KEY = "givetrail:sessionCampaigns";

export interface CreateCampaignInput {
  organizationId: string;
  title: string;
  description: string;
  category: OrgCategory;
  location: string;
  currency: Currency;
  fundingGoalMajor: number;
  startDate: string;
  endDate?: string;
}

export function createSessionCampaign(input: CreateCampaignInput): Campaign {
  const campaign: Campaign = {
    id: `sess-camp-${Date.now()}`,
    organizationId: input.organizationId,
    slug: `sess-${input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    title: input.title,
    description: input.description,
    imageUrl: "",
    category: input.category,
    location: input.location,
    currency: input.currency,
    fundingGoal: toMinorUnits(input.fundingGoalMajor),
    amountRaised: 0,
    amountUtilized: 0,
    startDate: input.startDate,
    endDate: input.endDate,
    status: "active",
    updates: [],
  };
  appendToList<Campaign>(KEY, campaign);
  return campaign;
}

export function getSessionCampaigns(organizationId: string): Campaign[] {
  return readList<Campaign>(KEY).filter((c) => c.organizationId === organizationId);
}

export function getAllSessionCampaigns(): Campaign[] {
  return readList<Campaign>(KEY);
}

export function getCampaignByIdAnywhere(id: string): Campaign | undefined {
  return getCampaignById(id) ?? readList<Campaign>(KEY).find((c) => c.id === id);
}
