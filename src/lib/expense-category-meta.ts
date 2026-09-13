import type { ExpenseCategory, VerificationLevel } from "@/lib/types";

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  medical_supplies: "Medical Supplies",
  medication: "Medication",
  food_assistance: "Food Assistance",
  transportation: "Transportation",
  training: "Training",
  monitoring_evaluation: "Monitoring & Evaluation",
  community_outreach: "Community Outreach",
  operations: "Operations",
  personnel: "Personnel",
  other: "Other",
};

export const VERIFICATION_LEVEL_LABELS: Record<VerificationLevel, string> = {
  declared: "Declared",
  documented: "Documented",
  financially_verified: "Financially Verified",
  program_verified: "Program Verified",
  independently_verified: "Independently Verified",
};
