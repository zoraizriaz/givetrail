"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireOrgAccess } from "@/lib/actions/auth-guards";
import { getAllocatableExpenses, getEligibleSourcesForExpense } from "@/lib/ngo-data";
import type { ExpenseCategory, OrgCategory, VerificationLevel } from "@/lib/types";

export async function fetchAllocatableExpenses(organizationId: string) {
  return getAllocatableExpenses(organizationId);
}

export async function fetchEligibleSourcesForExpense(expenseId: string) {
  return getEligibleSourcesForExpense(expenseId);
}

const LEVEL_ORDER: VerificationLevel[] = ["declared", "documented", "financially_verified", "program_verified", "independently_verified"];

/**
 * Records an allocation of a donation/grant to an expense. Runs with the
 * service-role client — allocations/expenses have no client-writable RLS
 * policy by design (see supabase/rls.sql) — but only after confirming the
 * caller belongs to the expense's organization (or is an admin).
 *
 * Not fully atomic (read-then-write, like the original prototype's in-memory
 * version): acceptable for a single small NGO team's usage today, but a
 * real multi-editor deployment should move this into a Postgres RPC that
 * locks the expense row for the duration of the update.
 */
export async function recordAllocation(
  expenseId: string,
  sourceType: "donation" | "grant",
  sourceId: string,
  desiredAmount: number
): Promise<number> {
  const admin = createAdminClient();
  const { data: expense } = await admin.from("expenses").select("*").eq("id", expenseId).maybeSingle();
  if (!expense) return 0;
  await requireOrgAccess(expense.organization_id as string);

  let available: number;
  if (sourceType === "donation") {
    const [{ data: donation }, { data: allocs }] = await Promise.all([
      admin.from("donations").select("net_proceeds").eq("id", sourceId).maybeSingle(),
      admin.from("allocations").select("amount").eq("source_type", "donation").eq("source_id", sourceId),
    ]);
    if (!donation) return 0;
    const { data: org } = await admin.from("organizations").select("allocation_policy_program_pct").eq("id", expense.organization_id).single();
    const programAllocation = Math.round(Number(donation.net_proceeds) * Number(org?.allocation_policy_program_pct ?? 0));
    const allocated = (allocs ?? []).reduce((s, a) => s + Number(a.amount), 0);
    available = Math.max(0, programAllocation - allocated);
  } else {
    const [{ data: grant }, { data: allocs }] = await Promise.all([
      admin.from("grants").select("amount").eq("id", sourceId).maybeSingle(),
      admin.from("allocations").select("amount").eq("source_type", "grant").eq("source_id", sourceId),
    ]);
    if (!grant) return 0;
    const allocated = (allocs ?? []).reduce((s, a) => s + Number(a.amount), 0);
    available = Math.max(0, Number(grant.amount) - allocated);
  }

  const needed = Number(expense.amount) - Number(expense.amount_allocated);
  const actual = Math.max(0, Math.min(desiredAmount, needed, available));
  if (actual <= 0) return 0;

  const { error: insertError } = await admin.from("allocations").insert({
    expense_id: expenseId,
    source_type: sourceType,
    source_id: sourceId,
    amount: actual,
  });
  if (insertError) throw new Error(`Failed to record allocation: ${insertError.message}`);

  const { error: updateError } = await admin
    .from("expenses")
    .update({ amount_allocated: Number(expense.amount_allocated) + actual })
    .eq("id", expenseId);
  if (updateError) throw new Error(`Failed to update expense: ${updateError.message}`);

  revalidatePath("/org/allocations");
  revalidatePath(`/org/expenses/${expenseId}`);
  return actual;
}

export async function setExpenseVerificationLevel(expenseId: string, level: VerificationLevel): Promise<void> {
  const admin = createAdminClient();
  const { data: expense } = await admin.from("expenses").select("organization_id, verification_level").eq("id", expenseId).maybeSingle();
  if (!expense) throw new Error("Expense not found");
  await requireOrgAccess(expense.organization_id as string);

  const currentIndex = LEVEL_ORDER.indexOf(expense.verification_level as VerificationLevel);
  if (LEVEL_ORDER.indexOf(level) !== currentIndex + 1) throw new Error("Verification level must advance one step at a time");

  const { error } = await admin.from("expenses").update({ verification_level: level }).eq("id", expenseId);
  if (error) throw new Error(`Failed to update verification level: ${error.message}`);
  revalidatePath(`/org/expenses/${expenseId}`);
}

interface CreateCampaignInput {
  organizationId: string;
  title: string;
  description: string;
  category: OrgCategory;
  location: string;
  currency: string;
  fundingGoalMajor: number;
}

export async function createCampaign(input: CreateCampaignInput): Promise<{ campaignId: string }> {
  await requireOrgAccess(input.organizationId);
  const admin = createAdminClient();
  const slug = `${input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now().toString(36)}`;

  const { data, error } = await admin
    .from("campaigns")
    .insert({
      organization_id: input.organizationId,
      slug,
      title: input.title,
      description: input.description,
      category: input.category,
      location: input.location,
      currency: input.currency,
      funding_goal: Math.round(input.fundingGoalMajor * 100),
      status: "active",
    })
    .select("id")
    .single();
  if (error || !data) throw new Error(`Failed to create campaign: ${error?.message}`);

  revalidatePath("/org/campaigns");
  return { campaignId: data.id as string };
}

export async function postCampaignUpdate(campaignId: string, organizationId: string, body: string): Promise<void> {
  await requireOrgAccess(organizationId);
  const admin = createAdminClient();
  const { error } = await admin.from("campaign_updates").insert({
    campaign_id: campaignId,
    title: "Campaign update",
    body,
  });
  if (error) throw new Error(`Failed to post update: ${error.message}`);
  revalidatePath(`/org/campaigns/${campaignId}`);
}

interface CreateExpenseInput {
  organizationId: string;
  campaignId?: string;
  title: string;
  vendor: string;
  expenseDate: string;
  amountMajor: number;
  currency: string;
  category: ExpenseCategory;
  description: string;
  donorSafeDescription: string;
  paymentMethod: string;
  referenceNumber: string;
  beneficiaryProtected: boolean;
  receiptAttached: boolean;
}

export async function createExpense(input: CreateExpenseInput): Promise<{ expenseId: string }> {
  await requireOrgAccess(input.organizationId);
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("expenses")
    .insert({
      organization_id: input.organizationId,
      campaign_id: input.campaignId ?? null,
      title: input.title,
      vendor: input.vendor,
      expense_date: input.expenseDate,
      amount: Math.round(input.amountMajor * 100),
      currency: input.currency,
      category: input.category,
      description: input.description,
      donor_safe_description: input.donorSafeDescription || input.description,
      payment_method: input.paymentMethod,
      reference_number: input.referenceNumber,
      beneficiary_protected: input.beneficiaryProtected,
      verification_level: input.receiptAttached ? "documented" : "declared",
    })
    .select("id")
    .single();
  if (error || !data) throw new Error(`Failed to create expense: ${error?.message}`);

  if (input.receiptAttached) {
    await admin.from("evidence_documents").insert({
      expense_id: data.id,
      type: "receipt",
      file_name: "receipt.pdf",
      donor_visible: true,
      redacted: false,
    });
  }

  revalidatePath("/org/expenses");
  return { expenseId: data.id as string };
}
