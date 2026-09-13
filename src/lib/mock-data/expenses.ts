import type { Expense, VerificationLevel } from "@/lib/types";
import { toMinorUnits } from "@/lib/utils/currency";
import { donSarahComplete } from "./donations";
import { getOrganizationById } from "./organizations";
import { programAllocationFor } from "./helpers";

function evidence(
  expenseId: string,
  items: { type: Expense["evidence"][number]["type"]; fileName: string; donorVisible?: boolean; redacted?: boolean }[]
): Expense["evidence"] {
  return items.map((item, i) => ({
    id: `${expenseId}-ev-${i + 1}`,
    expenseId,
    type: item.type,
    fileName: item.fileName,
    uploadedAt: "2026-07-01T00:00:00Z",
    donorVisible: item.donorVisible ?? true,
    redacted: item.redacted ?? false,
  }));
}

function makeExpense(input: {
  id: string;
  organizationId: string;
  campaignId?: string;
  title: string;
  vendor: string;
  expenseDate: string;
  amountMajor: number;
  currency: Expense["currency"];
  category: Expense["category"];
  description: string;
  donorSafeDescription: string;
  paymentMethod: string;
  referenceNumber: string;
  verificationLevel: VerificationLevel;
  evidence: Expense["evidence"];
  beneficiaryProtected?: boolean;
  internalNotes?: string;
}): Expense {
  return {
    id: input.id,
    organizationId: input.organizationId,
    campaignId: input.campaignId,
    title: input.title,
    vendor: input.vendor,
    expenseDate: input.expenseDate,
    amount: toMinorUnits(input.amountMajor),
    currency: input.currency,
    category: input.category,
    description: input.description,
    donorSafeDescription: input.donorSafeDescription,
    paymentMethod: input.paymentMethod,
    referenceNumber: input.referenceNumber,
    internalNotes: input.internalNotes,
    verificationLevel: input.verificationLevel,
    amountAllocated: 0,
    evidence: input.evidence,
    beneficiaryProtected: input.beneficiaryProtected ?? false,
  };
}

// The featured "$500 donation" walkthrough — four small expenditures fully
// attributed to don-hero-1, matching the product's flagship example exactly.
export const expHeroDiagnostic = makeExpense({
  id: "exp-hero-diagnostic",
  organizationId: "org-horizon",
  campaignId: "camp-maternal-health",
  title: "Diagnostic testing",
  vendor: "Nairobi Community Lab Services",
  expenseDate: "2026-06-28",
  amountMajor: 120,
  currency: "USD",
  category: "medical_supplies",
  description: "Prenatal diagnostic screening panels for 40 expectant mothers across two clinic sites.",
  donorSafeDescription: "Diagnostic testing for expectant mothers",
  paymentMethod: "Bank transfer",
  referenceNumber: "HHA-2026-0614",
  verificationLevel: "program_verified",
  evidence: evidence("exp-hero-diagnostic", [
    { type: "invoice", fileName: "lab-services-invoice-0614.pdf" },
    { type: "program_photo", fileName: "clinic-screening-day.jpg" },
  ]),
});

export const expHeroMedication = makeExpense({
  id: "exp-hero-medication",
  organizationId: "org-horizon",
  campaignId: "camp-maternal-health",
  title: "Medication procurement",
  vendor: "Eastgate Pharmaceuticals Ltd.",
  expenseDate: "2026-07-02",
  amountMajor: 96,
  currency: "USD",
  category: "medication",
  description: "Iron and folic acid supplementation for prenatal patients enrolled in the program this cycle.",
  donorSafeDescription: "Medication procurement for prenatal care",
  paymentMethod: "Bank transfer",
  referenceNumber: "HHA-2026-0622",
  verificationLevel: "program_verified",
  evidence: evidence("exp-hero-medication", [{ type: "receipt", fileName: "eastgate-receipt-0622.pdf" }]),
});

export const expHeroTransport = makeExpense({
  id: "exp-hero-transport",
  organizationId: "org-horizon",
  campaignId: "camp-maternal-health",
  title: "Patient transportation",
  vendor: "Horizon Mobile Health Fleet",
  expenseDate: "2026-07-05",
  amountMajor: 80,
  currency: "USD",
  category: "transportation",
  description: "Fuel and driver costs to transport high-risk patients to the regional clinic for delivery.",
  donorSafeDescription: "Patient transportation to clinic",
  paymentMethod: "Petty cash",
  referenceNumber: "HHA-2026-0705",
  verificationLevel: "documented",
  evidence: evidence("exp-hero-transport", [{ type: "receipt", fileName: "fleet-log-0705.pdf" }]),
});

