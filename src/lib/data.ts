// Data-access layer. Every page/component should read through these functions
// rather than importing mock-data arrays directly — this is the seam where a
// real Supabase-backed implementation would slot in later.

import type { Campaign, Currency, Donation, Expense, Grant, Organization, PaymentStatus, VerificationLevel } from "@/lib/types";
import {
  organizations,
  getVerifiedOrganizations,
  getOrganizationById,
  getOrganizationBySlug,
  campaigns,
  getCampaignById,
  getCampaignsByOrg,
  donations,
  getDonationById,
  getDonationsByDonor,
  getDonationsByOrg,
  getPaymentByDonationId,
  expenses,
  getExpenseById,
  getExpensesByOrg,
  getAllocationsForDonation,
  getAllocationsForGrant,
  getGrantById,
  getGrantsByCompany,
  getGrantsByOrg,
  getCompanyById,
  users,
  getUserById,
  donorProfiles,
  organizationMembers,
  getNotificationsForUser,
  fxConvert,
  programAllocationFor,
  platformSettings,
  getUnallocatedForDonation,
  getUnallocatedForGrant,
  getVerificationForOrg,
} from "@/lib/mock-data";

export * from "@/lib/mock-data";

// ---------------------------------------------------------------------------
// Organizations & campaigns
// ---------------------------------------------------------------------------

export function listVerifiedOrganizations(): Organization[] {
  return getVerifiedOrganizations();
}

export function listAllOrganizationsForAdmin(): Organization[] {
  return organizations;
}

function isSettled(status: PaymentStatus | undefined): boolean {
  return status === "funds_transferred" || status === "available_to_ngo";
}

export function isDonationSettled(donation: Donation): boolean {
  return isSettled(getPaymentByDonationId(donation.id)?.status);
}

export interface OrgTransparency {
  currency: Currency;
  fundsReceived: number;
  allocatedToPrograms: number;
  documentedExpenditure: number;
  awaitingDocumentation: number;
  donorCount: number;
}

export function getOrgTransparency(organizationId: string): OrgTransparency {
  const org = getOrganizationById(organizationId)!;
  const settledDonations = getDonationsByOrg(organizationId).filter(isDonationSettled);

  let fundsReceived = 0;
  let allocatedToPrograms = 0;
  for (const d of settledDonations) {
    fundsReceived += fxConvert(d.amountReceivedByOrg, d.currency, org.baseCurrency);
    allocatedToPrograms += fxConvert(programAllocationFor(d.netProceeds, org.allocationPolicy.programPct), d.currency, org.baseCurrency);
  }

  // Corporate grants are restricted program funding — count the money actually
  // transferred so far toward both funds received and program allocation.
  for (const g of getGrantsByOrg(organizationId)) {
    fundsReceived += fxConvert(g.amountTransferred, g.currency, org.baseCurrency);
    allocatedToPrograms += fxConvert(g.amountTransferred, g.currency, org.baseCurrency);
  }

  const orgExpenses = getExpensesByOrg(organizationId);
  const documentedExpenditure = orgExpenses
    .filter((e) => e.verificationLevel !== "declared")
    .reduce((sum, e) => sum + fxConvert(e.amountAllocated, e.currency, org.baseCurrency), 0);

  const awaitingDocumentation = Math.max(0, allocatedToPrograms - documentedExpenditure);
  const donorCount = new Set(settledDonations.map((d) => d.donorUserId)).size;

  return { currency: org.baseCurrency, fundsReceived, allocatedToPrograms, documentedExpenditure, awaitingDocumentation, donorCount };
}

export function getOrgPublicProfile(slug: string) {
  const organization = getOrganizationBySlug(slug);
  if (!organization) return undefined;
  const orgCampaigns = getCampaignsByOrg(organization.id);
  const transparency = getOrgTransparency(organization.id);
  const orgExpenses = getExpensesByOrg(organization.id);
  const recentExpenditures = [...orgExpenses]
    .filter((e) => e.verificationLevel !== "declared")
    .sort((a, b) => (a.expenseDate < b.expenseDate ? 1 : -1))
    .slice(0, 6);
  return { organization, campaigns: orgCampaigns, transparency, recentExpenditures };
}

