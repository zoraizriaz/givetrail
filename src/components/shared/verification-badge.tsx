import { BadgeCheck, FileCheck2, Landmark, ShieldCheck, PencilLine } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrgVerificationStatus, VerificationLevel } from "@/lib/types";

const LEVEL_META: Record<VerificationLevel, { label: string; shortLabel: string; icon: typeof PencilLine; className: string }> = {
  declared: {
    label: "Declared",
    shortLabel: "Declared",
    icon: PencilLine,
    className: "bg-muted text-muted-foreground",
  },
  documented: {
    label: "Documented",
    shortLabel: "Documented ✓",
    icon: FileCheck2,
    className: "bg-secondary text-secondary-foreground",
  },
  financially_verified: {
    label: "Financially Verified",
    shortLabel: "Verified ✓",
    icon: Landmark,
    className: "bg-accent text-accent-foreground",
  },
  program_verified: {
    label: "Program Verified",
    shortLabel: "Verified ✓",
    icon: BadgeCheck,
    className: "bg-[color-mix(in_oklab,var(--success)_18%,var(--card))] text-success",
  },
  independently_verified: {
    label: "Independently Verified",
    shortLabel: "Independently Verified ✓",
    icon: ShieldCheck,
    className: "bg-[color-mix(in_oklab,var(--success)_28%,var(--card))] text-success",
  },
};

export function VerificationLevelBadge({
  level,
  variant = "short",
  className,
}: {
  level: VerificationLevel;
  variant?: "short" | "full";
  className?: string;
}) {
  const meta = LEVEL_META[level];
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        meta.className,
        className
      )}
    >
      <Icon className="size-3.5" />
      {variant === "short" ? meta.shortLabel : meta.label}
    </span>
  );
}

const ORG_STATUS_META: Record<OrgVerificationStatus, { label: string; className: string }> = {
  not_submitted: { label: "Not Submitted", className: "bg-muted text-muted-foreground" },
  under_review: { label: "Under Review", className: "bg-[color-mix(in_oklab,var(--warning)_20%,var(--card))] text-warning" },
  additional_info_required: {
    label: "Additional Information Required",
    className: "bg-[color-mix(in_oklab,var(--warning)_28%,var(--card))] text-warning",
  },
  verified: { label: "GiveTrail Verified", className: "bg-[color-mix(in_oklab,var(--success)_20%,var(--card))] text-success" },
  suspended: { label: "Suspended", className: "bg-[color-mix(in_oklab,var(--destructive)_20%,var(--card))] text-destructive" },
  rejected: { label: "Rejected", className: "bg-[color-mix(in_oklab,var(--destructive)_20%,var(--card))] text-destructive" },
};

export function OrgVerificationBadge({ status, className }: { status: OrgVerificationStatus; className?: string }) {
  const meta = ORG_STATUS_META[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold", meta.className, className)}>
      {status === "verified" && <BadgeCheck className="size-3.5" />}
      {meta.label}
    </span>
  );
}
