"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useInView } from "motion/react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Money } from "@/components/shared/money";
import type { Currency } from "@/lib/types";

interface TrailStep {
  key: string;
  label: string;
  amount: number;
  caption?: string;
  emphasis?: boolean;
}

const CONNECTOR_TINTS = ["var(--accent-champagne)", "var(--accent-peach)", "var(--accent-rose)"];

export function HomeTrailVisual({
  currency,
  grossAmount,
  amountReceivedByOrg,
  programAllocation,
  verifiedExpenditure,
  pctAccountedFor,
  organizationName,
  organizationSlug,
  expenseDescription,
  additionalExpenseCount = 0,
}: {
  currency: Currency;
  grossAmount: number;
  platformFee: number;
  amountReceivedByOrg: number;
  programAllocation: number;
  verifiedExpenditure: number;
  pctAccountedFor: number;
  organizationName: string;
  organizationSlug: string;
  expenseDescription?: string;
  additionalExpenseCount?: number;
}) {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, margin: "-40px" });

  const verifiedCaption = expenseDescription
    ? additionalExpenseCount > 0
      ? `${expenseDescription} + ${additionalExpenseCount} more`
      : expenseDescription
    : undefined;

  const steps: TrailStep[] = [
    { key: "donated", label: "Donated", amount: grossAmount },
    { key: "received", label: "Reached organization", amount: amountReceivedByOrg },
    { key: "program", label: "Program allocation", amount: programAllocation },
    { key: "verified", label: "Verified expenditure", amount: verifiedExpenditure, caption: verifiedCaption, emphasis: true },
  ];

  return (
    <div ref={containerRef}>
      <p className="text-center text-sm text-muted-foreground">
        A real donation to{" "}
        <Link href={`/organizations/${organizationSlug}`} className="font-medium text-foreground hover:underline">
          {organizationName}
        </Link>
        , tracked end to end on GiveTrail
      </p>

      <div className="mt-8 flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
        {steps.map((step, i) => (
          <div key={step.key} className="flex items-center sm:contents">
            <div className="flex flex-col items-start sm:items-center sm:text-center">
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">{step.label}</p>
              <p
                className={
                  step.emphasis
                    ? "trail-gradient-text mt-2 font-heading text-3xl font-semibold sm:text-4xl"
                    : "mt-2 font-heading text-3xl font-semibold text-foreground sm:text-4xl"
                }
              >
                <Money amount={step.amount} currency={currency} />
              </p>
              {step.caption && <p className="mt-1.5 max-w-[11rem] text-xs leading-snug text-muted-foreground sm:text-center">{step.caption}</p>}
            </div>

            {i < steps.length - 1 && (
              <div
                className="relative mx-4 hidden h-px flex-1 self-center overflow-hidden bg-border sm:block"
                aria-hidden="true"
              >
                {/* Initial draw-in as the trail scrolls into view */}
                <motion.span
                  className="absolute inset-y-0 left-0 right-0 origin-left"
                  style={{ background: "var(--foreground)", opacity: 0.08 }}
                  initial={reduceMotion ? undefined : { scaleX: 0 }}
                  animate={inView && !reduceMotion ? { scaleX: 1 } : undefined}
                  transition={{ duration: 0.7, delay: 0.15 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                />
                {/* A small light that periodically travels the connector — restrained, not constant */}
                {inView && !reduceMotion && (
                  <motion.span
                    className="absolute inset-y-0 left-0 w-12 rounded-full"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${CONNECTOR_TINTS[i % CONNECTOR_TINTS.length]} 65%, #fff)`,
                      boxShadow: `0 0 10px 1px ${CONNECTOR_TINTS[i % CONNECTOR_TINTS.length]}`,
                    }}
                    initial={{ left: "-12%", opacity: 0 }}
                    animate={{ left: "100%", opacity: [0, 1, 1, 0] }}
                    transition={{
                      duration: 1.6,
                      delay: 0.6 + i * 0.15,
                      repeat: Infinity,
                      repeatDelay: 3.4,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                  />
                )}
              </div>
            )}
            {i < steps.length - 1 && <div className="ml-0 h-8 w-px self-stretch bg-border sm:hidden" aria-hidden="true" />}
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-center gap-3">
        <div
          className="flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-center trail-card-shadow"
          style={{ boxShadow: "0 0 0 1px var(--border), 0 8px 28px -12px color-mix(in oklab, var(--accent-rose) 45%, transparent)" }}
        >
          <span className="font-heading text-base font-semibold text-foreground">{(pctAccountedFor * 100).toFixed(1)}%</span>
          <span className="text-sm text-muted-foreground">of this contribution&rsquo;s program allocation accounted for</span>
        </div>
        <Link
          href={`/organizations/${organizationSlug}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:underline"
        >
          See {organizationName}&rsquo;s full transparency record <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
