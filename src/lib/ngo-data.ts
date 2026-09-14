import "server-only";
import { createClient } from "@/lib/supabase/server";
import { fxConvert, programAllocationFor } from "@/lib/mock-data/helpers";
import { getOrgTransparency, type OrgTransparency } from "@/lib/supabase-data";
import type {
  Allocation,
  Campaign,
  Company,
  Currency,
  Donation,
  Expense,
  Grant,
  GrantBudgetLine,
  Organization,
  OrganizationVerification,
  PaymentStatus,
  User,
  UserRole,
  VerificationDocument,
  VerificationLevel,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Real, Supabase-backed reads for the NGO (org_member), corporate, and admin
// slices. Unlike supabase-data.ts's donor-facing reads, everything here goes
// through the session-aware client and relies on RLS directly — org_member
// and admin both already have full read access to their own org's rows (or,
// for admin, every row) per supabase/rls.sql, so no service-role client is
// needed except where we delegate to getOrgTransparency (aggregate rollups).
// ---------------------------------------------------------------------------

type Row = Record<string, unknown>;

function mapFullOrganization(row: Row): Organization {
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
    taxNumber: (row.tax_number as string) ?? undefined,
    website: (row.website as string) ?? "",
    address: (row.address as string) ?? "",
    representativeName: (row.representative_name as string) ?? "",
    representativeTitle: (row.representative_title as string) ?? "",
    representativeEmail: (row.representative_email as string) ?? "",
    representativePhone: (row.representative_phone as string) ?? "",
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

function mapFullExpense(row: Row): Expense {
  return {
    id: row.id as string,
    organizationId: row.organization_id as string,
    campaignId: (row.campaign_id as string) ?? undefined,
    title: row.title as string,
    vendor: (row.vendor as string) ?? "",
    expenseDate: row.expense_date as string,
    amount: Number(row.amount),
    currency: row.currency as Currency,
    category: row.category as Expense["category"],
    description: (row.description as string) ?? "",
    donorSafeDescription: (row.donor_safe_description as string) ?? "",
    paymentMethod: (row.payment_method as string) ?? "",
    referenceNumber: (row.reference_number as string) ?? "",
    internalNotes: (row.internal_notes as string) ?? undefined,
    verificationLevel: row.verification_level as VerificationLevel,
    amountAllocated: Number(row.amount_allocated),
    evidence: [],
    beneficiaryProtected: Boolean(row.beneficiary_protected),
  };
}

function mapDonation(row: Row): Donation {
  const designation =
    row.designation_type === "campaign"
      ? ({ type: "campaign", campaignId: row.campaign_id as string } as const)
      : ({ type: "general_fund" } as const);
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
    paymentId: "",
  };
}

function mapAllocation(row: Row): Allocation {
  return {
    id: row.id as string,
    expenseId: row.expense_id as string,
    sourceType: row.source_type as Allocation["sourceType"],
    sourceId: row.source_id as string,
    amount: Number(row.amount),
    createdAt: row.created_at as string,
  };
}

function mapGrant(row: Row, budgetLines: GrantBudgetLine[] = []): Grant {
  return {
    id: row.id as string,
    companyId: row.company_id as string,
    organizationId: row.organization_id as string,
    campaignId: (row.campaign_id as string) ?? undefined,
    title: row.title as string,
    currency: row.currency as Currency,
    amount: Number(row.amount),
    amountTransferred: Number(row.amount_transferred),
    amountUtilized: Number(row.amount_utilized),
    amountVerified: Number(row.amount_verified),
    status: row.status as Grant["status"],
    budgetLines,
    createdAt: row.created_at as string,
  };
}

function mapUser(row: Row): User {
  return {
    id: row.id as string,
    fullName: row.full_name as string,
    email: row.email as string,
    role: row.role as UserRole,
    avatarUrl: (row.avatar_url as string) ?? undefined,
    createdAt: row.created_at as string,
    accountActivated: Boolean(row.account_activated),
    countryCode: row.country_code as string,
  };
}

function isSettled(status: PaymentStatus | undefined): boolean {
  return status === "funds_transferred" || status === "available_to_ngo";
}

// ---------------------------------------------------------------------------
// NGO (org_member) dashboard
// ---------------------------------------------------------------------------

export interface OrgDashboard {
  organization: Organization;
  totalFundsReceived: number;
  activeDonorCount: number;
  availableBalance: number;
  programAllocationTotal: number;
  verifiedExpenseCount: number;
  awaitingDocumentationCount: number;
  unallocatedDonationCount: number;
  unallocatedDonationsAmount: number;
  transparency: OrgTransparency;
  fundsReceivedByMonth: { month: string; amount: number }[];
  expenditureByCategory: { category: string; amount: number }[];
  verificationBreakdown: { level: VerificationLevel; count: number; amount: number }[];
  campaignPerformance: { campaign: Campaign; raisedPct: number; utilizedPct: number }[];
  donorGeography: { countryCode: string; count: number }[];
  expensesAwaitingReceipts: Expense[];
  documentsNeedingReview: number;
  campaignsNearingDeadline: Campaign[];
}

/** The signed-in user's organization id (org_member) and company id (corporate), if any. */
export async function getCurrentMemberships(): Promise<{ userId: string | undefined; organizationId: string | undefined; companyId: string | undefined }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { userId: undefined, organizationId: undefined, companyId: undefined };

  const [{ data: membership }, { data: corp }] = await Promise.all([
    supabase.from("organization_members").select("organization_id").eq("user_id", user.id).maybeSingle(),
    supabase.from("corporate_profiles").select("company_id").eq("user_id", user.id).maybeSingle(),
  ]);
  return {
    userId: user.id,
    organizationId: (membership?.organization_id as string) ?? undefined,
    companyId: (corp?.company_id as string) ?? undefined,
  };
}

