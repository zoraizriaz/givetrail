"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/context/current-user-context";
import { getExpensesByOrg } from "@/lib/data";
import { getSessionExpenses } from "@/lib/session-expenses";
import { Money } from "@/components/shared/money";
import { VerificationLevelBadge } from "@/components/shared/verification-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateShort } from "@/lib/utils/format";
import type { Expense, VerificationLevel } from "@/lib/types";

function OrgExpensesInner() {
  const { organizationId } = useCurrentUser();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status") as VerificationLevel | null;
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    if (!organizationId) return;
    setExpenses([...getSessionExpenses(organizationId), ...getExpensesByOrg(organizationId)]);
  }, [organizationId]);

  if (!organizationId) return null;

  const filtered = statusFilter ? expenses.filter((e) => e.verificationLevel === statusFilter) : expenses;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Expenses</h1>
          <p className="text-sm text-muted-foreground">Record expenditures and manage supporting evidence.</p>
        </div>
        <Button asChild className="gap-1.5">
          <Link href="/org/expenses/new">
            <Plus className="size-4" /> New Expense
          </Link>
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState className="mt-8" icon={Receipt} title="No expenses yet" description="Record your first expenditure to start building your transparency record." />
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Expense</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Allocated</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="border-b border-border/70 last:border-0 hover:bg-accent/30">
                  <td className="px-4 py-3">
                    <Link href={`/org/expenses/${e.id}`} className="font-medium text-foreground hover:underline">
                      {e.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">{e.vendor}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDateShort(e.expenseDate)}</td>
                  <td className="px-4 py-3">
                    <Money amount={e.amount} currency={e.currency} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <Money amount={e.amountAllocated} currency={e.currency} /> / <Money amount={e.amount} currency={e.currency} />
                  </td>
                  <td className="px-4 py-3">
                    <VerificationLevelBadge level={e.verificationLevel} variant="full" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function OrgExpensesPage() {
  return (
    <Suspense>
      <OrgExpensesInner />
    </Suspense>
  );
}
