import Link from "next/link";
import { ArrowRight, BarChart3, Building2, FileBarChart, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionEyebrow } from "@/components/shared/money";

const FEATURES = [
  {
    icon: Wallet,
    title: "Track large grants against a real budget",
    body: "Break a grant into budget lines — medical supplies, training, transportation — and see actual utilization against each one.",
  },
  {
    icon: BarChart3,
    title: "Real-time utilization visibility",
    body: "See exactly what percentage of a transferred grant has been utilized and independently verified, at any moment.",
  },
  {
    icon: FileBarChart,
    title: "CSR reporting that writes itself",
    body: "Generate a consolidated report across every organization your company funds — no more chasing PDFs at year end.",
  },
  {
    icon: Building2,
    title: "Built for institutional transfers",
    body: "Large grants move by bank transfer or wire rather than card, with full documentation at every step.",
  },
];

export default function ForCompaniesPage() {
  return (
    <div>
      <div className="trail-gradient-bg border-b border-border">
        <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <SectionEyebrow className="justify-center flex">For Companies</SectionEyebrow>
          <h1 className="mt-3 font-heading text-4xl font-semibold text-foreground sm:text-5xl">
            Corporate philanthropy your board can actually see
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Give your CSR team real-time visibility into how every grant is being utilized and verified — without
            waiting on quarterly reports from every partner organization.
          </p>
          <Button asChild size="lg" className="mt-7">
            <Link href="/signup/corporate">
              Set up a corporate account <ArrowRight className="ml-1 size-4" />
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

        <div className="mt-16 rounded-3xl border border-border bg-card p-8 trail-card-shadow sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Example</p>
          <h2 className="mt-2 font-heading text-2xl font-semibold text-foreground">A $250,000 grant, fully accounted for</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Medical supplies, community outreach, transportation, training and monitoring — each budget line tracked
            against actual, verified spend as the organization utilizes the grant.
          </p>
          <Button asChild variant="outline" className="mt-6 gap-2">
            <Link href="/corporate">
              See a live grant dashboard <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
