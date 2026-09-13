import type { Allocation, Expense } from "@/lib/types";
import { toMinorUnits } from "@/lib/utils/currency";
import { capAllocation, programAllocationFor } from "./helpers";
import {
  donHero,
  donMichael1,
  donNoah1,
  donLayla1,
  donGrace1,
  donGrace2,
  donDaniel1,
  donEmma2,
  donTom2,
  donMichael2,
  donDavid2,
  donDaniel2,
  getDonationById,
} from "./donations";
import { getOrganizationById } from "./organizations";
import { getGrantById } from "./grants";
import {
  expHeroDiagnostic,
  expHeroMedication,
  expHeroTransport,
  expHeroFood,
  expMedSuppliesBulk,
  expOutreach,
  expCompleteA,
  expCompleteB,
  expTextbooks,
  expTeacherStipends,
  expSchoolSupplies,
  expGirlsLitMaterials,
  expGeneralAdmin,
  expCancerMedication,
  expCancerHospitalFees,
  expCancerNutritionSupport,
  expPediatricFormula,
  expPediatricCheckups,
  expOrgAdminMaple,
  getExpenseById,
} from "./expenses";

const remaining = new Map<string, number>();

function donationAvailable(donationId: string): number {
  if (!remaining.has(donationId)) {
    const donation = getDonationById(donationId);
    if (!donation) throw new Error(`Unknown donation in allocations seed: ${donationId}`);
    const org = getOrganizationById(donation.organizationId)!;
    remaining.set(donationId, programAllocationFor(donation.netProceeds, org.allocationPolicy.programPct));
  }
  return remaining.get(donationId)!;
}

function grantAvailable(grantId: string): number {
  if (!remaining.has(grantId)) {
    const grant = getGrantById(grantId);
    if (!grant) throw new Error(`Unknown grant in allocations seed: ${grantId}`);
    remaining.set(grantId, grant.amount);
  }
  return remaining.get(grantId)!;
}

export const allocations: Allocation[] = [];
let allocSeq = 0;

function allocate(expense: Expense, sourceType: "donation" | "grant", sourceId: string, desiredMajor: number, at: string) {
  const desired = toMinorUnits(desiredMajor);
  const available = sourceType === "donation" ? donationAvailable(sourceId) : grantAvailable(sourceId);
  const actual = capAllocation(desired, available);
  if (actual <= 0) return;
  remaining.set(sourceId, available - actual);
  allocSeq += 1;
  allocations.push({
    id: `alloc-${allocSeq}`,
    expenseId: expense.id,
    sourceType,
    sourceId,
    amount: actual,
    createdAt: at,
  });
  expense.amountAllocated += actual;
}

// Featured $500 donation, fully attributed across four expenditures ($386 of $426 program allocation).
allocate(expHeroDiagnostic, "donation", donHero.id, 120, "2026-06-29T00:00:00Z");
allocate(expHeroMedication, "donation", donHero.id, 96, "2026-07-03T00:00:00Z");
allocate(expHeroTransport, "donation", donHero.id, 80, "2026-07-06T00:00:00Z");
allocate(expHeroFood, "donation", donHero.id, 90, "2026-07-11T00:00:00Z");

// Multi-source $4,800 bulk medical supplies invoice — donations + a corporate grant.
allocate(expMedSuppliesBulk, "donation", donMichael1.id, 300, "2026-05-16T00:00:00Z");
allocate(expMedSuppliesBulk, "donation", donNoah1.id, 750, "2026-05-16T00:00:00Z");
allocate(expMedSuppliesBulk, "grant", "grant-1", 3750, "2026-05-16T00:00:00Z");

// Community outreach, funded by the same maternal health grant.
allocate(expOutreach, "grant", "grant-1", 850, "2026-06-02T00:00:00Z");

// The "100% accounted for" donation — split so it's exactly fully allocated.
const horizon = getOrganizationById("org-horizon")!;
const donSarahComplete = getDonationById("don-sarah-complete")!;
const completeAvailable = programAllocationFor(donSarahComplete.netProceeds, horizon.allocationPolicy.programPct);
allocate(expCompleteA, "donation", donSarahComplete.id, Math.round(completeAvailable * 0.55) / 100, "2026-03-11T00:00:00Z");
allocate(expCompleteB, "donation", donSarahComplete.id, (completeAvailable - Math.round(completeAvailable * 0.55)) / 100, "2026-03-16T00:00:00Z");

