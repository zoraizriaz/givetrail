// GiveTrail core data model.
//
// This file is the single source of truth for the shape of the platform's
// domain objects. The prototype backs these types with static mock data
// (see src/lib/mock-data), but the shapes are written so a Supabase-backed
// implementation can be dropped in later without changing consumers —
// every entity has a stable `id`, ISO date strings, and money is always
// represented as an integer amount of minor units (cents) plus a currency
// code so nothing gets silently rounded or misrepresented.

export type Currency = "USD" | "GBP" | "EUR" | "CAD" | "AED" | "PKR" | "AUD";

export interface Money {
  /** Integer amount in minor units (e.g. cents). Never a float. */
  amount: number;
  currency: Currency;
}

export type UserRole = "donor" | "corporate" | "org_member" | "admin";

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  /** True once the donor has set a password / completed account activation. */
  accountActivated: boolean;
  countryCode: string;
}

export interface DonorProfile {
  userId: string;
  preferredCurrency: Currency;
  causesFollowed: string[];
}

export interface CorporateProfile {
  userId: string;
  companyId: string;
}

export interface CorporateTeamMember {
  userId: string;
  companyId: string;
  title: string;
}

export type OrgVerificationStatus =
  | "not_submitted"
  | "under_review"
  | "additional_info_required"
  | "verified"
  | "suspended"
  | "rejected";

export type OrgCategory =
  | "health"
  | "education"
  | "emergency_relief"
  | "children"
  | "poverty"
  | "food_security"
  | "disability"
  | "environment"
  | "other";

export interface AllocationPolicy {
  programPct: number;
  operationsPct: number;
  fundraisingPct: number;
  paymentProcessingPct: number;
}

export interface Organization {
  id: string;
  slug: string;
  name: string;
  logoUrl: string;
  coverImageUrl: string;
  category: OrgCategory[];
  operatingCountry: string;
  legalEntityCountry: string;
  baseCurrency: Currency;
  payoutCurrency: Currency;
  registrationNumber: string;
  taxNumber?: string;
  website: string;
  address: string;
  representativeName: string;
  representativeTitle: string;
  representativeEmail: string;
  representativePhone: string;
  description: string;
  mission: string;
  operatingRegions: string[];
  verificationStatus: OrgVerificationStatus;
  verifiedSince?: string;
  allocationPolicy: AllocationPolicy;
  documentationCompletenessPct: number;
  createdAt: string;
}

export interface OrganizationMember {
  userId: string;
  organizationId: string;
  title: string;
  isPrimaryContact: boolean;
}

export interface VerificationDocument {
  id: string;
  organizationId: string;
  type:
    | "registration_certificate"
    | "tax_certificate"
    | "proof_of_authorization"
    | "annual_report"
    | "other";
  fileName: string;
  uploadedAt: string;
  status: "pending" | "accepted" | "rejected";
}

export interface OrganizationVerification {
  organizationId: string;
  status: OrgVerificationStatus;
  submittedAt?: string;
  reviewedAt?: string;
  reviewerNote?: string;
  documents: VerificationDocument[];
}

export type CampaignStatus = "draft" | "active" | "completed" | "paused";

export interface Campaign {
  id: string;
  organizationId: string;
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  category: OrgCategory;
  location: string;
  currency: Currency;
  fundingGoal: number; // minor units
  amountRaised: number; // minor units
  amountUtilized: number; // minor units
  startDate: string;
  endDate?: string;
  status: CampaignStatus;
  allocationPolicy?: AllocationPolicy;
  updates: CampaignUpdate[];
}

export interface CampaignUpdate {
  id: string;
  campaignId: string;
  title: string;
  body: string;
  imageUrl?: string;
  postedAt: string;
}

export type DonationDesignation =
  | { type: "campaign"; campaignId: string }
  | { type: "general_fund" };

export type PaymentMethod =
  | "card"
  | "bank_transfer"
  | "ach"
  | "international_wire"
  | "corporate_transfer";

export type PaymentStatus =
  | "initiated"
  | "processing"
  | "confirmed"
  | "funds_transferred"
  | "available_to_ngo"
  | "refunded"
  | "failed";

export interface Payment {
  id: string;
  donationId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  processingFee: number; // minor units, in donation currency
  history: { status: PaymentStatus; at: string }[];
}

export interface Donation {
  id: string;
  donorUserId: string;
  organizationId: string;
  designation: DonationDesignation;
  grossAmount: number; // minor units, amount donated
  currency: Currency;
  exchangeRate?: number; // donation currency -> org base currency, if different
  platformFeePct: number; // e.g. 0.01
  platformFee: number; // minor units
  paymentProcessingFee: number; // minor units
  amountReceivedByOrg: number; // minor units, in org base currency
  netProceeds: number; // minor units available for allocation
  isAnonymous: boolean;
  createdAt: string;
  paymentId: string;
}

export type ExpenseCategory =
  | "medical_supplies"
  | "medication"
  | "food_assistance"
  | "transportation"
  | "training"
  | "monitoring_evaluation"
  | "community_outreach"
  | "operations"
  | "personnel"
  | "other";

export type VerificationLevel =
  | "declared"
  | "documented"
  | "financially_verified"
  | "program_verified"
  | "independently_verified";

export interface EvidenceDocument {
  id: string;
  expenseId: string;
  type: "receipt" | "invoice" | "supporting_document" | "program_photo" | "delivery_evidence";
  fileName: string;
  uploadedAt: string;
  donorVisible: boolean;
  redacted: boolean;
}

export interface Expense {
  id: string;
  organizationId: string;
  campaignId?: string;
  title: string;
  vendor: string;
  expenseDate: string;
  amount: number; // minor units
  currency: Currency;
  category: ExpenseCategory;
  description: string;
  donorSafeDescription: string;
  paymentMethod: string;
  referenceNumber: string;
  internalNotes?: string;
  verificationLevel: VerificationLevel;
  amountAllocated: number; // minor units already allocated from donations/grants
  evidence: EvidenceDocument[];
  beneficiaryProtected: boolean;
}

export interface Allocation {
  id: string;
  expenseId: string;
  sourceType: "donation" | "grant";
  sourceId: string; // donationId or grantId
  amount: number; // minor units
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  logoUrl: string;
  countryCode: string;
  authorizedRepresentativeUserId: string;
}

export type GrantStatus = "pending_transfer" | "transferred" | "active" | "closed";

export interface GrantBudgetLine {
  id: string;
  grantId: string;
  label: string;
  amount: number; // minor units
}

export interface Grant {
  id: string;
  companyId: string;
  organizationId: string;
  campaignId?: string;
  title: string;
  currency: Currency;
  amount: number; // minor units, total grant amount
  amountTransferred: number;
  amountUtilized: number;
  amountVerified: number;
  status: GrantStatus;
  budgetLines: GrantBudgetLine[];
  createdAt: string;
}

export type VerificationEventEntityType = "expense" | "organization" | "donation";

export interface VerificationEvent {
  id: string;
  entityType: VerificationEventEntityType;
  entityId: string;
  fromLevel?: string;
  toLevel: string;
  actorUserId: string;
  note?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  createdAt: string;
  read: boolean;
  href?: string;
}

export interface AuditLogEntry {
  id: string;
  actorUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, string | number | boolean>;
  createdAt: string;
}

export interface PlatformSettings {
  platformFeePct: number;
  supportedCurrencies: Currency[];
}
