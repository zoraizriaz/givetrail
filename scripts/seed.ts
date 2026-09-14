/**
 * One-off seed script: loads the existing prototype's mock data
 * (src/lib/mock-data/*, already internally consistent and reconciled) into
 * the real Supabase database, and creates real auth users for every demo
 * persona so the app has real accounts to log into.
 *
 * Run with: npx tsx scripts/seed.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(__dirname, "../.env.local") });
import { createClient } from "@supabase/supabase-js";

import {
  users,
  donorProfiles,
  corporateProfiles,
  organizationMembers,
  companies,
  organizations,
  campaigns,
  donations,
  payments,
  grants,
  expenses,
  allocations,
  notifications,
  organizationVerifications,
  verificationEvents,
} from "../src/lib/mock-data";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const DEMO_PASSWORD = "GiveTrail#Demo2026";

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const userIdMap = new Map<string, string>();
const companyIdMap = new Map<string, string>();
const orgIdMap = new Map<string, string>();
const campaignIdMap = new Map<string, string>();
const donationIdMap = new Map<string, string>();
const grantIdMap = new Map<string, string>();
const expenseIdMap = new Map<string, string>();

function must<T>(v: T | undefined | null, label: string): T {
  if (v === undefined || v === null) throw new Error(`Missing id mapping for ${label}`);
  return v;
}

async function seedUsers() {
  console.log(`Creating ${users.length} auth users...`);
  for (const u of users) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: u.fullName, role: u.role, country_code: u.countryCode },
    });
    if (error || !data.user) throw new Error(`createUser failed for ${u.email}: ${error?.message}`);
    userIdMap.set(u.id, data.user.id);
  }

  const donorRows = donorProfiles.map((p) => ({
    user_id: must(userIdMap.get(p.userId), p.userId),
    preferred_currency: p.preferredCurrency,
    causes_followed: p.causesFollowed,
  }));
  if (donorRows.length) {
    const { error } = await supabase.from("donor_profiles").insert(donorRows);
    if (error) throw error;
  }
  console.log("Users + donor profiles seeded.");
}

async function seedCompanies() {
  for (const c of companies) {
    const { data, error } = await supabase
      .from("companies")
      .insert({
        name: c.name,
        logo_url: c.logoUrl || null,
        country_code: c.countryCode,
        authorized_representative_user_id: must(userIdMap.get(c.authorizedRepresentativeUserId), c.authorizedRepresentativeUserId),
      })
      .select("id")
      .single();
    if (error || !data) throw error ?? new Error("company insert failed");
    companyIdMap.set(c.id, data.id);
  }

  const corpRows = corporateProfiles.map((p) => ({
    user_id: must(userIdMap.get(p.userId), p.userId),
    company_id: must(companyIdMap.get(p.companyId), p.companyId),
  }));
  if (corpRows.length) {
    const { error } = await supabase.from("corporate_profiles").insert(corpRows);
    if (error) throw error;
  }
  console.log("Companies + corporate profiles seeded.");
}

async function seedOrganizations() {
  for (const o of organizations) {
    const { data, error } = await supabase
      .from("organizations")
      .insert({
        slug: o.slug,
        name: o.name,
        logo_url: o.logoUrl || null,
        cover_image_url: o.coverImageUrl || null,
        category: o.category,
        operating_country: o.operatingCountry,
        legal_entity_country: o.legalEntityCountry,
        base_currency: o.baseCurrency,
        payout_currency: o.payoutCurrency,
        registration_number: o.registrationNumber,
        tax_number: o.taxNumber || null,
        website: o.website || null,
        address: o.address || null,
        representative_name: o.representativeName,
        representative_title: o.representativeTitle,
        representative_email: o.representativeEmail,
        representative_phone: o.representativePhone || null,
        description: o.description || null,
        mission: o.mission || null,
        operating_regions: o.operatingRegions,
        verification_status: o.verificationStatus,
        verified_since: o.verifiedSince || null,
        allocation_policy_program_pct: o.allocationPolicy.programPct,
        allocation_policy_operations_pct: o.allocationPolicy.operationsPct,
        allocation_policy_fundraising_pct: o.allocationPolicy.fundraisingPct,
        allocation_policy_processing_pct: o.allocationPolicy.paymentProcessingPct,
        documentation_completeness_pct: o.documentationCompletenessPct,
        created_at: o.createdAt,
      })
      .select("id")
      .single();
    if (error || !data) throw error ?? new Error("org insert failed");
    orgIdMap.set(o.id, data.id);
  }

  const memberRows = organizationMembers.map((m) => ({
    user_id: must(userIdMap.get(m.userId), m.userId),
    organization_id: must(orgIdMap.get(m.organizationId), m.organizationId),
    title: m.title,
    is_primary_contact: m.isPrimaryContact,
  }));
  if (memberRows.length) {
    const { error } = await supabase.from("organization_members").insert(memberRows);
    if (error) throw error;
  }

  for (const v of organizationVerifications) {
    const { error } = await supabase.from("organization_verifications").insert({
      organization_id: must(orgIdMap.get(v.organizationId), v.organizationId),
      status: v.status,
      submitted_at: v.submittedAt || null,
      reviewed_at: v.reviewedAt || null,
      reviewer_note: v.reviewerNote || null,
    });
    if (error) throw error;

    const docRows = v.documents.map((d) => ({
      organization_id: must(orgIdMap.get(v.organizationId), v.organizationId),
      type: d.type,
      file_name: d.fileName,
      uploaded_at: d.uploadedAt,
      status: d.status,
    }));
    if (docRows.length) {
      const { error: docError } = await supabase.from("verification_documents").insert(docRows);
      if (docError) throw docError;
    }
  }
  console.log("Organizations, members, verifications seeded.");
}

async function seedCampaigns() {
  for (const c of campaigns) {
    const { data, error } = await supabase
      .from("campaigns")
      .insert({
        organization_id: must(orgIdMap.get(c.organizationId), c.organizationId),
        slug: c.slug,
        title: c.title,
        description: c.description || null,
        image_url: c.imageUrl || null,
        category: c.category,
        location: c.location || null,
        currency: c.currency,
        funding_goal: c.fundingGoal,
        amount_raised: c.amountRaised,
        amount_utilized: c.amountUtilized,
        start_date: c.startDate,
        end_date: c.endDate || null,
        status: c.status,
      })
      .select("id")
      .single();
    if (error || !data) throw error ?? new Error("campaign insert failed");
    campaignIdMap.set(c.id, data.id);

    const updateRows = c.updates.map((u) => ({
      campaign_id: data.id,
      title: u.title,
      body: u.body,
      image_url: u.imageUrl || null,
      posted_at: u.postedAt,
    }));
    if (updateRows.length) {
      const { error: updError } = await supabase.from("campaign_updates").insert(updateRows);
      if (updError) throw updError;
    }
  }
  console.log("Campaigns + updates seeded.");
}

async function seedDonationsAndPayments() {
  for (const d of donations) {
    const { data, error } = await supabase
      .from("donations")
      .insert({
        donor_user_id: userIdMap.get(d.donorUserId) ?? null,
        organization_id: must(orgIdMap.get(d.organizationId), d.organizationId),
        designation_type: d.designation.type,
        campaign_id: d.designation.type === "campaign" ? must(campaignIdMap.get(d.designation.campaignId), d.designation.campaignId) : null,
        gross_amount: d.grossAmount,
        currency: d.currency,
        exchange_rate: d.exchangeRate ?? null,
        platform_fee_pct: d.platformFeePct,
        platform_fee: d.platformFee,
        payment_processing_fee: d.paymentProcessingFee,
        amount_received_by_org: d.amountReceivedByOrg,
        net_proceeds: d.netProceeds,
        is_anonymous: d.isAnonymous,
        created_at: d.createdAt,
      })
      .select("id")
      .single();
    if (error || !data) throw error ?? new Error("donation insert failed");
    donationIdMap.set(d.id, data.id);

    const payment = payments.find((p) => p.id === d.paymentId);
    if (payment) {
      const { error: payError } = await supabase.from("payments").insert({
        donation_id: data.id,
        method: payment.method,
        status: payment.status,
        processing_fee: payment.processingFee,
        history: payment.history,
      });
      if (payError) throw payError;
    }
  }
  console.log(`${donations.length} donations + payments seeded.`);
}

async function seedGrants() {
  for (const g of grants) {
    const { data, error } = await supabase
      .from("grants")
      .insert({
        company_id: must(companyIdMap.get(g.companyId), g.companyId),
        organization_id: must(orgIdMap.get(g.organizationId), g.organizationId),
        campaign_id: g.campaignId ? must(campaignIdMap.get(g.campaignId), g.campaignId) : null,
        title: g.title,
        currency: g.currency,
        amount: g.amount,
        amount_transferred: g.amountTransferred,
        amount_utilized: g.amountUtilized,
        amount_verified: g.amountVerified,
        status: g.status,
        created_at: g.createdAt,
      })
      .select("id")
      .single();
    if (error || !data) throw error ?? new Error("grant insert failed");
    grantIdMap.set(g.id, data.id);

    const lineRows = g.budgetLines.map((l) => ({ grant_id: data.id, label: l.label, amount: l.amount }));
    if (lineRows.length) {
      const { error: lineError } = await supabase.from("grant_budget_lines").insert(lineRows);
      if (lineError) throw lineError;
    }
  }
  console.log("Grants + budget lines seeded.");
}

async function seedExpenses() {
  for (const e of expenses) {
    const { data, error } = await supabase
      .from("expenses")
      .insert({
        organization_id: must(orgIdMap.get(e.organizationId), e.organizationId),
        campaign_id: e.campaignId ? must(campaignIdMap.get(e.campaignId), e.campaignId) : null,
        title: e.title,
        vendor: e.vendor || null,
        expense_date: e.expenseDate,
        amount: e.amount,
        currency: e.currency,
        category: e.category,
        description: e.description || null,
        donor_safe_description: e.donorSafeDescription,
        payment_method: e.paymentMethod || null,
        reference_number: e.referenceNumber || null,
        internal_notes: e.internalNotes || null,
        verification_level: e.verificationLevel,
        amount_allocated: e.amountAllocated,
        beneficiary_protected: e.beneficiaryProtected,
      })
      .select("id")
      .single();
    if (error || !data) throw error ?? new Error("expense insert failed");
    expenseIdMap.set(e.id, data.id);

    const evidenceRows = e.evidence.map((doc) => ({
      expense_id: data.id,
      type: doc.type,
      file_name: doc.fileName,
      uploaded_at: doc.uploadedAt,
      donor_visible: doc.donorVisible,
      redacted: doc.redacted,
    }));
    if (evidenceRows.length) {
      const { error: evError } = await supabase.from("evidence_documents").insert(evidenceRows);
      if (evError) throw evError;
    }
  }
  console.log(`${expenses.length} expenses + evidence seeded.`);
}

async function seedAllocations() {
  const rows = allocations.map((a) => ({
    expense_id: must(expenseIdMap.get(a.expenseId), a.expenseId),
    source_type: a.sourceType,
    source_id: a.sourceType === "donation" ? must(donationIdMap.get(a.sourceId), a.sourceId) : must(grantIdMap.get(a.sourceId), a.sourceId),
    amount: a.amount,
    created_at: a.createdAt,
  }));
  if (rows.length) {
    const { error } = await supabase.from("allocations").insert(rows);
    if (error) throw error;
  }
  console.log(`${rows.length} allocations seeded.`);
}

async function seedNotificationsAndEvents() {
  const notifRows = notifications.map((n) => ({
    user_id: must(userIdMap.get(n.userId), n.userId),
    message: n.message,
    href: n.href || null,
    read: n.read,
    created_at: n.createdAt,
  }));
  if (notifRows.length) {
    const { error } = await supabase.from("notifications").insert(notifRows);
    if (error) throw error;
  }

  function resolveEntityId(entityType: string, entityId: string): string | null {
    if (entityType === "expense") return expenseIdMap.get(entityId) ?? null;
    if (entityType === "organization") return orgIdMap.get(entityId) ?? null;
    if (entityType === "donation") return donationIdMap.get(entityId) ?? null;
    return null;
  }

  const eventRows = verificationEvents
    .map((v) => ({
      entity_type: v.entityType,
      entity_id: resolveEntityId(v.entityType, v.entityId),
      from_level: v.fromLevel || null,
      to_level: v.toLevel,
      actor_user_id: userIdMap.get(v.actorUserId) ?? null,
      note: v.note || null,
      created_at: v.createdAt,
    }))
    .filter((r) => r.entity_id !== null);
  if (eventRows.length) {
    const { error } = await supabase.from("verification_events").insert(eventRows);
    if (error) throw error;
  }
  console.log("Notifications + verification events seeded.");
}

async function main() {
  console.log(`Seeding project ${SUPABASE_URL}...`);
  await seedUsers();
  await seedCompanies();
  await seedOrganizations();
  await seedCampaigns();
  await seedDonationsAndPayments();
  await seedGrants();
  await seedExpenses();
  await seedAllocations();
  await seedNotificationsAndEvents();
  console.log("\nSeed complete. Demo login password for every seeded account:", DEMO_PASSWORD);
}

main().catch((err) => {
  console.error("\nSeed failed:", err);
  process.exit(1);
});
