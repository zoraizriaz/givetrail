"use client";

// This prototype mutates its in-memory mock-data module state at runtime
// (admin approvals, allocation workflow, verification advancement) so the
// whole app stays consistent within a browsing session without a backend.
// That in-memory state resets on a hard reload — this module persists the
// *actions taken* to localStorage and replays them once at app bootstrap so
// a reload doesn't undo a demo reviewer's changes.

import { readList, appendToList } from "@/lib/local-store";
import { setOrgVerificationStatus, recordAllocation, getExpenseById } from "@/lib/data";
import type { OrgVerificationStatus, VerificationLevel } from "@/lib/types";

const ORG_STATUS_KEY = "givetrail:overrides:orgStatus";
const ALLOCATION_KEY = "givetrail:overrides:allocations";
const EXPENSE_LEVEL_KEY = "givetrail:overrides:expenseLevels";

interface OrgStatusOverride {
  organizationId: string;
  status: OrgVerificationStatus;
}

interface AllocationOverride {
  expenseId: string;
  sourceType: "donation" | "grant";
  sourceId: string;
  desiredAmount: number;
}

interface ExpenseLevelOverride {
  expenseId: string;
  level: VerificationLevel;
}

export function persistOrgStatusOverride(organizationId: string, status: OrgVerificationStatus) {
  const all = readList<OrgStatusOverride>(ORG_STATUS_KEY).filter((o) => o.organizationId !== organizationId);
  all.push({ organizationId, status });
  window.localStorage.setItem(ORG_STATUS_KEY, JSON.stringify(all));
}

export function persistAllocationOverride(entry: AllocationOverride) {
  appendToList<AllocationOverride>(ALLOCATION_KEY, entry);
}

export function persistExpenseLevelOverride(expenseId: string, level: VerificationLevel) {
  const all = readList<ExpenseLevelOverride>(EXPENSE_LEVEL_KEY).filter((o) => o.expenseId !== expenseId);
  all.push({ expenseId, level });
  window.localStorage.setItem(EXPENSE_LEVEL_KEY, JSON.stringify(all));
}

let applied = false;

/** Replays every persisted admin/NGO action back onto the fresh in-memory data. Call once at app bootstrap. */
export function applyRuntimeOverrides() {
  if (applied) return;
  applied = true;

  for (const { organizationId, status } of readList<OrgStatusOverride>(ORG_STATUS_KEY)) {
    setOrgVerificationStatus(organizationId, status);
  }
  for (const { expenseId, sourceType, sourceId, desiredAmount } of readList<AllocationOverride>(ALLOCATION_KEY)) {
    recordAllocation(expenseId, sourceType, sourceId, desiredAmount);
  }
  for (const { expenseId, level } of readList<ExpenseLevelOverride>(EXPENSE_LEVEL_KEY)) {
    const expense = getExpenseById(expenseId);
    if (expense) expense.verificationLevel = level;
  }
}
