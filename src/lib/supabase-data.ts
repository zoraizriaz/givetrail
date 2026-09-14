import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fxConvert, programAllocationFor } from "@/lib/mock-data/helpers";
import type {
  Allocation,
  Campaign,
  Currency,
  Donation,
  DonationDesignation,
  Expense,
  Organization,
  Payment,
  PaymentStatus,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Real, Supabase-backed data access for the donor-facing read path (Explore,
// NGO profile, checkout, success, donor dashboard, Giving Trail). This is a
// parallel module to the legacy mock-data-backed `src/lib/data.ts` — NGO /
// corporate / admin dashboards still read mock data until their own
// migration slice. See supabase/rls.sql for why some reads below go through
// the service-role client instead of the session-aware one.
// ---------------------------------------------------------------------------

type Row = Record<string, unknown>;

function mapPublicOrganization(row: Row): Organization {
  return {
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    logoUrl: (row.logo_url as string) ?? "",
    coverImageUrl: (row.cover_image_url as string) ?? "",
    category: (row.category as Organization["category"]) ?? [],
    operatingCountry: row.operating_country as string,
    legalEntityCountry: row.legal_entity_country as string,
    baseCurrency: row.base_currency as Currency,
    payoutCurrency: row.payout_currency as Currency,
    registrationNumber: row.registration_number as string,
    website: (row.website as string) ?? "",
    address: "",
    representativeName: "",
    representativeTitle: "",
    representativeEmail: "",
    representativePhone: "",
    description: (row.description as string) ?? "",
    mission: (row.mission as string) ?? "",
    operatingRegions: (row.operating_regions as string[]) ?? [],
    verificationStatus: row.verification_status as Organization["verificationStatus"],
    verifiedSince: (row.verified_since as string) ?? undefined,
    allocationPolicy: {
      programPct: Number(row.allocation_policy_program_pct),
      operationsPct: Number(row.allocation_policy_operations_pct),
      fundraisingPct: Number(row.allocation_policy_fundraising_pct),
      paymentProcessingPct: Number(row.allocation_policy_processing_pct),
    },
    documentationCompletenessPct: Number(row.documentation_completeness_pct),
    createdAt: row.created_at as string,
  };
}

function mapCampaign(row: Row): Campaign {
  return {
    id: row.id as string,
    organizationId: row.organization_id as string,
    slug: row.slug as string,
    title: row.title as string,
    description: (row.description as string) ?? "",
    imageUrl: (row.image_url as string) ?? "",
    category: row.category as Campaign["category"],
    location: (row.location as string) ?? "",
    currency: row.currency as Currency,
    fundingGoal: Number(row.funding_goal),
    amountRaised: Number(row.amount_raised),
    amountUtilized: Number(row.amount_utilized),
    startDate: row.start_date as string,
    endDate: (row.end_date as string) ?? undefined,
    status: row.status as Campaign["status"],
    updates: [],
  };
}

/** Always projects only donor-safe columns, regardless of which table the row came from. */
function mapDonorSafeExpense(row: Row): Expense {
  return {
    id: row.id as string,
    organizationId: row.organization_id as string,
    campaignId: (row.campaign_id as string) ?? undefined,
    title: (row.donor_safe_description as string) ?? "",
    vendor: "",
    expenseDate: row.expense_date as string,
    amount: Number(row.amount),
    currency: row.currency as Currency,
    category: row.category as Expense["category"],
    description: (row.donor_safe_description as string) ?? "",
    donorSafeDescription: (row.donor_safe_description as string) ?? "",
    paymentMethod: "",
    referenceNumber: "",
    verificationLevel: row.verification_level as Expense["verificationLevel"],
    amountAllocated: Number(row.amount_allocated),
    evidence: [],
    beneficiaryProtected: Boolean(row.beneficiary_protected),
  };
}

function mapDonation(row: Row): Donation {
  const designation: DonationDesignation =
    row.designation_type === "campaign" ? { type: "campaign", campaignId: row.campaign_id as string } : { type: "general_fund" };
  return {
    id: row.id as string,
    donorUserId: (row.donor_user_id as string) ?? "",
    organizationId: row.organization_id as string,
    designation,
    grossAmount: Number(row.gross_amount),
    currency: row.currency as Currency,
    platformFeePct: Number(row.platform_fee_pct),
    platformFee: Number(row.platform_fee),
    paymentProcessingFee: Number(row.payment_processing_fee),
    amountReceivedByOrg: Number(row.amount_received_by_org),
    netProceeds: Number(row.net_proceeds),
    isAnonymous: Boolean(row.is_anonymous),
    createdAt: row.created_at as string,
    paymentId: row.payment_id as string,
  };
}

// ---------------------------------------------------------------------------
// Explore / organization profile (public, RLS-safe via session/anon client)
// ---------------------------------------------------------------------------

export async function getVerifiedOrganizations(): Promise<Organization[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("public_organizations").select("*").order("name");
  return (data ?? []).map(mapPublicOrganization);
}

export async function getVerifiedOrganizationBySlug(slug: string): Promise<Organization | undefined> {
  const supabase = await createClient();
  const { data } = await supabase.from("public_organizations").select("*").eq("slug", slug).maybeSingle();
  return data ? mapPublicOrganization(data) : undefined;
}

export async function getCampaignsForOrg(organizationId: string): Promise<Campaign[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("campaigns")
    .select("*")
    .eq("organization_id", organizationId)
    .order("start_date", { ascending: false });
  return (data ?? []).map(mapCampaign);
}

export async function getCampaignBySlug(organizationId: string, campaignSlug: string): Promise<Campaign | undefined> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("campaigns")
    .select("*, campaign_updates(*)")
    .eq("organization_id", organizationId)
    .eq("slug", campaignSlug)
    .maybeSingle();
  if (!data) return undefined;
  const campaign = mapCampaign(data);
  const updates = ((data.campaign_updates as Row[] | null) ?? [])
    .map((u) => ({
      id: u.id as string,
      campaignId: u.campaign_id as string,
      title: u.title as string,
      body: u.body as string,
      imageUrl: (u.image_url as string) ?? undefined,
      postedAt: u.posted_at as string,
    }))
    .sort((a, b) => (a.postedAt < b.postedAt ? 1 : -1));
  return { ...campaign, updates };
}

export interface ExploreFilters {
  category?: string;
  query?: string;
}

export async function exploreOrganizations(filters: ExploreFilters = {}): Promise<Organization[]> {
  let list = await getVerifiedOrganizations();
  if (filters.category) {
    list = list.filter((o) => o.category.includes(filters.category as Organization["category"][number]));
  }
  if (filters.query) {
    const q = filters.query.toLowerCase();
    list = list.filter((o) => o.name.toLowerCase().includes(q) || o.mission.toLowerCase().includes(q));
  }
  return list;
}

export async function exploreCampaigns(filters: ExploreFilters = {}): Promise<Campaign[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("campaigns").select("*").eq("status", "active");
  let list = (data ?? []).map(mapCampaign);
  if (filters.category) {
    list = list.filter((c) => c.category === filters.category);
  }
  if (filters.query) {
    const q = filters.query.toLowerCase();
    list = list.filter((c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
  }
  return list;
}

// ---------------------------------------------------------------------------
// Organization transparency (aggregate, public). RLS deliberately has no
// anon/public policy for reading raw donations/allocations (see rls.sql), so
// these roll-ups — which are meant to be public by design — are computed
// server-side with the service-role client. No individual donation or
// allocation row is ever returned to the caller, only the aggregated sums.
// ---------------------------------------------------------------------------

export interface OrgTransparency {
  currency: Currency;
  fundsReceived: number;
  allocatedToPrograms: number;
  documentedExpenditure: number;
  awaitingDocumentation: number;
  donorCount: number;
}

function isSettled(status: PaymentStatus | undefined): boolean {
  return status === "funds_transferred" || status === "available_to_ngo";
}

export async function getOrgTransparency(organizationId: string, baseCurrency: Currency, programPct: number): Promise<OrgTransparency> {
  const admin = createAdminClient();

  const [{ data: donationRows }, { data: grantRows }, { data: expenseRows }] = await Promise.all([
    admin
      .from("donations")
      .select("donor_user_id, currency, amount_received_by_org, net_proceeds, payments(status)")
      .eq("organization_id", organizationId),
    admin.from("grants").select("currency, amount_transferred").eq("organization_id", organizationId),
    admin
      .from("expenses")
      .select("currency, amount_allocated, verification_level")
      .eq("organization_id", organizationId),
  ]);

  let fundsReceived = 0;
  let allocatedToPrograms = 0;
  const donorIds = new Set<string>();

  for (const row of donationRows ?? []) {
    const payment = Array.isArray(row.payments) ? row.payments[0] : row.payments;
    if (!isSettled(payment?.status as PaymentStatus | undefined)) continue;
    fundsReceived += fxConvert(Number(row.amount_received_by_org), row.currency as Currency, baseCurrency);
    allocatedToPrograms += fxConvert(
      programAllocationFor(Number(row.net_proceeds), programPct),
      row.currency as Currency,
      baseCurrency
    );
    if (row.donor_user_id) donorIds.add(row.donor_user_id as string);
  }

  for (const g of grantRows ?? []) {
    fundsReceived += fxConvert(Number(g.amount_transferred), g.currency as Currency, baseCurrency);
    allocatedToPrograms += fxConvert(Number(g.amount_transferred), g.currency as Currency, baseCurrency);
  }

  const documentedExpenditure = (expenseRows ?? [])
    .filter((e) => e.verification_level !== "declared")
    .reduce((sum, e) => sum + fxConvert(Number(e.amount_allocated), e.currency as Currency, baseCurrency), 0);

  const awaitingDocumentation = Math.max(0, allocatedToPrograms - documentedExpenditure);

  return { currency: baseCurrency, fundsReceived, allocatedToPrograms, documentedExpenditure, awaitingDocumentation, donorCount: donorIds.size };
}

export interface OrgPublicProfile {
  organization: Organization;
  campaigns: Campaign[];
  transparency: OrgTransparency;
  recentExpenditures: Expense[];
}

export async function getOrgPublicProfile(slug: string): Promise<OrgPublicProfile | undefined> {
  const organization = await getVerifiedOrganizationBySlug(slug);
  if (!organization) return undefined;

  const admin = createAdminClient();
  const [campaigns, transparency, { data: expenseRows }] = await Promise.all([
    getCampaignsForOrg(organization.id),
    getOrgTransparency(organization.id, organization.baseCurrency, organization.allocationPolicy.programPct),
    admin
      .from("expenses")
      .select("*")
      .eq("organization_id", organization.id)
      .neq("verification_level", "declared")
      .order("expense_date", { ascending: false })
      .limit(6),
  ]);

  return {
    organization,
    campaigns,
    transparency,
    recentExpenditures: (expenseRows ?? []).map(mapDonorSafeExpense),
  };
}

// ---------------------------------------------------------------------------
// Donation trail — used by the post-checkout success page (reachable via an
// unguessable donation id right after paying, like an order-confirmation
// link) and the signed-in donor's Giving Trail page. Both read through the
// service-role client (donor->expense visibility spans a 3-table join RLS
// can't express safely — see rls.sql's expense policy comments) but this
// function itself enforces that only the donation's own donor (or a guest
// donation with no owner) may see it; ownership is checked by the caller.
// ---------------------------------------------------------------------------

export interface TrailExpenditureLine {
  expense: Expense;
  allocatedAmount: number;
}

export interface DonationTrail {
  donation: Donation;
  organization: Organization;
  campaign?: Campaign;
  operatingAllocation: number;
  programAllocation: number;
  expenditures: TrailExpenditureLine[];
  allocatedToExpenditures: number;
  awaitingAllocation: number;
  pctOfProgramAllocationUtilized: number;
  paymentStatus: PaymentStatus | undefined;
  donorName?: string;
}

export async function getDonationById(donationId: string): Promise<{ donation: Donation; donorName?: string } | undefined> {
  const admin = createAdminClient();
  const { data } = await admin.from("donations").select("*, payments(id)").eq("id", donationId).maybeSingle();
  if (!data) return undefined;
  const paymentId = Array.isArray(data.payments) ? data.payments[0]?.id : (data.payments as { id: string } | null)?.id;
  return { donation: mapDonation({ ...data, payment_id: paymentId }), donorName: (data.donor_name as string) ?? undefined };
}

export async function getDonationTrail(donationId: string): Promise<DonationTrail | undefined> {
  const admin = createAdminClient();
  const found = await getDonationById(donationId);
  if (!found) return undefined;
  const { donation, donorName } = found;

  const [{ data: orgRow }, { data: paymentRow }, { data: allocationRows }] = await Promise.all([
    admin.from("organizations").select("*").eq("id", donation.organizationId).single(),
    admin.from("payments").select("status").eq("donation_id", donationId).maybeSingle(),
    admin.from("allocations").select("*").eq("source_type", "donation").eq("source_id", donationId),
  ]);
  if (!orgRow) return undefined;

  const organization = mapPublicOrganization(orgRow);
  const campaign =
    donation.designation.type === "campaign" ? await getCampaignBySlugById(donation.designation.campaignId) : undefined;

  const programAllocation = programAllocationFor(donation.netProceeds, organization.allocationPolicy.programPct);
  const operatingAllocation = donation.netProceeds - programAllocation;

  const expenseIds = (allocationRows ?? []).map((a) => a.expense_id as string);
  const expensesById = new Map<string, Expense>();
  if (expenseIds.length > 0) {
    const { data: expenseRows } = await admin.from("expenses").select("*").in("id", expenseIds);
    for (const row of expenseRows ?? []) expensesById.set(row.id as string, mapDonorSafeExpense(row));
  }

  const expenditures: TrailExpenditureLine[] = (allocationRows ?? [])
    .map((a) => {
      const expense = expensesById.get(a.expense_id as string);
      return expense ? { expense, allocatedAmount: Number(a.amount) } : undefined;
    })
    .filter((x): x is TrailExpenditureLine => Boolean(x));

  const allocatedToExpenditures = (allocationRows ?? []).reduce((sum, a) => sum + Number(a.amount), 0);
  const awaitingAllocation = Math.max(0, programAllocation - allocatedToExpenditures);

  return {
    donation,
    organization,
    campaign,
    operatingAllocation,
    programAllocation,
    expenditures,
    allocatedToExpenditures,
    awaitingAllocation,
    pctOfProgramAllocationUtilized: programAllocation > 0 ? allocatedToExpenditures / programAllocation : 0,
    paymentStatus: (paymentRow?.status as PaymentStatus | undefined) ?? undefined,
    donorName,
  };
}

async function getCampaignBySlugById(campaignId: string): Promise<Campaign | undefined> {
  const admin = createAdminClient();
  const { data } = await admin.from("campaigns").select("*").eq("id", campaignId).maybeSingle();
  return data ? mapCampaign(data) : undefined;
}

/** True if the given signed-in user id owns this donation, or the donation is an unowned guest gift. */
export function canViewDonation(donation: Donation, viewerUserId: string | undefined): boolean {
  if (!donation.donorUserId) return true;
  return donation.donorUserId === viewerUserId;
}

// ---------------------------------------------------------------------------
// Donor dashboard
// ---------------------------------------------------------------------------

export interface DonorDonationCard {
  trail: DonationTrail;
}

export interface DonorDashboard {
  currency: Currency;
  totalLifetimeGiving: number;
  organizationsSupportedCount: number;
  campaignsSupportedCount: number;
  amountFullyAllocated: number;
  amountBeingUtilized: number;
  amountAwaitingAllocation: number;
  fullyDocumentedDonationsCount: number;
  cards: DonorDonationCard[];
}

export async function getDonorDashboard(userId: string): Promise<DonorDashboard> {
  const admin = createAdminClient();
  const [{ data: donorProfile }, { data: donationRows }] = await Promise.all([
    admin.from("donor_profiles").select("preferred_currency").eq("user_id", userId).maybeSingle(),
    admin
      .from("donations")
      .select("id, currency, gross_amount, payments(status)")
      .eq("donor_user_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  const currency: Currency = (donorProfile?.preferred_currency as Currency) ?? "USD";
  const myDonations = (donationRows ?? []).filter((d) => {
    const payment = Array.isArray(d.payments) ? d.payments[0] : d.payments;
    return (payment?.status as PaymentStatus | undefined) !== "failed";
  });

  const trails = await Promise.all(myDonations.map((d) => getDonationTrail(d.id as string)));
  const cards: DonorDonationCard[] = trails.filter((t): t is DonationTrail => Boolean(t)).map((trail) => ({ trail }));

  const orgSet = new Set(cards.map((c) => c.trail.organization.id));
  const campaignSet = new Set(cards.filter((c) => c.trail.campaign).map((c) => c.trail.campaign!.id));

  let totalLifetimeGiving = 0;
  for (const d of myDonations) {
    const payment = Array.isArray(d.payments) ? d.payments[0] : d.payments;
    if ((payment?.status as PaymentStatus | undefined) === "refunded") continue;
    totalLifetimeGiving += fxConvert(Number(d.gross_amount), d.currency as Currency, currency);
  }

  let amountFullyAllocated = 0;
  let amountBeingUtilized = 0;
  let amountAwaitingAllocation = 0;
  let fullyDocumentedDonationsCount = 0;

  for (const { trail } of cards) {
    const converted = fxConvert(trail.programAllocation, trail.donation.currency, currency);
    if (trail.pctOfProgramAllocationUtilized >= 0.999 && trail.programAllocation > 0) {
      amountFullyAllocated += converted;
      fullyDocumentedDonationsCount += 1;
    } else if (trail.pctOfProgramAllocationUtilized > 0) {
      amountBeingUtilized += converted;
    } else {
      amountAwaitingAllocation += converted;
    }
  }

  return {
    currency,
    totalLifetimeGiving,
    organizationsSupportedCount: orgSet.size,
    campaignsSupportedCount: campaignSet.size,
    amountFullyAllocated,
    amountBeingUtilized,
    amountAwaitingAllocation,
    fullyDocumentedDonationsCount,
    cards,
  };
}

/** A well-formed, fully-allocated donation trail for illustrative use (homepage hero visual). */
export async function getSampleDonationTrail(): Promise<DonationTrail | undefined> {
  const admin = createAdminClient();
  const { data: allocRows } = await admin.from("allocations").select("source_id").eq("source_type", "donation").limit(15);
  const ids = Array.from(new Set((allocRows ?? []).map((a) => a.source_id as string)));

  let fallback: DonationTrail | undefined;
  for (const id of ids) {
    const trail = await getDonationTrail(id);
    if (!trail) continue;
    if (!fallback) fallback = trail;
    if (trail.pctOfProgramAllocationUtilized >= 0.99) return trail;
  }
  return fallback;
}

export interface PlatformStats {
  currency: Currency;
  totalTracked: number;
  verifiedOrganizations: number;
  countriesRepresented: number;
  verifiedExpenditures: number;
}

/** Real, live platform-wide aggregates for the homepage stats section — never invented figures. */
export async function getPlatformStats(): Promise<PlatformStats> {
  const baseCurrency: Currency = "USD";
  const admin = createAdminClient();

  const [organizations, { data: donationRows }, { data: expenseRows }] = await Promise.all([
    getVerifiedOrganizations(),
    admin.from("donations").select("currency, amount_received_by_org, payments(status)"),
    admin.from("expenses").select("verification_level"),
  ]);

  let totalTracked = 0;
  for (const row of donationRows ?? []) {
    const payment = Array.isArray(row.payments) ? row.payments[0] : row.payments;
    if (!isSettled(payment?.status as PaymentStatus | undefined)) continue;
    totalTracked += fxConvert(Number(row.amount_received_by_org), row.currency as Currency, baseCurrency);
  }

  const verifiedExpenditures = (expenseRows ?? []).filter(
    (e) => e.verification_level && e.verification_level !== "declared"
  ).length;

  const countriesRepresented = new Set(organizations.map((o) => o.operatingCountry).filter(Boolean)).size;

  return {
    currency: baseCurrency,
    totalTracked,
    verifiedOrganizations: organizations.length,
    countriesRepresented,
    verifiedExpenditures,
  };
}

export type { Allocation, Payment };