export const expHeroFood = makeExpense({
  id: "exp-hero-food",
  organizationId: "org-horizon",
  campaignId: "camp-maternal-health",
  title: "Food assistance",
  vendor: "Nairobi Community Nutrition Co-op",
  expenseDate: "2026-07-10",
  amountMajor: 90,
  currency: "USD",
  category: "food_assistance",
  description: "Supplementary nutrition packages provided to postnatal mothers during recovery visits.",
  donorSafeDescription: "Nutrition packages for postnatal mothers",
  paymentMethod: "Bank transfer",
  referenceNumber: "HHA-2026-0710",
  verificationLevel: "program_verified",
  evidence: evidence("exp-hero-food", [
    { type: "receipt", fileName: "coop-receipt-0710.pdf" },
    { type: "delivery_evidence", fileName: "distribution-signoff-0710.pdf", donorVisible: false },
  ]),
  beneficiaryProtected: true,
});

export const expMedSuppliesBulk = makeExpense({
  id: "exp-medsupplies-bulk",
  organizationId: "org-horizon",
  campaignId: "camp-maternal-health",
  title: "Medical Supplies Bulk Purchase",
  vendor: "Eastgate Pharmaceuticals Ltd.",
  expenseDate: "2026-05-15",
  amountMajor: 4800,
  currency: "USD",
  category: "medical_supplies",
  description: "Quarterly restock of prenatal vitamins, delivery kits and diagnostic consumables across all clinic sites.",
  donorSafeDescription: "Bulk medical supplies for clinic network",
  paymentMethod: "Wire transfer",
  referenceNumber: "HHA-2026-0515",
  verificationLevel: "financially_verified",
  evidence: evidence("exp-medsupplies-bulk", [
    { type: "invoice", fileName: "eastgate-bulk-invoice-0515.pdf" },
    { type: "supporting_document", fileName: "bank-reconciliation-0515.pdf", donorVisible: false },
  ]),
});

export const expOutreach = makeExpense({
  id: "exp-outreach",
  organizationId: "org-horizon",
  campaignId: "camp-maternal-health",
  title: "Community Health Education Outreach",
  vendor: "Horizon Community Health Team",
  expenseDate: "2026-06-01",
  amountMajor: 850,
  currency: "USD",
  category: "community_outreach",
  description: "Household visits and group education sessions on prenatal care and danger-sign recognition.",
  donorSafeDescription: "Community health education sessions",
  paymentMethod: "Payroll",
  referenceNumber: "HHA-2026-0601",
  verificationLevel: "documented",
  evidence: evidence("exp-outreach", [{ type: "program_photo", fileName: "outreach-session-0601.jpg" }]),
});

export const expNutritionDistribution = makeExpense({
  id: "exp-nutrition-distribution",
  organizationId: "org-horizon",
  campaignId: "camp-childrens-nutrition",
  title: "Nutrition Supplement Distribution",
  vendor: "Nairobi Community Nutrition Co-op",
  expenseDate: "2026-08-20",
  amountMajor: 1650,
  currency: "USD",
  category: "food_assistance",
  description: "Ready-to-use therapeutic food distribution for children identified with acute malnutrition.",
  donorSafeDescription: "Therapeutic food for children",
  paymentMethod: "Bank transfer",
  referenceNumber: "HHA-2026-0820",
  verificationLevel: "declared",
  evidence: [],
  beneficiaryProtected: true,
});

// donSarahComplete is fully allocated across two expenses so the donor sees a
// perfect 100%-accounted-for "Giving Trail Complete" state.
const horizon = getOrganizationById("org-horizon")!;
const completeAvailable = programAllocationFor(donSarahComplete.netProceeds, horizon.allocationPolicy.programPct);
const completeSplitA = Math.round(completeAvailable * 0.55);
const completeSplitB = completeAvailable - completeSplitA;