export interface ExploreFilters {
  category?: string;
  query?: string;
}

export function exploreOrganizations(filters: ExploreFilters = {}) {
  let list = getVerifiedOrganizations();
  if (filters.category) {
    list = list.filter((o) => o.category.includes(filters.category as Organization["category"][number]));
  }
  if (filters.query) {
    const q = filters.query.toLowerCase();
    list = list.filter((o) => o.name.toLowerCase().includes(q) || o.mission.toLowerCase().includes(q));
  }
  return list;
}

export function exploreCampaigns(filters: ExploreFilters = {}) {
  let list = campaigns.filter((c) => {
    const org = getOrganizationById(c.organizationId);
    return org?.verificationStatus === "verified" && c.status === "active";
  });
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
// The Giving Trail
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
}

export function getDonationTrail(donationId: string): DonationTrail | undefined {
  const donation = getDonationById(donationId);
  if (!donation) return undefined;
  const organization = getOrganizationById(donation.organizationId)!;
  const campaign = donation.designation.type === "campaign" ? getCampaignById(donation.designation.campaignId) : undefined;
  const programAllocation = programAllocationFor(donation.netProceeds, organization.allocationPolicy.programPct);
  const operatingAllocation = donation.netProceeds - programAllocation;

  const donationAllocations = getAllocationsForDonation(donationId);
  const expenditures: TrailExpenditureLine[] = donationAllocations.map((a) => ({
    expense: getExpenseById(a.expenseId)!,
    allocatedAmount: a.amount,
  }));

  const allocatedToExpenditures = donationAllocations.reduce((sum, a) => sum + a.amount, 0);
  const awaitingAllocation = Math.max(0, programAllocation - allocatedToExpenditures);
  const paymentStatus = getPaymentByDonationId(donationId)?.status;

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
    paymentStatus,
  };
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

