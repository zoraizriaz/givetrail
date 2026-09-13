import { ShieldAlert } from "lucide-react";
import type { Expense } from "@/lib/types";
import { VerificationLevelBadge } from "@/components/shared/verification-badge";
import { Money } from "@/components/shared/money";
import { formatDateShort } from "@/lib/utils/format";

export function ExpenditureRow({ expense, amount }: { expense: Expense; amount?: number }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/70 py-4 last:border-0">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{expense.donorSafeDescription}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{formatDateShort(expense.expenseDate)}</span>
          {expense.beneficiaryProtected && (
            <span className="inline-flex items-center gap-1">
              <ShieldAlert className="size-3" /> Beneficiary protected
            </span>
          )}
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <Money amount={amount ?? expense.amount} currency={expense.currency} className="font-heading text-sm font-semibold" />
        <VerificationLevelBadge level={expense.verificationLevel} />
      </div>
    </div>
  );
}