export const expCompleteA = makeExpense({
  id: "exp-complete-a",
  organizationId: "org-horizon",
  title: "Vaccine Cold-Chain Supplies",
  vendor: "Eastgate Pharmaceuticals Ltd.",
  expenseDate: "2026-03-10",
  amountMajor: completeSplitA / 100,
  currency: "USD",
  category: "medical_supplies",
  description: "Cold-chain storage supplies to maintain vaccine viability at two rural clinic sites.",
  donorSafeDescription: "Vaccine cold-chain storage supplies",
  paymentMethod: "Bank transfer",
  referenceNumber: "HHA-2026-0310",
  verificationLevel: "program_verified",
  evidence: evidence("exp-complete-a", [{ type: "invoice", fileName: "coldchain-invoice-0310.pdf" }]),
});

export const expCompleteB = makeExpense({
  id: "exp-complete-b",
  organizationId: "org-horizon",
  title: "Community Health Worker Stipend",
  vendor: "Horizon Community Health Team",
  expenseDate: "2026-03-15",
  amountMajor: completeSplitB / 100,
  currency: "USD",
  category: "personnel",
  description: "Monthly stipend for community health workers conducting home visits in the general fund's target villages.",
  donorSafeDescription: "Community health worker support",
  paymentMethod: "Payroll",
  referenceNumber: "HHA-2026-0315",
  verificationLevel: "program_verified",
  evidence: evidence("exp-complete-b", [{ type: "supporting_document", fileName: "payroll-record-0315.pdf", donorVisible: false }]),
});

// ---- Bright Path Education Trust ----
export const expTextbooks = makeExpense({
  id: "exp-textbooks",
  organizationId: "org-brightpath",
  campaignId: "camp-school-support",
  title: "Textbook Procurement",
  vendor: "Lahore Educational Suppliers",
  expenseDate: "2026-03-20",
  amountMajor: 18000,
  currency: "PKR",
  category: "other",
  description: "New primary-level textbooks for six partner schools ahead of the spring term.",
  donorSafeDescription: "Textbooks for partner schools",
  paymentMethod: "Bank transfer",
  referenceNumber: "BPE-2026-0320",
  verificationLevel: "documented",
  evidence: evidence("exp-textbooks", [{ type: "invoice", fileName: "les-textbook-invoice-0320.pdf" }]),
});

export const expTeacherStipends = makeExpense({
  id: "exp-teacher-stipends",
  organizationId: "org-brightpath",
  campaignId: "camp-school-support",
  title: "Teacher Stipend Support",
  vendor: "Bright Path Education Trust Payroll",
  expenseDate: "2026-08-05",
  amountMajor: 20000,
  currency: "PKR",
  category: "personnel",
  description: "Monthly stipend top-ups for eleven teachers at under-resourced partner schools.",
  donorSafeDescription: "Teacher stipend support",
  paymentMethod: "Bank transfer",
  referenceNumber: "BPE-2026-0805",
  verificationLevel: "independently_verified",
  evidence: evidence("exp-teacher-stipends", [
    { type: "supporting_document", fileName: "payroll-record-0805.pdf", donorVisible: false },
    { type: "supporting_document", fileName: "independent-audit-note-0805.pdf" },
  ]),
});

export const expSchoolSupplies = makeExpense({
  id: "exp-school-supplies",
  organizationId: "org-brightpath",
  campaignId: "camp-school-support",
  title: "School Supply Kits",
  vendor: "Lahore Educational Suppliers",
  expenseDate: "2026-06-18",
  amountMajor: 9500,
  currency: "PKR",
  category: "other",
  description: "Notebook, stationery and uniform kits distributed to 220 enrolled students.",
  donorSafeDescription: "School supply kits for students",
  paymentMethod: "Bank transfer",
  referenceNumber: "BPE-2026-0618",
  verificationLevel: "financially_verified",
  evidence: evidence("exp-school-supplies", [{ type: "receipt", fileName: "les-supplies-receipt-0618.pdf" }]),
});

export const expGirlsLitMaterials = makeExpense({
  id: "exp-girlslit-materials",
  organizationId: "org-brightpath",
  campaignId: "camp-girls-literacy",
  title: "Literacy Program Materials",
  vendor: "Lahore Educational Suppliers",
  expenseDate: "2026-02-14",
  amountMajor: 7200,
  currency: "PKR",
  category: "other",
  description: "Take-home reading materials and workbooks for the after-school literacy circles.",
  donorSafeDescription: "Reading materials for literacy program",
  paymentMethod: "Bank transfer",
  referenceNumber: "BPE-2026-0214",
  verificationLevel: "documented",
  evidence: evidence("exp-girlslit-materials", [{ type: "invoice", fileName: "les-literacy-invoice-0214.pdf" }]),
});

