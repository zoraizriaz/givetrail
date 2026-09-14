import Link from "next/link";
import { ChevronLeft, FileText, Lock, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/shared/money";
import { VerificationLevelBadge } from "@/components/shared/verification-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { getExpenseById, getAllocationsForExpense } from "@/lib/ngo-data";
import { AdvanceVerificationButton } from "@/components/org/advance-verification-button";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils/format";
import type { VerificationLevel } from "@/lib/types";

const LEVEL_ORDER: VerificationLevel[] = ["declared", "documented", "financially_verified", "program_verified", "independently_verified"];

export default async function ExpenseDetailPage({ params }: { params: Promise<{ expenseId: string }> }) {
  const { expenseId } = await params;
  const expense = await getExpenseById(expenseId);
  if (!expense) return <EmptyState icon={Receipt} title="Expense not found" />;

  const allocations = await getAllocationsForExpense(expense.id);
  const currentIndex = LEVEL_ORDER.indexOf(expense.verificationLevel);
  const nextLevel = LEVEL_ORDER[currentIndex + 1];

  const supabase = await createClient();
  const grantIds = allocations.filter((a) => a.sourceType === "grant").map((a) => a.sourceId);
  const [{ data: grantRows }] = await Promise.all([
    grantIds.length > 0 ? supabase.from("grants").select("id, title").in("id", grantIds) : Promise.resolve({ data: [] }),
  ]);
  const grantTitleById = new Map((grantRows ?? []).map((g) => [g.id as string, g.title as string]));

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
              <AdvanceVerificationButton expenseId={expense.id} nextLevel={nextLevel} />
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
                  const label = a.sourceType === "donation" ? `Donation ${a.sourceId}` : grantTitleById.get(a.sourceId) ?? a.sourceId;
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