// Bright Path Education Trust
allocate(expTextbooks, "donation", donLayla1.id, 18000, "2026-03-21T00:00:00Z");
allocate(expTeacherStipends, "donation", donGrace2.id, 20000, "2026-08-06T00:00:00Z");
allocate(expSchoolSupplies, "donation", donDaniel1.id, 9500, "2026-06-19T00:00:00Z");
allocate(expGirlsLitMaterials, "donation", donGrace1.id, 7200, "2026-02-15T00:00:00Z");
allocate(expGeneralAdmin, "donation", donLayla1.id, 12000, "2026-08-02T00:00:00Z");

// Maple Grove Children's Fund
allocate(expCancerMedication, "donation", donEmma2.id, 200, "2026-07-02T00:00:00Z");
allocate(expCancerMedication, "donation", donTom2.id, 300, "2026-07-02T00:00:00Z");
allocate(expCancerHospitalFees, "donation", donTom2.id, 700, "2026-04-13T00:00:00Z");
allocate(expCancerNutritionSupport, "donation", donEmma2.id, 90, "2026-02-06T00:00:00Z");
allocate(expPediatricFormula, "donation", donMichael2.id, 120, "2026-08-02T00:00:00Z");
allocate(expPediatricFormula, "donation", donDavid2.id, 100, "2026-08-02T00:00:00Z");
allocate(expPediatricCheckups, "donation", donDaniel2.id, 150, "2026-03-23T00:00:00Z");
allocate(expOrgAdminMaple, "donation", donTom2.id, 300, "2026-05-29T00:00:00Z");

export function getAllocationsForExpense(expenseId: string): Allocation[] {
  return allocations.filter((a) => a.expenseId === expenseId);
}

export function getAllocationsForDonation(donationId: string): Allocation[] {
  return allocations.filter((a) => a.sourceType === "donation" && a.sourceId === donationId);
}

export function getAllocationsForGrant(grantId: string): Allocation[] {
  return allocations.filter((a) => a.sourceType === "grant" && a.sourceId === grantId);
}

/** How much of a donation's program allocation has not yet been assigned to any expense. */
export function getUnallocatedForDonation(donationId: string): number {
  const donation = getDonationById(donationId);
  if (!donation) return 0;
  const org = getOrganizationById(donation.organizationId)!;
  const programAllocation = programAllocationFor(donation.netProceeds, org.allocationPolicy.programPct);
  const allocated = getAllocationsForDonation(donationId).reduce((sum, a) => sum + a.amount, 0);
  return Math.max(0, programAllocation - allocated);
}

/** How much of a grant has not yet been assigned to any expense. */
export function getUnallocatedForGrant(grantId: string): number {
  const grant = getGrantById(grantId);
  if (!grant) return 0;
  const allocated = getAllocationsForGrant(grantId).reduce((sum, a) => sum + a.amount, 0);
  return Math.max(0, grant.amount - allocated);
}

/**
 * Records a new allocation at runtime (used by the NGO allocation workflow UI).
 * Mutates the in-memory expense/allocations arrays directly — this prototype has
 * no backend, so the effect lasts for the current browser session rather than
 * being written to a database.
 */
export function recordAllocation(expenseId: string, sourceType: "donation" | "grant", sourceId: string, desiredAmount: number): number {
  const expense = getExpenseById(expenseId);
  if (!expense) return 0;
  const available = sourceType === "donation" ? getUnallocatedForDonation(sourceId) : getUnallocatedForGrant(sourceId);
  const needed = expense.amount - expense.amountAllocated;
  const actual = capAllocation(Math.min(desiredAmount, needed), available);
  if (actual <= 0) return 0;
  allocSeq += 1;
  allocations.push({
    id: `alloc-${allocSeq}`,
    expenseId,
    sourceType,
    sourceId,
    amount: actual,
    createdAt: new Date().toISOString(),
  });
  expense.amountAllocated += actual;
  return actual;
}