export const expGirlsLitTraining = makeExpense({
  id: "exp-girlslit-training",
  organizationId: "org-brightpath",
  campaignId: "camp-girls-literacy",
  title: "Facilitator Training Workshop",
  vendor: "Punjab Teacher Training Institute",
  expenseDate: "2026-09-01",
  amountMajor: 6000,
  currency: "PKR",
  category: "training",
  description: "Two-day workshop preparing literacy circle facilitators for the new term.",
  donorSafeDescription: "Facilitator training workshop",
  paymentMethod: "Bank transfer",
  referenceNumber: "BPE-2026-0901",
  verificationLevel: "declared",
  evidence: [],
});

export const expGeneralAdmin = makeExpense({
  id: "exp-general-admin",
  organizationId: "org-brightpath",
  title: "Office Rent & Utilities",
  vendor: "Gulberg Commercial Properties",
  expenseDate: "2026-08-01",
  amountMajor: 12000,
  currency: "PKR",
  category: "operations",
  description: "Monthly office rent and utilities for the country program office in Lahore.",
  donorSafeDescription: "Program office operating costs",
  paymentMethod: "Bank transfer",
  referenceNumber: "BPE-2026-0801",
  verificationLevel: "financially_verified",
  evidence: evidence("exp-general-admin", [{ type: "invoice", fileName: "gulberg-rent-invoice-0801.pdf" }]),
});

export const expMonitoringVisit = makeExpense({
  id: "exp-monitoring-visit",
  organizationId: "org-brightpath",
  campaignId: "camp-school-support",
  title: "Quarterly Monitoring Visit",
  vendor: "Bright Path Education Trust",
  expenseDate: "2026-09-08",
  amountMajor: 4500,
  currency: "PKR",
  category: "monitoring_evaluation",
  description: "Site visits to verify enrollment records and material distribution at four partner schools.",
  donorSafeDescription: "Program monitoring visit",
  paymentMethod: "Petty cash",
  referenceNumber: "BPE-2026-0908",
  verificationLevel: "declared",
  evidence: [],
});

// ---- Maple Grove Children's Fund ----
export const expCancerMedication = makeExpense({
  id: "exp-cancer-medication",
  organizationId: "org-maple",
  campaignId: "camp-cancer-treatment",
  title: "Chemotherapy Medication Support",
  vendor: "Ontario Pediatric Pharmacy Network",
  expenseDate: "2026-07-01",
  amountMajor: 500,
  currency: "CAD",
  category: "medication",
  description: "Co-pay assistance for chemotherapy medication for three enrolled families.",
  donorSafeDescription: "Medication assistance for pediatric cancer patients",
  paymentMethod: "Bank transfer",
  referenceNumber: "MGF-2026-0701",
  verificationLevel: "program_verified",
  evidence: evidence("exp-cancer-medication", [{ type: "receipt", fileName: "pharmacy-receipt-0701.pdf" }]),
  beneficiaryProtected: true,
});

export const expCancerHospitalFees = makeExpense({
  id: "exp-cancer-hospital-fees",
  organizationId: "org-maple",
  campaignId: "camp-cancer-treatment",
  title: "Hospital Treatment Fees",
  vendor: "SickKids Foundation Billing Office",
  expenseDate: "2026-04-12",
  amountMajor: 700,
  currency: "CAD",
  category: "medical_supplies",
  description: "Treatment-related fee assistance for a family traveling from Northern Ontario.",
  donorSafeDescription: "Hospital treatment fee assistance",
  paymentMethod: "Bank transfer",
  referenceNumber: "MGF-2026-0412",
  verificationLevel: "financially_verified",
  evidence: evidence("exp-cancer-hospital-fees", [{ type: "invoice", fileName: "hospital-invoice-0412.pdf" }]),
  beneficiaryProtected: true,
});

export const expCancerNutritionSupport = makeExpense({
  id: "exp-cancer-nutrition-support",
  organizationId: "org-maple",
  campaignId: "camp-cancer-treatment",
  title: "Patient Nutrition Packages",
  vendor: "Toronto Family Nutrition Co-op",
  expenseDate: "2026-02-05",
  amountMajor: 90,
  currency: "CAD",
  category: "food_assistance",
  description: "Nutrition support packages for a family during an extended treatment stay.",
  donorSafeDescription: "Nutrition support packages",
  paymentMethod: "Bank transfer",
  referenceNumber: "MGF-2026-0205",
  verificationLevel: "documented",
  evidence: evidence("exp-cancer-nutrition-support", [{ type: "receipt", fileName: "nutrition-coop-receipt-0205.pdf" }]),
  beneficiaryProtected: true,
});

