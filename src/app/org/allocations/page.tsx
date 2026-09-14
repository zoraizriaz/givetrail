"use client";

import { useEffect, useState } from "react";
import { GitBranch } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/shared/money";
import { EmptyState } from "@/components/shared/empty-state";
import { useCurrentUser } from "@/context/current-user-context";
import { fetchAllocatableExpenses, fetchEligibleSourcesForExpense, recordAllocation } from "@/lib/actions/ngo";
import { toMinorUnits } from "@/lib/utils/currency";
import { toast } from "sonner";
import type { Currency, Expense } from "@/lib/types";
import { PageTour } from "@/components/tour/page-tour";
import { orgAllocationsTourSteps } from "@/components/tour/steps";

interface EligibleSource {
  key: string;
  sourceType: "donation" | "grant";
  sourceId: string;
  label: string;
  available: number;
}

export default function OrgAllocationsPage() {
  const { organizationId } = useCurrentUser();
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [sources, setSources] = useState<EligibleSource[]>([]);

  useEffect(() => {
    if (!organizationId) return;
    fetchAllocatableExpenses(organizationId).then(setExpenses);
  }, [organizationId, refreshKey]);

  const selected = expenses.find((e) => e.id === selectedId) ?? expenses[0] ?? null;

  useEffect(() => {
    if (!selected) {
      setSources([]);
      return;
    }
    let active = true;
    fetchEligibleSourcesForExpense(selected.id).then(({ donations, grants }) => {
      if (!active) return;
      setSources([
        ...donations.map((d) => ({ key: `donation:${d.donation.id}`, sourceType: "donation" as const, sourceId: d.donation.id, label: `Donation ${d.donation.id}`, available: d.available })),
        ...grants.map((g) => ({ key: `grant:${g.grant.id}`, sourceType: "grant" as const, sourceId: g.grant.id, label: g.grant.title, available: g.available })),
      ]);
    });
    return () => {
      active = false;
    };
  }, [selected, refreshKey]);

  if (!organizationId) return null;

  const needed = selected ? selected.amount - selected.amountAllocated : 0;
  const enteredTotal = Object.values(inputs).reduce((sum, v) => sum + (Number(v) || 0), 0) * 100;

  async function handleSave() {
    if (!selected) return;
    let totalRecorded = 0;
    for (const [sourceKey, value] of Object.entries(inputs)) {
      const amountMajor = Number(value);
      if (!amountMajor || amountMajor <= 0) continue;
      const [sourceType, sourceId] = sourceKey.split(":") as ["donation" | "grant", string];
      const actual = await recordAllocation(selected.id, sourceType, sourceId, toMinorUnits(amountMajor));
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
          <div className="space-y-2" data-tour="org-allocation-list">
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
            <div className="rounded-2xl border border-border bg-card p-6 trail-card-shadow" data-tour="org-allocation-panel">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg font-semibold text-foreground">{selected.title}</h2>
                <Money amount={needed} currency={selected.currency} className="font-semibold text-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">Amount still needing allocation</p>

              <div className="mt-5 space-y-4">
                {sources.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No eligible donations or grants are available to allocate right now.</p>
                ) : (
                  sources.map((s) => (
                    <SourceRow
                      key={s.key}
                      label={s.label}
                      available={s.available}
                      currency={selected.currency}
                      value={inputs[s.key] ?? ""}
                      onChange={(v) => setInputs((state) => ({ ...state, [s.key]: v }))}
                    />
                  ))
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
      <PageTour tourId="org-allocations" steps={orgAllocationsTourSteps} />
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
