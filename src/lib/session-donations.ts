"use client";

// Client-side "just donated" store. GiveTrail's real architecture would write
// a donation straight to the database at checkout; this prototype has no
// backend, so newly created donations live in localStorage for the current
// browser session and are merged into the donor dashboard / Giving Trail
// pages alongside the seeded demo data.

import type { Currency, Donation, DonationDesignation, Payment, PaymentMethod } from "@/lib/types";
import { buildDonationFinancials, paymentStatusHistory, programAllocationFor } from "@/lib/mock-data/helpers";
import { getOrganizationById, getCampaignById, fxConvert, type DonationTrail, type DonorDashboard } from "@/lib/data";

const STORAGE_KEY = "givetrail:sessionDonations";

export interface SessionDonationRecord {
  donation: Donation;
  payment: Payment;
  donorName: string;
  donorEmail: string;
}

interface CreateSessionDonationInput {
  donorUserId: string;
  donorName: string;
  donorEmail: string;
  organizationId: string;
  designation: DonationDesignation;
  grossMajor: number;
  currency: Currency;
  method: PaymentMethod;
  isAnonymous?: boolean;
}

function readAll(): SessionDonationRecord[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SessionDonationRecord[]) : [];
  } catch {
    return [];
  }
}

function writeAll(records: SessionDonationRecord[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // ignore — session persistence is a nice-to-have in this prototype
  }
}

export function createSessionDonation(input: CreateSessionDonationInput): SessionDonationRecord {
  const id = `sess-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const paymentId = `sess-pay-${Date.now()}`;
  const now = new Date().toISOString();
  const financials = buildDonationFinancials(input.grossMajor, input.method);

  const payment: Payment = {
    id: paymentId,
    donationId: id,
    method: input.method,
    status: "processing",
    processingFee: financials.paymentProcessingFee,
    history: paymentStatusHistory("processing", now),
  };

  const donation: Donation = {
    id,
    donorUserId: input.donorUserId,
    organizationId: input.organizationId,
    designation: input.designation,
    grossAmount: financials.grossAmount,
    currency: input.currency,
    platformFeePct: financials.platformFeePct,
    platformFee: financials.platformFee,
    paymentProcessingFee: financials.paymentProcessingFee,
    amountReceivedByOrg: financials.amountReceivedByOrg,
    netProceeds: financials.netProceeds,
    isAnonymous: input.isAnonymous ?? false,
    createdAt: now,
    paymentId,
  };

  const record: SessionDonationRecord = { donation, payment, donorName: input.donorName, donorEmail: input.donorEmail };
  const all = readAll();
  all.push(record);
  writeAll(all);
  return record;
}

export function getSessionDonation(id: string): SessionDonationRecord | undefined {
  return readAll().find((r) => r.donation.id === id);
}

export function getSessionDonationsForDonor(donorUserId: string): SessionDonationRecord[] {
  return readAll().filter((r) => r.donation.donorUserId === donorUserId);
}

export function isSessionDonationId(id: string): boolean {
  return id.startsWith("sess-");
}

/** Mirrors getDonationTrail's shape for a freshly created session donation — always 0% allocated so far. */
export function computeSessionDonationTrail(record: SessionDonationRecord): DonationTrail {
  const { donation } = record;
  const organization = getOrganizationById(donation.organizationId)!;
  const campaign = donation.designation.type === "campaign" ? getCampaignById(donation.designation.campaignId) : undefined;
  const programAllocation = programAllocationFor(donation.netProceeds, organization.allocationPolicy.programPct);
  const operatingAllocation = donation.netProceeds - programAllocation;

  return {
    donation,
    organization,
    campaign,
    operatingAllocation,
    programAllocation,
    expenditures: [],
    allocatedToExpenditures: 0,
    awaitingAllocation: programAllocation,
    pctOfProgramAllocationUtilized: 0,
    paymentStatus: record.payment.status,
  };
}

/** Folds this session's freshly created donations into the seeded donor dashboard figures. */
export function mergeDonorDashboardWithSession(base: DonorDashboard, sessionRecords: SessionDonationRecord[]): DonorDashboard {
  if (sessionRecords.length === 0) return base;

  const sessionTrails = sessionRecords.map((r) => computeSessionDonationTrail(r));
  const orgSet = new Set([...sessionTrails.map((t) => t.organization.id)]);
  const campaignSet = new Set(sessionTrails.filter((t) => t.campaign).map((t) => t.campaign!.id));

  let totalLifetimeGiving = base.totalLifetimeGiving;
  let amountAwaitingAllocation = base.amountAwaitingAllocation;
  for (const t of sessionTrails) {
    totalLifetimeGiving += fxConvert(t.donation.grossAmount, t.donation.currency, base.currency);
    amountAwaitingAllocation += fxConvert(t.programAllocation, t.donation.currency, base.currency);
  }

  return {
    ...base,
    totalLifetimeGiving,
    amountAwaitingAllocation,
    organizationsSupportedCount: new Set([...orgSet]).size + base.organizationsSupportedCount,
    campaignsSupportedCount: campaignSet.size + base.campaignsSupportedCount,
    cards: [...sessionTrails.map((trail) => ({ trail })), ...base.cards],
  };
}
