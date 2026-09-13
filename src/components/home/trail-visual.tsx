"use client";

import { useState } from "react";
import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Money } from "@/components/shared/money";
import type { Currency } from "@/lib/types";

interface TrailStep {
  key: string;
  label: string;
  amount: number;
  detail: string;
  emphasis?: boolean;
}

export function HomeTrailVisual({
  currency,
  grossAmount,
  platformFee,
  amountReceivedByOrg,
  programAllocation,
  verifiedExpenditure,
  pctAccountedFor,
}: {
  currency: Currency;
  grossAmount: number;
  platformFee: number;
  amountReceivedByOrg: number;
  programAllocation: number;
  verifiedExpenditure: number;
  pctAccountedFor: number;
}) {
  const steps: TrailStep[] = [
    { key: "donated", label: "Donated", amount: grossAmount, detail: "The amount you chose to give, before any fees." },
    {
      key: "received",
      label: "Received by the organization",
      amount: amountReceivedByOrg,
      detail: `After a ${(platformFee / grossAmount * 100).toFixed(0)}% GiveTrail fee and payment processing costs.`,
    },
    {
      key: "program",
      label: "Assigned to program activity",
      amount: programAllocation,
      detail: "The portion the organization applies to program work, per its published allocation policy.",
    },
    {
      key: "verified",
      label: "Verified expenditure",
      amount: verifiedExpenditure,
      detail: "Matched to a specific, documented expense with evidence on file.",
      emphasis: true,
    },
  ];

  const [activeKey, setActiveKey] = useState<string>("verified");
  const active = steps.find((s) => s.key === activeKey) ?? steps[0];

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
      <div className="flex flex-col items-start gap-0">
        {steps.map((step, i) => (
          <div key={step.key} className="w-full">
            <button
              onMouseEnter={() => setActiveKey(step.key)}
              onFocus={() => setActiveKey(step.key)}
              onClick={() => setActiveKey(step.key)}
              className={cn(
                "group flex w-full items-center justify-between gap-4 rounded-2xl border px-5 py-4 text-left transition-all",
                activeKey === step.key
                  ? "border-primary/40 bg-card trail-card-shadow scale-[1.02]"
                  : "border-transparent bg-card/50 hover:bg-card"
              )}
            >
              <span className="text-sm font-medium text-foreground/90">{step.label}</span>
              <Money
                amount={step.amount}
                currency={currency}
                className={cn(
                  "font-heading text-lg font-semibold",
                  step.emphasis ? "text-primary" : "text-foreground"
                )}
              />
            </button>
            {i < steps.length - 1 && (
              <div className="flex justify-center py-1">
                <ArrowDown className="size-4 text-muted-foreground/60" />
              </div>
            )}
          </div>
        ))}

        <div className="mt-5 w-full rounded-2xl bg-primary/10 px-5 py-4 text-center">
          <p className="font-heading text-2xl font-semibold text-primary">{(pctAccountedFor * 100).toFixed(1)}% accounted for</p>
          <p className="mt-0.5 text-xs text-muted-foreground">of this contribution&rsquo;s program allocation</p>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-8 trail-card-shadow">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">{active.label}</p>
        <p className="mt-3 font-heading text-4xl font-semibold text-foreground">
          <Money amount={active.amount} currency={currency} />
        </p>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{active.detail}</p>
      </div>
    </div>
  );
}
