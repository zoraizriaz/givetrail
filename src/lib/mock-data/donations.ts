import type { Currency, Donation, DonationDesignation, Payment, PaymentMethod, PaymentStatus } from "@/lib/types";
import { buildDonationFinancials, paymentStatusHistory } from "./helpers";

let seq = 0;
function nextId(prefix: string): string {
  seq += 1;
  return `${prefix}-${seq}`;
}

export const payments: Payment[] = [];
export const donations: Donation[] = [];

interface DonationSeed {
  id: string;
  donorUserId: string;
  organizationId: string;
  designation: DonationDesignation;
  grossMajor: number;
  currency: Currency;
  method: PaymentMethod;
  createdAt: string;
  status: PaymentStatus;
  isAnonymous?: boolean;
}

function seedDonation(seed: DonationSeed): Donation {
  const financials = buildDonationFinancials(seed.grossMajor, seed.method);
  const paymentId = nextId("pay");
  const payment: Payment = {
    id: paymentId,
    donationId: seed.id,
    method: seed.method,
    status: seed.status,
    processingFee: financials.paymentProcessingFee,
    history: paymentStatusHistory(seed.status, seed.createdAt),
  };
  payments.push(payment);

  const donation: Donation = {
    id: seed.id,
    donorUserId: seed.donorUserId,
    organizationId: seed.organizationId,
    designation: seed.designation,
    grossAmount: financials.grossAmount,
    currency: seed.currency,
    platformFeePct: financials.platformFeePct,
    platformFee: financials.platformFee,
    paymentProcessingFee: financials.paymentProcessingFee,
    amountReceivedByOrg: financials.amountReceivedByOrg,
    netProceeds: financials.netProceeds,
    isAnonymous: seed.isAnonymous ?? false,
    createdAt: seed.createdAt,
    paymentId,
  };
  donations.push(donation);
  return donation;
}

const toCampaign = (campaignId: string): DonationDesignation => ({ type: "campaign", campaignId });
const generalFund: DonationDesignation = { type: "general_fund" };

// ---- Horizon Health Alliance (org-horizon, USD) ----
export const donHero = seedDonation({
  id: "don-hero-1",
  donorUserId: "u-donor-sarah",
  organizationId: "org-horizon",
  designation: toCampaign("camp-maternal-health"),
  grossMajor: 500,
  currency: "USD",
  method: "card",
  createdAt: "2026-06-19T14:32:00Z",
  status: "available_to_ngo",
});

export const donSarahComplete = seedDonation({
  id: "don-sarah-complete",
  donorUserId: "u-donor-sarah",
  organizationId: "org-horizon",
  designation: generalFund,
  grossMajor: 200,
  currency: "USD",
  method: "card",
  createdAt: "2026-03-01T09:12:00Z",
  status: "available_to_ngo",
});

export const donMichael1 = seedDonation({
  id: "don-michael-1",
  donorUserId: "u-donor-michael",
  organizationId: "org-horizon",
  designation: toCampaign("camp-maternal-health"),
  grossMajor: 1200,
  currency: "USD",
  method: "bank_transfer",
  createdAt: "2026-02-10T10:00:00Z",
  status: "available_to_ngo",
});

export const donPriya1 = seedDonation({
  id: "don-priya-1",
  donorUserId: "u-donor-priya",
  organizationId: "org-horizon",
  designation: generalFund,
  grossMajor: 75,
  currency: "USD",
  method: "card",
  createdAt: "2026-08-30T16:00:00Z",
  status: "processing",
});

export const donDavid1 = seedDonation({
  id: "don-david-1",
  donorUserId: "u-donor-david",
  organizationId: "org-horizon",
  designation: toCampaign("camp-childrens-nutrition"),
  grossMajor: 300,
  currency: "USD",
  method: "card",
  createdAt: "2026-04-22T12:00:00Z",
  status: "available_to_ngo",
});