export async function getOrganizationById(organizationId: string): Promise<Organization | undefined> {
  const supabase = await createClient();
  const { data } = await supabase.from("organizations").select("*").eq("id", organizationId).maybeSingle();
  return data ? mapFullOrganization(data) : undefined;
}

export async function getCampaignsByOrg(organizationId: string): Promise<Campaign[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("campaigns")
    .select("*")
    .eq("organization_id", organizationId)
    .order("start_date", { ascending: false });
  return (data ?? []).map(mapCampaign);
}

export async function getCampaignById(campaignId: string): Promise<Campaign | undefined> {
  const supabase = await createClient();
  const { data } = await supabase.from("campaigns").select("*, campaign_updates(*)").eq("id", campaignId).maybeSingle();
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

export async function getExpensesByOrg(organizationId: string): Promise<Expense[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("expenses")
    .select("*")
    .eq("organization_id", organizationId)
    .order("expense_date", { ascending: false });
  return (data ?? []).map(mapFullExpense);
}

export async function getExpenseById(expenseId: string): Promise<Expense | undefined> {
  const supabase = await createClient();
  const { data } = await supabase.from("expenses").select("*").eq("id", expenseId).maybeSingle();
  return data ? mapFullExpense(data) : undefined;
}

export async function getDonationsByOrg(organizationId: string): Promise<{ donation: Donation; paymentStatus: PaymentStatus | undefined }[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("donations")
    .select("*, payments(status)")
    .eq("organization_id", organizationId);
  return (data ?? []).map((row) => {
    const payment = Array.isArray(row.payments) ? row.payments[0] : row.payments;
    return { donation: mapDonation(row), paymentStatus: payment?.status as PaymentStatus | undefined };
  });
}

export async function getAllocationsForExpense(expenseId: string): Promise<Allocation[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("allocations").select("*").eq("expense_id", expenseId);
  return (data ?? []).map(mapAllocation);
}

async function getUnallocatedForDonation(donationId: string, organization: Organization): Promise<number> {
  const supabase = await createClient();
  const [{ data: donationRow }, { data: allocRows }] = await Promise.all([
    supabase.from("donations").select("net_proceeds, currency").eq("id", donationId).maybeSingle(),
    supabase.from("allocations").select("amount").eq("source_type", "donation").eq("source_id", donationId),
  ]);
  if (!donationRow) return 0;
  const programAllocation = programAllocationFor(Number(donationRow.net_proceeds), organization.allocationPolicy.programPct);
  const allocated = (allocRows ?? []).reduce((sum, a) => sum + Number(a.amount), 0);
  return Math.max(0, programAllocation - allocated);
}

async function getUnallocatedForGrant(grantId: string): Promise<number> {
  const supabase = await createClient();
  const [{ data: grantRow }, { data: allocRows }] = await Promise.all([
    supabase.from("grants").select("amount").eq("id", grantId).maybeSingle(),
    supabase.from("allocations").select("amount").eq("source_type", "grant").eq("source_id", grantId),
  ]);
  if (!grantRow) return 0;
  const allocated = (allocRows ?? []).reduce((sum, a) => sum + Number(a.amount), 0);
  return Math.max(0, Number(grantRow.amount) - allocated);
}

export async function getOrgDashboard(organizationId: string): Promise<OrgDashboard> {
  const supabase = await createClient();
  const organization = await getOrganizationById(organizationId);
  if (!organization) throw new Error("Organization not found");

  const [transparency, donationRows, orgExpenses, orgCampaigns] = await Promise.all([
    getOrgTransparency(organizationId, organization.baseCurrency, organization.allocationPolicy.programPct),
    getDonationsByOrg(organizationId),
    getExpensesByOrg(organizationId),
    getCampaignsByOrg(organizationId),
  ]);

  const settledDonations = donationRows.filter((d) => isSettled(d.paymentStatus));
  const totalFundsReceived = transparency.fundsReceived;
  const activeDonorCount = new Set(settledDonations.map((d) => d.donation.donorUserId).filter(Boolean)).size;
  const programAllocationTotal = transparency.allocatedToPrograms;
  const totalAllocatedToExpenses = orgExpenses.reduce(
    (s, e) => s + fxConvert(e.amountAllocated, e.currency, organization.baseCurrency),
    0
  );
  const availableBalance = Math.max(0, programAllocationTotal - totalAllocatedToExpenses);

  const verifiedExpenseCount = orgExpenses.filter((e) => e.verificationLevel !== "declared").length;
  const awaitingDocs = orgExpenses.filter((e) => e.verificationLevel === "declared");

  let unallocatedDonationCount = 0;
  let unallocatedDonationsAmount = 0;
  for (const { donation } of settledDonations) {
    const unallocated = await getUnallocatedForDonation(donation.id, organization);
    if (unallocated > 0) {
      unallocatedDonationCount += 1;
      unallocatedDonationsAmount += fxConvert(unallocated, donation.currency, organization.baseCurrency);
    }
  }

  const monthMap = new Map<string, number>();
  for (const { donation } of settledDonations) {
    const month = donation.createdAt.slice(0, 7);
    monthMap.set(month, (monthMap.get(month) ?? 0) + fxConvert(donation.amountReceivedByOrg, donation.currency, organization.baseCurrency));
  }
  const fundsReceivedByMonth = Array.from(monthMap.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([month, amount]) => ({ month, amount }));

  const categoryMap = new Map<string, number>();
  for (const e of orgExpenses) {
    categoryMap.set(e.category, (categoryMap.get(e.category) ?? 0) + fxConvert(e.amountAllocated, e.currency, organization.baseCurrency));
  }
  const expenditureByCategory = Array.from(categoryMap.entries()).map(([category, amount]) => ({ category, amount }));

  const levels: VerificationLevel[] = ["declared", "documented", "financially_verified", "program_verified", "independently_verified"];
  const verificationBreakdown = levels.map((level) => {
    const matching = orgExpenses.filter((e) => e.verificationLevel === level);
    return {
      level,
      count: matching.length,
      amount: matching.reduce((s, e) => s + fxConvert(e.amount, e.currency, organization.baseCurrency), 0),
    };
  });

  const campaignPerformance = orgCampaigns.map((c) => ({
    campaign: c,
    raisedPct: c.fundingGoal > 0 ? c.amountRaised / c.fundingGoal : 0,
    utilizedPct: c.amountRaised > 0 ? c.amountUtilized / c.amountRaised : 0,
  }));

  const donorIds = Array.from(new Set(settledDonations.map((d) => d.donation.donorUserId).filter(Boolean)));
  const geoMap = new Map<string, number>();
  if (donorIds.length > 0) {
    const { data: donorRows } = await supabase.from("profiles").select("country_code").in("id", donorIds);
    for (const row of donorRows ?? []) {
      const cc = row.country_code as string;
      geoMap.set(cc, (geoMap.get(cc) ?? 0) + 1);
    }
  }
  const donorGeography = Array.from(geoMap.entries()).map(([countryCode, count]) => ({ countryCode, count }));

  const now = Date.now();
  const campaignsNearingDeadline = orgCampaigns.filter((c) => {
    if (!c.endDate || c.status !== "active") return false;
    const days = (new Date(c.endDate).getTime() - now) / (1000 * 60 * 60 * 24);
    return days >= 0 && days <= 30;
  });

  return {
    organization,
    totalFundsReceived,
    activeDonorCount,
    availableBalance,
    programAllocationTotal,
    verifiedExpenseCount,
    awaitingDocumentationCount: awaitingDocs.length,
    unallocatedDonationCount,
    unallocatedDonationsAmount,
    transparency,
    fundsReceivedByMonth,
    expenditureByCategory,
    verificationBreakdown,
    campaignPerformance,
    donorGeography,
    expensesAwaitingReceipts: awaitingDocs,
    documentsNeedingReview: 0,
    campaignsNearingDeadline,
  };
}

export async function getAllocatableExpenses(organizationId: string): Promise<Expense[]> {
  const expenses = await getExpensesByOrg(organizationId);
  return expenses.filter((e) => e.amount > e.amountAllocated);
}

export interface EligibleDonationSource {
  donation: Donation;
  available: number;
}
export interface EligibleGrantSource {
  grant: Grant;
  available: number;
}

function donationMatchesExpense(donation: Donation, expense: Expense): boolean {
  if (donation.currency !== expense.currency) return false;
  if (!expense.campaignId) return true;
  return donation.designation.type === "general_fund" || donation.designation.campaignId === expense.campaignId;
}

function grantMatchesExpense(grant: Grant, expense: Expense): boolean {
  if (grant.currency !== expense.currency) return false;
  if (!expense.campaignId) return true;
  return !grant.campaignId || grant.campaignId === expense.campaignId;
}

export async function getEligibleSourcesForExpense(
  expenseId: string
): Promise<{ donations: EligibleDonationSource[]; grants: EligibleGrantSource[] }> {
  const expense = await getExpenseById(expenseId);
  if (!expense) return { donations: [], grants: [] };
  const organization = await getOrganizationById(expense.organizationId);
  if (!organization) return { donations: [], grants: [] };

  const [donationRows, grantRows] = await Promise.all([
    getDonationsByOrg(expense.organizationId),
    getGrantsByOrg(expense.organizationId),
  ]);

  const eligibleDonations = donationRows.filter((d) => isSettled(d.paymentStatus)).filter((d) => donationMatchesExpense(d.donation, expense));
  const donationSources: EligibleDonationSource[] = [];
  for (const { donation } of eligibleDonations) {
    const available = await getUnallocatedForDonation(donation.id, organization);
    if (available > 0) donationSources.push({ donation, available });
  }

  const eligibleGrants = grantRows.filter((g) => grantMatchesExpense(g, expense));
  const grantSources: EligibleGrantSource[] = [];
  for (const grant of eligibleGrants) {
    const available = await getUnallocatedForGrant(grant.id);
    if (available > 0) grantSources.push({ grant, available });
  }

  return { donations: donationSources, grants: grantSources };
}

export async function getGrantsByOrg(organizationId: string): Promise<Grant[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("grants").select("*").eq("organization_id", organizationId);
  return (data ?? []).map((row) => mapGrant(row));
}

// ---------------------------------------------------------------------------
// Verification (NGO read-only view + admin review actions)
// ---------------------------------------------------------------------------

export async function getVerificationForOrg(organizationId: string): Promise<OrganizationVerification | undefined> {
  const supabase = await createClient();
  const [{ data: verRow }, { data: docRows }] = await Promise.all([
    supabase.from("organization_verifications").select("*").eq("organization_id", organizationId).maybeSingle(),
    supabase.from("verification_documents").select("*").eq("organization_id", organizationId).order("uploaded_at"),
  ]);
  if (!verRow) return undefined;
  const documents: VerificationDocument[] = (docRows ?? []).map((d) => ({
    id: d.id as string,
    organizationId: d.organization_id as string,
    type: d.type as VerificationDocument["type"],
    fileName: d.file_name as string,
    uploadedAt: d.uploaded_at as string,
    status: d.status as VerificationDocument["status"],
  }));
  return {
    organizationId,
    status: verRow.status as OrganizationVerification["status"],
    submittedAt: (verRow.submitted_at as string) ?? undefined,
    reviewedAt: (verRow.reviewed_at as string) ?? undefined,
    reviewerNote: (verRow.reviewer_note as string) ?? undefined,
    documents,
  };
}

// ---------------------------------------------------------------------------
// Corporate dashboard
// ---------------------------------------------------------------------------

export interface CorporateDashboard {
  company: Company | undefined;
  totalGiving: number;
  currency: Currency;
  organizationsFundedCount: number;
  activeGrants: Grant[];
  totalUtilizationPct: number;
  totalDocumentationPct: number;
}

export async function getCompanyById(companyId: string): Promise<Company | undefined> {
  const supabase = await createClient();
  const { data } = await supabase.from("companies").select("*").eq("id", companyId).maybeSingle();
  if (!data) return undefined;
  return {
    id: data.id as string,
    name: data.name as string,
    logoUrl: (data.logo_url as string) ?? "",
    countryCode: data.country_code as string,
    authorizedRepresentativeUserId: (data.authorized_representative_user_id as string) ?? "",
  };
}

export async function getGrantsByCompany(companyId: string): Promise<Grant[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("grants").select("*").eq("company_id", companyId).order("created_at", { ascending: false });
  return (data ?? []).map((row) => mapGrant(row));
}

export async function getCorporateDashboard(companyId: string): Promise<CorporateDashboard> {
  const [company, companyGrants] = await Promise.all([getCompanyById(companyId), getGrantsByCompany(companyId)]);
  const currency: Currency = companyGrants[0]?.currency ?? "USD";
  const totalGiving = companyGrants.reduce((s, g) => s + fxConvert(g.amount, g.currency, currency), 0);
  const organizationsFundedCount = new Set(companyGrants.map((g) => g.organizationId)).size;
  const activeGrants = companyGrants.filter((g) => g.status === "active" || g.status === "pending_transfer");
  const totalTransferred = companyGrants.reduce((s, g) => s + fxConvert(g.amountTransferred, g.currency, currency), 0);
  const totalUtilized = companyGrants.reduce((s, g) => s + fxConvert(g.amountUtilized, g.currency, currency), 0);
  const totalVerified = companyGrants.reduce((s, g) => s + fxConvert(g.amountVerified, g.currency, currency), 0);
  return {
    company,
    totalGiving,
    currency,
    organizationsFundedCount,
    activeGrants,
    totalUtilizationPct: totalTransferred > 0 ? totalUtilized / totalTransferred : 0,
    totalDocumentationPct: totalUtilized > 0 ? totalVerified / totalUtilized : 0,
  };
}

export interface GrantDetail {
  grant: Grant;
  organization: Organization;
  campaign?: Campaign;
  budgetVsActual: { label: string; budget: number; actual: number }[];
}

export async function getGrantDetail(grantId: string): Promise<GrantDetail | undefined> {
  const supabase = await createClient();
  const { data: grantRow } = await supabase.from("grants").select("*").eq("id", grantId).maybeSingle();
  if (!grantRow) return undefined;

  const [{ data: budgetRows }, organization, { data: allocRows }] = await Promise.all([
    supabase.from("grant_budget_lines").select("*").eq("grant_id", grantId),
    getOrganizationById(grantRow.organization_id as string),
    supabase.from("allocations").select("expense_id, amount").eq("source_type", "grant").eq("source_id", grantId),
  ]);
  if (!organization) return undefined;

  const campaign = grantRow.campaign_id ? await getCampaignBySlugId(grantRow.campaign_id as string) : undefined;
  const budgetLines: GrantBudgetLine[] = (budgetRows ?? []).map((l) => ({
    id: l.id as string,
    grantId: l.grant_id as string,
    label: l.label as string,
    amount: Number(l.amount),
  }));

  const expenseIds = Array.from(new Set((allocRows ?? []).map((a) => a.expense_id as string)));
  const categoryByExpenseId = new Map<string, string>();
  if (expenseIds.length > 0) {
    const { data: expenseRows } = await supabase.from("expenses").select("id, category").in("id", expenseIds);
    for (const e of expenseRows ?? []) categoryByExpenseId.set(e.id as string, e.category as string);
  }

  const usedByCategory = new Map<string, number>();
  for (const a of allocRows ?? []) {
    const category = categoryByExpenseId.get(a.expense_id as string);
    if (!category) continue;
    usedByCategory.set(category, (usedByCategory.get(category) ?? 0) + Number(a.amount));
  }

  const budgetVsActual = budgetLines.map((line) => ({ label: line.label, budget: line.amount, actual: 0 }));
  for (const [category, amount] of usedByCategory.entries()) {
    const line = budgetVsActual.find((l) => l.label.toLowerCase().includes(category.split("_")[0])) ?? budgetVsActual[0];
    if (line) line.actual += amount;
  }

  return { grant: mapGrant(grantRow, budgetLines), organization, campaign, budgetVsActual };
}

async function getCampaignBySlugId(campaignId: string): Promise<Campaign | undefined> {
  const supabase = await createClient();
  const { data } = await supabase.from("campaigns").select("*").eq("id", campaignId).maybeSingle();
  return data ? mapCampaign(data) : undefined;
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export async function listAllOrganizationsForAdmin(): Promise<Organization[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("organizations").select("*").order("name");
  return (data ?? []).map(mapFullOrganization);
}

export async function getPendingVerificationOrgs(): Promise<Organization[]> {
  const all = await listAllOrganizationsForAdmin();
  return all.filter((o) => o.verificationStatus === "under_review" || o.verificationStatus === "additional_info_required");
}

export async function getAllDonationsForAdmin(): Promise<
  { donation: Donation; paymentStatus: PaymentStatus | undefined; donor: User | undefined; organization: Organization | undefined }[]
> {
  const supabase = await createClient();
  const [{ data: donationRows }, orgs] = await Promise.all([
    supabase.from("donations").select("*, payments(status)").order("created_at", { ascending: false }),
    listAllOrganizationsForAdmin(),
  ]);
  const orgById = new Map(orgs.map((o) => [o.id, o]));
  const donorIds = Array.from(new Set((donationRows ?? []).map((d) => d.donor_user_id as string).filter(Boolean)));
  const donorById = new Map<string, User>();
  if (donorIds.length > 0) {
    const { data: donorRows } = await supabase.from("profiles").select("*").in("id", donorIds);
    for (const row of donorRows ?? []) donorById.set(row.id as string, mapUser(row));
  }
  return (donationRows ?? []).map((row) => {
    const payment = Array.isArray(row.payments) ? row.payments[0] : row.payments;
    const donation = mapDonation(row);
    return {
      donation,
      paymentStatus: payment?.status as PaymentStatus | undefined,
      donor: donorById.get(donation.donorUserId),
      organization: orgById.get(donation.organizationId),
    };
  });
}

export async function getAllUsersForAdmin(): Promise<User[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  return (data ?? []).map(mapUser);
}

export async function getAllCampaignsForAdmin(): Promise<{ campaign: Campaign; organization: Organization | undefined }[]> {
  const supabase = await createClient();
  const [{ data: campaignRows }, orgs] = await Promise.all([
    supabase.from("campaigns").select("*"),
    listAllOrganizationsForAdmin(),
  ]);
  const orgById = new Map(orgs.map((o) => [o.id, o]));
  return (campaignRows ?? []).map((row) => ({ campaign: mapCampaign(row), organization: orgById.get(row.organization_id as string) }));
}

export interface AdminAnalytics {
  totalDonationVolumeUSD: number;
  platformRevenueUSD: number;
  ngoCount: number;
  verifiedNgoCount: number;
  donorCount: number;
  corporateDonorCount: number;
  countryCount: number;
  countryVolume: { countryCode: string; amount: number }[];
  avgDonationUSD: number;
  campaignUtilizationPct: number;
  documentationRate: number;
  platformFeePct: number;
}

export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  const supabase = await createClient();
  const [orgs, users, allDonations, { data: campaignRows }, { data: expenseRows }, { data: settingsRow }] = await Promise.all([
    listAllOrganizationsForAdmin(),
    getAllUsersForAdmin(),
    getAllDonationsForAdmin(),
    supabase.from("campaigns").select("amount_raised, amount_utilized, currency"),
    supabase.from("expenses").select("verification_level"),
    supabase.from("platform_settings").select("platform_fee_pct").eq("id", true).maybeSingle(),
  ]);

  const totalDonationVolumeUSD = allDonations
    .filter((d) => d.paymentStatus !== "failed" && d.paymentStatus !== "refunded")
    .reduce((sum, d) => sum + fxConvert(d.donation.grossAmount, d.donation.currency, "USD"), 0);
  const platformRevenueUSD = allDonations
    .filter((d) => isSettled(d.paymentStatus))
    .reduce((sum, d) => sum + fxConvert(d.donation.platformFee, d.donation.currency, "USD"), 0);

  const ngoCount = orgs.length;
  const verifiedNgoCount = orgs.filter((o) => o.verificationStatus === "verified").length;
  const donorCount = users.filter((u) => u.role === "donor").length;
  const corporateDonorCount = users.filter((u) => u.role === "corporate").length;
  const countries = new Set(orgs.map((o) => o.operatingCountry));

  const countryVolume = new Map<string, number>();
  for (const d of allDonations) {
    if (!d.donor) continue;
    countryVolume.set(d.donor.countryCode, (countryVolume.get(d.donor.countryCode) ?? 0) + fxConvert(d.donation.grossAmount, d.donation.currency, "USD"));
  }

  const settledCount = allDonations.filter((d) => isSettled(d.paymentStatus)).length;
  const avgDonationUSD = settledCount > 0 ? totalDonationVolumeUSD / settledCount : 0;

  const totalCampaignRaised = (campaignRows ?? []).reduce((s, c) => s + fxConvert(Number(c.amount_raised), c.currency as Currency, "USD"), 0);
  const totalCampaignUtilized = (campaignRows ?? []).reduce((s, c) => s + fxConvert(Number(c.amount_utilized), c.currency as Currency, "USD"), 0);

  const documentedExpenseCount = (expenseRows ?? []).filter((e) => e.verification_level !== "declared").length;
  const documentationRate = (expenseRows ?? []).length > 0 ? documentedExpenseCount / (expenseRows ?? []).length : 0;

  return {
    totalDonationVolumeUSD,
    platformRevenueUSD,
    ngoCount,
    verifiedNgoCount,
    donorCount,
    corporateDonorCount,
    countryCount: countries.size,
    countryVolume: Array.from(countryVolume.entries()).map(([countryCode, amount]) => ({ countryCode, amount })),
    avgDonationUSD,
    campaignUtilizationPct: totalCampaignRaised > 0 ? totalCampaignUtilized / totalCampaignRaised : 0,
    documentationRate,
    platformFeePct: Number(settingsRow?.platform_fee_pct ?? 0.01),
  };
}
