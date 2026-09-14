"use client";

import { HeartHandshake, Route, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { SectionEyebrow } from "@/components/shared/money";
import { Reveal, RevealGroup, RevealItem } from "@/components/shared/reveal";

const STEPS = [
  {
    icon: HeartHandshake,
    title: "Give",
    body: "Donate securely to a participating organization or a specific campaign, in the currency and method you prefer.",
    tint: "var(--accent-champagne)",
  },
  {
    icon: Route,
    title: "Track",
    body: "Follow how your contribution moves from payment, to the organization, to the program it was assigned to.",
    tint: "var(--accent-peach)",
  },
  {
    icon: ShieldCheck,
    title: "Verify",
    body: "View the documented expenditures and evidence behind your contribution — receipts, invoices and program records.",
    tint: "var(--accent-rose)",
  },
];

export function HowItWorks() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <SectionEyebrow className="justify-center flex">How GiveTrail Works</SectionEyebrow>
          <h2 className="mt-3 font-heading text-3xl font-medium text-foreground sm:text-4xl">
            A clear line from your gift to its impact
          </h2>
        </div>
      </Reveal>

      <div className="relative mt-14">
        <div className="absolute left-0 right-0 top-5 hidden h-px bg-border sm:block" aria-hidden="true">
          <motion.div
            className="h-full origin-left bg-foreground/15"
            initial={reduceMotion ? undefined : { scaleX: 0 }}
            whileInView={reduceMotion ? undefined : { scaleX: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        <RevealGroup className="relative grid gap-8 sm:grid-cols-3 sm:gap-6">
          {STEPS.map((step, i) => (
            <RevealItem key={step.title}>
              <div
                className="flex size-10 items-center justify-center rounded-full border font-heading text-sm text-foreground"
                style={{ borderColor: step.tint, background: `color-mix(in oklab, ${step.tint} 18%, var(--background))` }}
              >
                0{i + 1}
              </div>
              <div className="mt-5 flex size-11 items-center justify-center rounded-xl border border-border text-foreground">
                <step.icon className="size-5" strokeWidth={1.5} />
              </div>
              <h3 className="mt-4 font-heading text-xl font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