export const expPediatricFormula = makeExpense({
  id: "exp-pediatric-formula",
  organizationId: "org-maple",
  campaignId: "camp-pediatric-nutrition",
  title: "Infant Formula & Supplements",
  vendor: "Toronto Family Nutrition Co-op",
  expenseDate: "2026-08-01",
  amountMajor: 220,
  currency: "CAD",
  category: "medical_supplies",
  description: "Specialized formula for infants undergoing treatment with restricted diets.",
  donorSafeDescription: "Specialized infant formula",
  paymentMethod: "Bank transfer",
  referenceNumber: "MGF-2026-0801",
  verificationLevel: "program_verified",
  evidence: evidence("exp-pediatric-formula", [{ type: "receipt", fileName: "formula-receipt-0801.pdf" }]),
  beneficiaryProtected: true,
});

export const expPediatricCheckups = makeExpense({
  id: "exp-pediatric-checkups",
  organizationId: "org-maple",
  campaignId: "camp-pediatric-nutrition",
  title: "Pediatric Health Checkups",
  vendor: "Maple Grove Dietitian Partners",
  expenseDate: "2026-03-22",
  amountMajor: 150,
  currency: "CAD",
  category: "monitoring_evaluation",
  description: "Dietitian-led health checkups tracking growth outcomes for enrolled children.",
  donorSafeDescription: "Pediatric health and nutrition checkups",
  paymentMethod: "Bank transfer",
  referenceNumber: "MGF-2026-0322",
  verificationLevel: "financially_verified",
  evidence: evidence("exp-pediatric-checkups", [{ type: "invoice", fileName: "dietitian-invoice-0322.pdf" }]),
});

export const expPediatricEducation = makeExpense({
  id: "exp-pediatric-education",
  organizationId: "org-maple",
  campaignId: "camp-pediatric-nutrition",
  title: "Caregiver Nutrition Education Sessions",
  vendor: "Maple Grove Dietitian Partners",
  expenseDate: "2026-09-09",
  amountMajor: 60,
  currency: "CAD",
  category: "training",
  description: "Group sessions coaching caregivers on managing specialized nutrition plans at home.",
  donorSafeDescription: "Caregiver nutrition education sessions",
  paymentMethod: "Bank transfer",
  referenceNumber: "MGF-2026-0909",
  verificationLevel: "declared",
  evidence: [],
});

export const expOrgAdminMaple = makeExpense({
  id: "exp-org-admin-maple",
  organizationId: "org-maple",
  title: "Program Coordination & Admin",
  vendor: "Maple Grove Children's Fund",
  expenseDate: "2026-05-28",
  amountMajor: 300,
  currency: "CAD",
  category: "operations",
  description: "Administrative coordination costs supporting both active programs this quarter.",
  donorSafeDescription: "Program coordination and administration",
  paymentMethod: "Bank transfer",
  referenceNumber: "MGF-2026-0528",
  verificationLevel: "financially_verified",
  evidence: evidence("exp-org-admin-maple", [{ type: "supporting_document", fileName: "admin-cost-summary-0528.pdf" }]),
});

export const expenses: Expense[] = [
  expHeroDiagnostic,
  expHeroMedication,
  expHeroTransport,
  expHeroFood,
  expMedSuppliesBulk,
  expOutreach,
  expNutritionDistribution,
  expCompleteA,
  expCompleteB,
  expTextbooks,
  expTeacherStipends,
  expSchoolSupplies,
  expGirlsLitMaterials,
  expGirlsLitTraining,
  expGeneralAdmin,
  expMonitoringVisit,
  expCancerMedication,
  expCancerHospitalFees,
  expCancerNutritionSupport,
  expPediatricFormula,
  expPediatricCheckups,
  expPediatricEducation,
  expOrgAdminMaple,
];

export function getExpenseById(id: string): Expense | undefined {
  return expenses.find((e) => e.id === id);
}

export function getExpensesByOrg(organizationId: string): Expense[] {
  return expenses.filter((e) => e.organizationId === organizationId);
}

export function getExpensesByCampaign(campaignId: string): Expense[] {
  return expenses.filter((e) => e.campaignId === campaignId);
}
