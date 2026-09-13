import Link from "next/link";
import { ArrowRight, Check, FileCheck2, GitBranch, Receipt, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionEyebrow } from "@/components/shared/money";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Get GiveTrail Verified",
    body: "Submit registration, tax status and authorization documents once. Your verified badge builds trust with individual and corporate donors alike.",
  },
  {
    icon: Receipt,
    title: "Manage expenses and evidence",
    body: "Record expenditures, upload receipts and invoices, and control exactly what donors see — full internal records stay internal.",
  },
  {
    icon: GitBranch,
    title: "Allocate transparently",
    body: "Match donations and grants to specific expenditures, across one or many sources, with a full audit trail behind every allocation.",
  },
  {
    icon: FileCheck2,
    title: "Five-level verification",
    body: "Move expenditures from Declared to Independently Verified as documentation improves — donors see exactly how solid the evidence is.",
  },
];

const CHECKLIST = [
  "Organization name, type, country and registration number",
  "Tax / charity number where applicable",
  "Authorized representative details",
  "Bank / payout information",
  "Registration and authorization documents",
];

export default function ForOrganizationsPage() {
  return (
    <div>
      <div className="trail-gradient-bg border-b border-border">
        <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <SectionEyebrow className="justify-center flex">For Organizations</SectionEyebrow>
          <h1 className="mt-3 font-heading text-4xl font-semibold text-foreground sm:text-5xl">
            Turn transparency into your fundraising advantage
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Join GiveTrail to reach donors who want to see exactly where their contribution goes — and give your
            organization a modern, credible transparency record.
          </p>
          <Button asChild size="lg" className="mt-7">
            <Link href="/onboarding/ngo">
              Register your organization <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-6 trail-card-shadow">
              <div className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <f.icon className="size-5" />
              </div>
              <h2 className="mt-4 font-heading text-lg font-semibold text-foreground">{f.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 grid gap-10 rounded-3xl border border-border bg-card p-8 trail-card-shadow sm:p-10 md:grid-cols-2">
          <div>
            <h2 className="font-heading text-2xl font-semibold text-foreground">What you'll need to apply</h2>
            <p className="mt-2 text-sm text-muted-foreground">Verification typically takes 3–5 business days once submitted.</p>
            <ul className="mt-5 space-y-2.5">
              {CHECKLIST.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col justify-center rounded-2xl bg-accent p-6">
            <p className="font-heading text-lg font-semibold text-accent-foreground">Your disclosed allocation policy</p>
            <p className="mt-2 text-sm text-accent-foreground/80">
              GiveTrail doesn't impose a universal overhead ratio. You disclose your own program, operations,
              fundraising and processing split — shown to donors before they give.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Button asChild size="lg" className="gap-2">
            <Link href="/onboarding/ngo">
              Start your application <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
