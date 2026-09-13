import type { AllocationPolicy } from "@/lib/types";
import { formatPercent } from "@/lib/utils/currency";

const SEGMENTS: { key: keyof AllocationPolicy; label: string; className: string }[] = [
  { key: "programPct", label: "Program services", className: "bg-primary" },
  { key: "operationsPct", label: "Operations", className: "bg-[var(--trail-peach)]" },
  { key: "fundraisingPct", label: "Fundraising", className: "bg-[var(--trail-mauve)]" },
  { key: "paymentProcessingPct", label: "Payment processing", className: "bg-muted-foreground/40" },
];

export function AllocationPolicyBar({ policy }: { policy: AllocationPolicy }) {
  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
        {SEGMENTS.map((seg) => (
          <div key={seg.key} className={seg.className} style={{ width: `${policy[seg.key] * 100}%` }} />
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {SEGMENTS.map((seg) => (
          <div key={seg.key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={`size-2 rounded-full ${seg.className}`} />
            {seg.label} · {formatPercent(policy[seg.key], 1)}
          </div>
        ))}
      </div>
    </div>
  );
}
