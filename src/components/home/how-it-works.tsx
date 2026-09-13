import { HeartHandshake, Route, ShieldCheck } from "lucide-react";
import { SectionEyebrow } from "@/components/shared/money";

const STEPS = [
  {
    icon: HeartHandshake,
    title: "Give",
    body: "Donate securely to a participating organization or a specific campaign in the currency and method you prefer.",
  },
  {
    icon: Route,
    title: "Track",
    body: "Follow how your contribution moves from payment, to the organization, to the program it was assigned to.",
  },
  {
    icon: ShieldCheck,
    title: "Verify",
    body: "View the documented expenditures and evidence behind your contribution — receipts, invoices and program records.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <SectionEyebrow className="justify-center flex">How GiveTrail Works</SectionEyebrow>
        <h2 className="mt-3 font-heading text-3xl font-semibold text-foreground sm:text-4xl">
          A clear line from your gift to its impact
        </h2>
      </div>
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {STEPS.map((step, i) => (
          <div key={step.title} className="relative rounded-2xl border border-border bg-card p-7 trail-card-shadow">
            <span className="font-heading text-sm text-muted-foreground/70">0{i + 1}</span>
            <div className="mt-3 flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <step.icon className="size-5" />
            </div>
            <h3 className="mt-4 font-heading text-xl font-semibold text-foreground">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
