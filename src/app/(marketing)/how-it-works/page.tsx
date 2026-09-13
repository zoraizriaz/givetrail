import Link from "next/link";
import { ArrowRight, HeartHandshake, Route, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SectionEyebrow } from "@/components/shared/money";

const STEPS = [
  {
    icon: HeartHandshake,
    title: "1. Give",
    body: "Choose a verified organization or campaign, pick your amount and currency, and donate securely. No lengthy signup required — if you're new, GiveTrail sets up your account automatically.",
  },
  {
    icon: Route,
    title: "2. Track",
    body: "Your donation is deducted a transparent GiveTrail fee and payment processing cost, then the remainder reaches the organization. From there it's split into program and operating allocation, following the organization's disclosed policy.",
  },
  {
    icon: ShieldCheck,
    title: "3. Verify",
    body: "As the organization spends program funds, it records expenses and uploads receipts and evidence. Your Giving Trail shows exactly which documented expenditures your contribution has been attributed to.",
  },
];

const FAQ = [
  {
    q: "Does GiveTrail follow my literal dollar bill?",
    a: "No. Once donations are pooled at an organization, GiveTrail can't trace a specific physical dollar. Instead, we reconcile your contribution against documented expenditures through an allocation ledger — the same approach used in nonprofit fund accounting.",
  },
  {
    q: "What does 'GiveTrail Verified' mean?",
    a: "It means the organization has submitted registration documents, tax status, proof of authorization and banking information, and GiveTrail has reviewed them. It is not a government endorsement and does not guarantee outcomes.",
  },
  {
    q: "How much does GiveTrail take?",
    a: "GiveTrail's platform fee is currently 1% of each donation, always shown before you confirm. Payment processing costs are shown separately and are never hidden.",
  },
  {
    q: "Can I see exactly what my donation paid for?",
    a: "You'll see the specific documented expenditures your contribution was allocated to, along with a verification level for each. Beneficiary-identifying details are protected for privacy.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <SectionEyebrow className="justify-center flex">How It Works</SectionEyebrow>
        <h1 className="mt-3 font-heading text-4xl font-semibold text-foreground">From payment to documented impact</h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          GiveTrail is an allocation and reconciliation ledger, not a magic dollar-tracer. Here's exactly what happens to
          your contribution.
        </p>
      </div>

      <div className="mt-14 space-y-8">
        {STEPS.map((step) => (
          <div key={step.title} className="flex gap-5 rounded-2xl border border-border bg-card p-6 trail-card-shadow">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <step.icon className="size-5" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground">{step.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16">
        <h2 className="text-center font-heading text-2xl font-semibold text-foreground">Frequently asked questions</h2>
        <Accordion type="single" collapsible className="mt-6">
          {FAQ.map((item) => (
            <AccordionItem key={item.q} value={item.q}>
              <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
              <AccordionContent>{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="mt-16 text-center">
        <Button asChild size="lg" className="gap-2">
          <Link href="/explore">
            Explore verified causes <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
