"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, FileText, Lock, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/shared/money";
import { VerificationLevelBadge } from "@/components/shared/verification-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { getExpenseByIdAnywhere } from "@/lib/session-expenses";
import { persistExpenseLevelOverride } from "@/lib/runtime-overrides";
import { getAllocationsForExpense, getDonationById, getGrantById } from "@/lib/data";
import { formatDate } from "@/lib/utils/format";
import { VERIFICATION_LEVEL_LABELS } from "@/lib/expense-category-meta";
import type { Expense, VerificationLevel } from "@/lib/types";

const LEVEL_ORDER: VerificationLevel[] = ["declared", "documented", "financially_verified", "program_verified", "independently_verified"];

export default function ExpenseDetailPage({ params }: { params: Promise<{ expenseId: string }> }) {
  const { expenseId } = use(params);
  const [expense, setExpense] = useState<Expense | undefined | null>(null);

  useEffect(() => {
    setExpense(getExpenseByIdAnywhere(expenseId));
  }, [expenseId]);

  if (expense === null) return null;
  if (!expense) return <EmptyState icon={Receipt} title="Expense not found" />;

  const allocations = getAllocationsForExpense(expense.id);
  const currentIndex = LEVEL_ORDER.indexOf(expense.verificationLevel);
  const nextLevel = LEVEL_ORDER[currentIndex + 1];

  function advanceLevel() {
    if (!nextLevel || !expense) return;
    expense.verificationLevel = nextLevel;
    persistExpenseLevelOverride(expense.id, nextLevel);
    setExpense({ ...expense });
  }

  return (
    <div className="max-w-3xl">
      <Link href="/org/expenses" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> Back to expenses
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">{expense.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {expense.vendor} · {formatDate(expense.expenseDate)}
          </p>
        </div>
        <Money amount={expense.amount} currency={expense.currency} className="font-heading text-2xl font-semibold text-foreground" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-heading text-base font-semibold text-foreground">Internal record</h2>
            <dl className="mt-3 space-y-2.5 text-sm">
              <Row label="Description" value={expense.description} />
              <Row label="Payment method" value={expense.paymentMethod} />
              <Row label="Reference number" value={expense.referenceNumber} />
              {expense.internalNotes && <Row label="Internal notes" value={expense.internalNotes} />}
              <Row label="Beneficiary" value={expense.beneficiaryProtected ? "Protected" : "Not applicable"} />
            </dl>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Lock className="size-3.5 text-muted-foreground" /> Donor-safe view
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{expense.donorSafeDescription}</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-heading text-base font-semibold text-foreground">Evidence</h2>
            {expense.evidence.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">No documents uploaded yet.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {expense.evidence.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                    <span className="flex items-center gap-2 text-foreground">
                      <FileText className="size-4 text-muted-foreground" /> {doc.fileName}
                    </span>
                    <span className="text-xs text-muted-foreground">{doc.donorVisible ? "Donor-visible" : "Internal only"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-heading text-base font-semibold text-foreground">Verification</h2>
            <div className="mt-3">
              <VerificationLevelBadge level={expense.verificationLevel} variant="full" />
            </div>
            {nextLevel ? (
              <Button size="sm" variant="outline" className="mt-4 w-full" onClick={advanceLevel}>
                Advance to {VERIFICATION_LEVEL_LABELS[nextLevel]}
              </Button>
            ) : (
              <p className="mt-4 text-xs text-muted-foreground">This expense has reached the highest verification level.</p>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-heading text-base font-semibold text-foreground">Allocation</h2>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Allocated</span>
              <Money amount={expense.amountAllocated} currency={expense.currency} className="font-medium text-foreground" />
            </div>
            <div className="mt-1 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Remaining</span>
              <Money amount={Math.max(0, expense.amount - expense.amountAllocated)} currency={expense.currency} className="font-medium text-foreground" />
            </div>
            {allocations.length > 0 && (
              <div className="mt-4 space-y-2 border-t border-border pt-4">
                {allocations.map((a) => {
                  const label =
                    a.sourceType === "donation" ? getDonationById(a.sourceId)?.id ?? a.sourceId : getGrantById(a.sourceId)?.title ?? a.sourceId;
                  return (
                    <div key={a.id} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {a.sourceType === "donation" ? "Donation" : "Grant"} · {label}
                      </span>
                      <Money amount={a.amount} currency={expense.currency} />
                    </div>
                  );
                })}
              </div>
            )}
            {expense.amount > expense.amountAllocated && (
              <Button asChild size="sm" className="mt-4 w-full">
                <Link href="/org/allocations">Allocate funds</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right text-foreground">{value}</dd>
    </div>
  );
}
