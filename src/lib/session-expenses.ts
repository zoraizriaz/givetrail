"use client";

import type { Expense, Currency, ExpenseCategory } from "@/lib/types";
import { readList, appendToList } from "@/lib/local-store";
import { toMinorUnits } from "@/lib/utils/currency";
import { getExpenseById } from "@/lib/data";

const KEY = "givetrail:sessionExpenses";

export interface CreateExpenseInput {
  organizationId: string;
  campaignId?: string;
  title: string;
  vendor: string;
  expenseDate: string;
  amountMajor: number;
  currency: Currency;
  category: ExpenseCategory;
  description: string;
  donorSafeDescription: string;
  paymentMethod: string;
  referenceNumber: string;
  beneficiaryProtected: boolean;
}

export function createSessionExpense(input: CreateExpenseInput): Expense {
  const expense: Expense = {
    id: `sess-exp-${Date.now()}`,
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
    verificationLevel: "declared",
    amountAllocated: 0,
    evidence: [],
    beneficiaryProtected: input.beneficiaryProtected,
  };
  appendToList<Expense>(KEY, expense);
  return expense;
}

export function getSessionExpenses(organizationId: string): Expense[] {
  return readList<Expense>(KEY).filter((e) => e.organizationId === organizationId);
}

export function getExpenseByIdAnywhere(id: string): Expense | undefined {
  return getExpenseById(id) ?? readList<Expense>(KEY).find((e) => e.id === id);
}