export function getDonorDashboard(userId: string): DonorDashboard {
  const profile = donorProfiles.find((p) => p.userId === userId);
  const currency: Currency = profile?.preferredCurrency ?? "USD";
  const myDonations = getDonationsByDonor(userId).filter((d) => getPaymentByDonationId(d.id)?.status !== "failed");

  const cards: DonorDonationCard[] = myDonations.map((d) => ({ trail: getDonationTrail(d.id)! }));

  const orgSet = new Set(myDonations.map((d) => d.organizationId));
  const campaignSet = new Set(
    myDonations.filter((d) => d.designation.type === "campaign").map((d) => (d.designation as { type: "campaign"; campaignId: string }).campaignId)
  );

  const totalLifetimeGiving = myDonations
    .filter((d) => getPaymentByDonationId(d.id)?.status !== "refunded")
    .reduce((sum, d) => sum + fxConvert(d.grossAmount, d.currency, currency), 0);

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

// ---------------------------------------------------------------------------
// NGO dashboard
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

export function getOrgDashboard(organizationId: string): OrgDashboard {
  const organization = getOrganizationById(organizationId)!;
  const transparency = getOrgTransparency(organizationId);
  const orgDonations = getDonationsByOrg(organizationId);
  const settledDonations = orgDonations.filter(isDonationSettled);
  const orgExpenses = getExpensesByOrg(organizationId);

  const totalFundsReceived = transparency.fundsReceived;
  const activeDonorCount = new Set(settledDonations.map((d) => d.donorUserId)).size;
  const programAllocationTotal = transparency.allocatedToPrograms;
  const totalAllocatedToExpenses = orgExpenses.reduce((s, e) => s + fxConvert(e.amountAllocated, e.currency, organization.baseCurrency), 0);
  const availableBalance = Math.max(0, programAllocationTotal - totalAllocatedToExpenses);

  const verifiedExpenseCount = orgExpenses.filter((e) => e.verificationLevel !== "declared").length;
  const awaitingDocs = orgExpenses.filter((e) => e.verificationLevel === "declared");

  const unallocatedDonations = settledDonations.filter((d) => {
    const trail = getDonationTrail(d.id)!;
    return trail.awaitingAllocation > 0;
  });
  const unallocatedDonationsAmount = unallocatedDonations.reduce((sum, d) => {
    const trail = getDonationTrail(d.id)!;
    return sum + fxConvert(trail.awaitingAllocation, d.currency, organization.baseCurrency);
  }, 0);

  const monthMap = new Map<string, number>();
  for (const d of settledDonations) {
    const month = d.createdAt.slice(0, 7);
    monthMap.set(month, (monthMap.get(month) ?? 0) + fxConvert(d.amountReceivedByOrg, d.currency, organization.baseCurrency));
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

  const orgCampaigns = getCampaignsByOrg(organizationId);
  const campaignPerformance = orgCampaigns.map((c) => ({
    campaign: c,
    raisedPct: c.fundingGoal > 0 ? c.amountRaised / c.fundingGoal : 0,
    utilizedPct: c.amountRaised > 0 ? c.amountUtilized / c.amountRaised : 0,
  }));

  const geoMap = new Map<string, number>();
  for (const d of settledDonations) {
    const donor = getUserById(d.donorUserId);
    if (!donor) continue;
    geoMap.set(donor.countryCode, (geoMap.get(donor.countryCode) ?? 0) + 1);
  }
  const donorGeography = Array.from(geoMap.entries()).map(([countryCode, count]) => ({ countryCode, count }));

  const now = new Date("2026-09-13T00:00:00Z").getTime();
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
    unallocatedDonationCount: unallocatedDonations.length,
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

// ---------------------------------------------------------------------------
// Corporate dashboard
// ---------------------------------------------------------------------------

export interface CorporateDashboard {
  company: ReturnType<typeof getCompanyById>;
  totalGiving: number;
  currency: Currency;
  organizationsFundedCount: number;
  activeGrants: Grant[];
  totalUtilizationPct: number;
  totalDocumentationPct: number;
}

export function getCorporateDashboard(companyId: string): CorporateDashboard {
  const company = getCompanyById(companyId);
  const companyGrants = getGrantsByCompany(companyId);
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

export function getGrantDetail(grantId: string): GrantDetail | undefined {
  const grant = getGrantById(grantId);
  if (!grant) return undefined;
  const organization = getOrganizationById(grant.organizationId)!;
  const campaign = grant.campaignId ? getCampaignById(grant.campaignId) : undefined;
  const grantAllocations = getAllocationsForGrant(grantId);
  const usedByLine = new Map<string, number>();
  for (const alloc of grantAllocations) {
    const expense = getExpenseById(alloc.expenseId);
    if (!expense) continue;
    const key = expense.category;
    usedByLine.set(key, (usedByLine.get(key) ?? 0) + alloc.amount);
  }
  const budgetVsActual = grant.budgetLines.map((line) => ({
    label: line.label,
    budget: line.amount,
    actual: 0,
  }));
  // attribute actuals to the closest-matching budget line by category keyword, falling back to the first line
  for (const [category, amount] of usedByLine.entries()) {
    const line = budgetVsActual.find((l) => l.label.toLowerCase().includes(category.split("_")[0])) ?? budgetVsActual[0];
    if (line) line.actual += amount;
  }
  return { grant, organization, campaign, budgetVsActual };
}

// ---------------------------------------------------------------------------
// Admin dashboard
// ---------------------------------------------------------------------------

export function getAdminAnalytics() {
  const totalDonationVolumeUSD = donations
    .filter((d) => getPaymentByDonationId(d.id)?.status !== "failed" && getPaymentByDonationId(d.id)?.status !== "refunded")
    .reduce((sum, d) => sum + fxConvert(d.grossAmount, d.currency, "USD"), 0);
  const platformRevenueUSD = donations
    .filter((d) => isDonationSettled(d))
    .reduce((sum, d) => sum + fxConvert(d.platformFee, d.currency, "USD"), 0);

  const ngoCount = organizations.length;
  const verifiedNgoCount = getVerifiedOrganizations().length;
  const donorCount = users.filter((u) => u.role === "donor").length;
  const corporateDonorCount = users.filter((u) => u.role === "corporate").length;
  const countries = new Set(organizations.map((o) => o.operatingCountry));

  const countryVolume = new Map<string, number>();
  for (const d of donations) {
    const donor = getUserById(d.donorUserId);
    if (!donor) continue;
    countryVolume.set(donor.countryCode, (countryVolume.get(donor.countryCode) ?? 0) + fxConvert(d.grossAmount, d.currency, "USD"));
  }

  const settledCount = donations.filter(isDonationSettled).length;
  const avgDonationUSD = settledCount > 0 ? totalDonationVolumeUSD / settledCount : 0;

  const totalCampaignRaised = campaigns.reduce((s, c) => s + fxConvert(c.amountRaised, c.currency, "USD"), 0);
  const totalCampaignUtilized = campaigns.reduce((s, c) => s + fxConvert(c.amountUtilized, c.currency, "USD"), 0);

  const documentedExpenseCount = expenses.filter((e) => e.verificationLevel !== "declared").length;
  const documentationRate = expenses.length > 0 ? documentedExpenseCount / expenses.length : 0;

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
    platformFeePct: platformSettings.platformFeePct,
  };
}

export function getPendingVerificationOrgs(): Organization[] {
  return organizations.filter((o) => o.verificationStatus === "under_review" || o.verificationStatus === "additional_info_required");
}

/**
 * Updates an organization's verification status at runtime (admin review action).
 * Mutates the in-memory record directly — lasts for the current browser session,
 * mirroring how a real approval would immediately update the org's public status.
 */
export function setOrgVerificationStatus(organizationId: string, status: Organization["verificationStatus"], reviewerNote?: string): void {
  const org = getOrganizationById(organizationId);
  if (!org) return;
  org.verificationStatus = status;
  if (status === "verified" && !org.verifiedSince) {
    org.verifiedSince = new Date().toISOString();
  }
  const verification = getVerificationForOrg(organizationId);
  if (verification) {
    verification.status = status;
    verification.reviewedAt = new Date().toISOString();
    if (reviewerNote) verification.reviewerNote = reviewerNote;
  }
}

export function getOrgForMember(userId: string): Organization | undefined {
  const membership = organizationMembers.find((m) => m.userId === userId);
  if (!membership) return undefined;
  return getOrganizationById(membership.organizationId);
}

export function getDonorNotifications(userId: string) {
  return getNotificationsForUser(userId);
}

// ---------------------------------------------------------------------------
// Allocation workflow (NGO side)
// ---------------------------------------------------------------------------

export function getAllocatableExpenses(organizationId: string): Expense[] {
  return getExpensesByOrg(organizationId).filter((e) => e.amount > e.amountAllocated);
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

export function getEligibleSourcesForExpense(expenseId: string): { donations: EligibleDonationSource[]; grants: EligibleGrantSource[] } {
  const expense = getExpenseById(expenseId);
  if (!expense) return { donations: [], grants: [] };

  const orgDonations = getDonationsByOrg(expense.organizationId).filter(isDonationSettled).filter((d) => donationMatchesExpense(d, expense));
  const donationSources = orgDonations
    .map((donation) => ({ donation, available: getUnallocatedForDonation(donation.id) }))
    .filter((s) => s.available > 0);

  const orgGrants = getGrantsByOrg(expense.organizationId).filter((g) => grantMatchesExpense(g, expense));
  const grantSources = orgGrants.map((grant) => ({ grant, available: getUnallocatedForGrant(grant.id) })).filter((s) => s.available > 0);

  return { donations: donationSources, grants: grantSources };
}