export const donEmma1 = seedDonation({
  id: "don-emma-1",
  donorUserId: "u-donor-emma",
  organizationId: "org-horizon",
  designation: toCampaign("camp-childrens-nutrition"),
  grossMajor: 60,
  currency: "EUR",
  method: "card",
  createdAt: "2026-05-14T12:00:00Z",
  status: "available_to_ngo",
});

export const donNoah1 = seedDonation({
  id: "don-noah-1",
  donorUserId: "u-donor-noah",
  organizationId: "org-horizon",
  designation: generalFund,
  grossMajor: 1000,
  currency: "USD",
  method: "ach",
  createdAt: "2026-01-15T12:00:00Z",
  status: "available_to_ngo",
});

export const donNoahFailed = seedDonation({
  id: "don-noah-failed",
  donorUserId: "u-donor-noah",
  organizationId: "org-horizon",
  designation: toCampaign("camp-maternal-health"),
  grossMajor: 40,
  currency: "USD",
  method: "card",
  createdAt: "2026-09-12T08:00:00Z",
  status: "failed",
});

export const donLaylaRefunded = seedDonation({
  id: "don-layla-refunded",
  donorUserId: "u-donor-layla",
  organizationId: "org-horizon",
  designation: generalFund,
  grossMajor: 220,
  currency: "USD",
  method: "card",
  createdAt: "2026-04-02T09:00:00Z",
  status: "refunded",
});

export const donTom1 = seedDonation({
  id: "don-tom-1",
  donorUserId: "u-donor-tom",
  organizationId: "org-horizon",
  designation: generalFund,
  grossMajor: 150,
  currency: "USD",
  method: "card",
  createdAt: "2026-08-22T09:00:00Z",
  status: "available_to_ngo",
});

// ---- Bright Path Education Trust (org-brightpath, PKR) ----
export const donSarah2 = seedDonation({
  id: "don-sarah-2",
  donorUserId: "u-donor-sarah",
  organizationId: "org-brightpath",
  designation: generalFund,
  grossMajor: 250,
  currency: "USD",
  method: "bank_transfer",
  createdAt: "2026-07-02T10:00:00Z",
  status: "available_to_ngo",
});

export const donSarah4 = seedDonation({
  id: "don-sarah-4",
  donorUserId: "u-donor-sarah",
  organizationId: "org-brightpath",
  designation: toCampaign("camp-school-support"),
  grossMajor: 100,
  currency: "USD",
  method: "card",
  createdAt: "2026-09-01T10:00:00Z",
  status: "confirmed",
});

export const donLayla1 = seedDonation({
  id: "don-layla-1",
  donorUserId: "u-donor-layla",
  organizationId: "org-brightpath",
  designation: toCampaign("camp-school-support"),
  grossMajor: 45000,
  currency: "PKR",
  method: "card",
  createdAt: "2026-03-08T10:00:00Z",
  status: "available_to_ngo",
});

export const donGrace1 = seedDonation({
  id: "don-grace-1",
  donorUserId: "u-donor-grace",
  organizationId: "org-brightpath",
  designation: toCampaign("camp-girls-literacy"),
  grossMajor: 20000,
  currency: "PKR",
  method: "card",
  createdAt: "2026-02-01T10:00:00Z",
  status: "available_to_ngo",
});

export const donDaniel1 = seedDonation({
  id: "don-daniel-1",
  donorUserId: "u-donor-daniel",
  organizationId: "org-brightpath",
  designation: toCampaign("camp-school-support"),
  grossMajor: 15000,
  currency: "PKR",
  method: "bank_transfer",
  createdAt: "2026-06-11T10:00:00Z",
  status: "available_to_ngo",
});

export const donAisha1 = seedDonation({
  id: "don-aisha-1",
  donorUserId: "u-donor-aisha",
  organizationId: "org-brightpath",
  designation: generalFund,
  grossMajor: 8000,
  currency: "PKR",
  method: "card",
  createdAt: "2026-09-05T10:00:00Z",
  status: "confirmed",
});

