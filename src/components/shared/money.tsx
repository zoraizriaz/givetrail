import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/utils/currency";
import type { Currency } from "@/lib/types";

export function Money({
  amount,
  currency,
  compact,
  className,
}: {
  amount: number;
  currency: Currency;
  compact?: boolean;
  className?: string;
}) {
  return <span className={cn("tabular-nums", className)}>{formatMoney(amount, currency, { compact })}</span>;
}

export function SectionEyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-xs font-semibold uppercase tracking-[0.16em] text-primary", className)}>{children}</p>
  );
}
