"use client";

import { useMemo, useState } from "react";
import { GitBranch } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/shared/money";
import { EmptyState } from "@/components/shared/empty-state";
import { useCurrentUser } from "@/context/current-user-context";
import { getAllocatableExpenses, getEligibleSourcesForExpense, recordAllocation } from "@/lib/data";
import { toMinorUnits } from "@/lib/utils/currency";
import { toast } from "sonner";
import type { Currency } from "@/lib/types";
import { persistAllocationOverride } from "@/lib/runtime-overrides";

export default function OrgAllocationsPage() {
  const { organizationId } = useCurrentUser();
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inputs, setInputs] = useState<Record<string, string>>({});

  const expenses = useMemo(() => (organizationId ? getAllocatableExpenses(organizationId) : []), [organizationId, refreshKey]);
  const selected = expenses.find((e) => e.id === selectedId) ?? expenses[0] ?? null;
  const sources = useMemo(() => (selected ? getEligibleSourcesForExpense(selected.id) : { donations: [], grants: [] }), [selected, refreshKey]);

  if (!organizationId) return null;

  const needed = selected ? selected.amount - selected.amountAllocated : 0;
  const enteredTotal = Object.values(inputs).reduce((sum, v) => sum + (Number(v) || 0), 0) * 100;

  function handleSave() {
    if (!selected) return;
    let totalRecorded = 0;
    for (const [sourceKey, value] of Object.entries(inputs)) {
      const amountMajor = Number(value);
      if (!amountMajor || amountMajor <= 0) continue;
      const [sourceType, sourceId] = sourceKey.split(":") as ["donation" | "grant", string];
      const desiredAmount = toMinorUnits(amountMajor);
      const actual = recordAllocation(selected.id, sourceType, sourceId, desiredAmount);
      if (actual > 0) {
        persistAllocationOverride({ expenseId: selected.id, sourceType, sourceId, desiredAmount });
      }
      totalRecorded += actual;
    }
    if (totalRecorded > 0) {
      toast.success(`Allocated ${(totalRecorded / 100).toFixed(2)} ${selected.currency} to ${selected.title}`);
      setInputs({});
      setRefreshKey((k) => k + 1);
    } else {
      toast.error("Enter an amount for at least one source.");
    }
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Allocations</h1>
      <p className="mt-1 text-sm text-muted-foreground">Match donations and grants to specific expenditures.</p>

      {expenses.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={GitBranch}
          title="Nothing needs allocation right now"
          description="Every recorded expense is already fully matched to a donation or grant."
        />
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-2">
            {expenses.map((e) => (
              <button
                key={e.id}
                onClick={() => {
                  setSelectedId(e.id);
                  setInputs({});
                }}
                className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors ${
                  selected?.id === e.id ? "border-primary bg-accent/60" : "border-border hover:bg-accent/30"
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{e.title}</p>
                  <p className="text-xs text-muted-foreground">
                    <Money amount={e.amountAllocated} currency={e.currency} /> of <Money amount={e.amount} currency={e.currency} /> allocated
                  </p>
                </div>
              </button>
            ))}
          </div>

          {selected && (
            <div className="rounded-2xl border border-border bg-card p-6 trail-card-shadow">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg font-semibold text-foreground">{selected.title}</h2>
                <Money amount={needed} currency={selected.currency} className="font-semibold text-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">Amount still needing allocation</p>

              <div className="mt-5 space-y-4">
                {sources.donations.length === 0 && sources.grants.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No eligible donations or grants are available to allocate right now.</p>
                ) : (
                  <>
                    {sources.donations.map(({ donation, available }) => (
                      <SourceRow
                        key={donation.id}
                        label={`Donation ${donation.id}`}
                        available={available}
                        currency={selected.currency}
                        value={inputs[`donation:${donation.id}`] ?? ""}
                        onChange={(v) => setInputs((s) => ({ ...s, [`donation:${donation.id}`]: v }))}
                      />
                    ))}
                    {sources.grants.map(({ grant, available }) => (
                      <SourceRow
                        key={grant.id}
                        label={grant.title}
                        available={available}
                        currency={selected.currency}
                        value={inputs[`grant:${grant.id}`] ?? ""}
                        onChange={(v) => setInputs((s) => ({ ...s, [`grant:${grant.id}`]: v }))}
                      />
                    ))}
                  </>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-sm">
                <span className="text-muted-foreground">Total entered</span>
                <Money amount={enteredTotal} currency={selected.currency} className="font-semibold text-foreground" />
              </div>
              <Button className="mt-4 w-full" onClick={handleSave} disabled={enteredTotal <= 0}>
                Save allocation
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SourceRow({
  label,
  available,
  currency,
  value,
  onChange,
}: {
  label: string;
  available: number;
  currency: Currency;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="truncate text-sm text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">
          <Money amount={available} currency={currency} /> available
        </p>
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9.]/g, ""))}
        placeholder="0.00"
        className="w-28 shrink-0"
        inputMode="decimal"
      />
    </div>
  );
}
