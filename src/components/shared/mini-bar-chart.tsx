import { cn } from "@/lib/utils";

interface BarDatum {
  label: string;
  value: number;
}

export function MiniBarChart({ data, className, formatValue }: { data: BarDatum[]; className?: string; formatValue?: (v: number) => string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className={cn("space-y-2.5", className)}>
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3 text-xs">
          <span className="w-28 shrink-0 truncate text-muted-foreground" title={d.label}>
            {d.label}
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${(d.value / max) * 100}%` }} />
          </div>
          <span className="w-16 shrink-0 text-right font-medium text-foreground">{formatValue ? formatValue(d.value) : d.value}</span>
        </div>
      ))}
    </div>
  );
}
