import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  className?: string;
  tone?: "default" | "success" | "warning";
}

const TONE_CLASSES: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "text-foreground",
  success: "text-success",
  warning: "text-warning",
};

export function StatCard({ label, value, hint, icon: Icon, className, tone = "default" }: StatCardProps) {
  return (
    <div className={cn("trail-card-shadow rounded-2xl border border-border bg-card p-5", className)}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        {Icon && <Icon className="size-4 text-muted-foreground" />}
      </div>
      <p className={cn("mt-2 font-heading text-2xl font-semibold tabular-nums", TONE_CLASSES[tone])}>{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