export const donGrace2 = seedDonation({
  id: "don-grace-2",
  donorUserId: "u-donor-grace",
  organizationId: "org-brightpath",
  designation: toCampaign("camp-school-support"),
  grossMajor: 30000,
  currency: "PKR",
  method: "bank_transfer",
  createdAt: "2026-08-01T10:00:00Z",
  status: "available_to_ngo",
});

// ---- Maple Grove Children's Fund (org-maple, CAD) ----
export const donSarah3 = seedDonation({
  id: "don-sarah-3",
  donorUserId: "u-donor-sarah",
  organizationId: "org-maple",
  designation: toCampaign("camp-cancer-treatment"),
  grossMajor: 150,
  currency: "USD",
  method: "card",
  createdAt: "2026-08-10T10:00:00Z",
  status: "available_to_ngo",
});

export const donTom2 = seedDonation({
  id: "don-tom-2",
  donorUserId: "u-donor-tom",
  organizationId: "org-maple",
  designation: generalFund,
  grossMajor: 2000,
  currency: "CAD",
  method: "bank_transfer",
  createdAt: "2026-03-19T10:00:00Z",
  status: "available_to_ngo",
});

export const donMichael2 = seedDonation({
  id: "don-michael-2",
  donorUserId: "u-donor-michael",
  organizationId: "org-maple",
  designation: toCampaign("camp-pediatric-nutrition"),
  grossMajor: 180,
  currency: "CAD",
  method: "card",
  createdAt: "2026-07-25T10:00:00Z",
  status: "available_to_ngo",
});

export const donPriya2 = seedDonation({
  id: "don-priya-2",
  donorUserId: "u-donor-priya",
  organizationId: "org-maple",
  designation: generalFund,
  grossMajor: 90,
  currency: "CAD",
  method: "card",
  createdAt: "2026-09-10T09:00:00Z",
  status: "processing",
});

export const donEmma2 = seedDonation({
  id: "don-emma-2",
  donorUserId: "u-donor-emma",
  organizationId: "org-maple",
  designation: toCampaign("camp-cancer-treatment"),
  grossMajor: 400,
  currency: "CAD",
  method: "card",
  createdAt: "2026-01-29T10:00:00Z",
  status: "available_to_ngo",
});

export const donDavid2 = seedDonation({
  id: "don-david-2",
  donorUserId: "u-donor-david",
  organizationId: "org-maple",
  designation: toCampaign("camp-pediatric-nutrition"),
  grossMajor: 250,
  currency: "CAD",
  method: "card",
  createdAt: "2026-05-03T10:00:00Z",
  status: "available_to_ngo",
});

export const donDaniel2 = seedDonation({
  id: "don-daniel-2",
  donorUserId: "u-donor-daniel",
  organizationId: "org-maple",
  designation: toCampaign("camp-pediatric-nutrition"),
  grossMajor: 300,
  currency: "CAD",
  method: "card",
  createdAt: "2026-02-20T10:00:00Z",
  status: "available_to_ngo",
});

export const donAisha2 = seedDonation({
  id: "don-aisha-2",
  donorUserId: "u-donor-aisha",
  organizationId: "org-maple",
  designation: toCampaign("camp-cancer-treatment"),
  grossMajor: 500,
  currency: "AUD",
  method: "card",
  createdAt: "2026-06-30T10:00:00Z",
  status: "available_to_ngo",
});

export function getDonationById(id: string): Donation | undefined {
  return donations.find((d) => d.id === id);
}

export function getPaymentByDonationId(donationId: string): Payment | undefined {
  return payments.find((p) => p.donationId === donationId);
}

export function getDonationsByDonor(userId: string): Donation[] {
  return donations.filter((d) => d.donorUserId === userId).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function getDonationsByOrg(organizationId: string): Donation[] {
  return donations.filter((d) => d.organizationId === organizationId);
}

export function getDonationsByCampaign(campaignId: string): Donation[] {
  return donations.filter((d) => d.designation.type === "campaign" && d.designation.campaignId === campaignId);
}
