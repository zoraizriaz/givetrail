"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SectionEyebrow, Money } from "@/components/shared/money";
import { Reveal } from "@/components/shared/reveal";

const AUDIENCES = [
  {
    value: "donors",
    label: "For Donors",
    title: "Give with confidence, not just hope",
    points: [
      "Donate in seconds — no lengthy signup required before you give",
      "See exactly how much reaches the organization after fees",
      "Follow your contribution to documented, evidence-backed expenditures",
    ],
    cta: { href: "/explore", label: "Explore causes" },
  },
  {
    value: "ngos",
    label: "For NGOs",
    title: "Show your donors the receipts — literally",
    points: [
      "Get GiveTrail Verified and build durable donor trust",
      "Manage campaigns, receipts and evidence in one place",
      "Turn transparency into a fundraising advantage, not a burden",
    ],
    cta: { href: "/for-organizations", label: "Register your organization" },
  },
  {
    value: "companies",
    label: "For Companies",
    title: "CSR reporting that writes itself",
    points: [
      "Track multi-year grants against budget lines and verified spend",
      "Give your CSR team and board a real-time utilization view",
      "Move large gifts by wire or bank transfer with full documentation",
    ],
    cta: { href: "/for-companies", label: "Talk to our team" },
  },
] as const;

function PreviewShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full min-h-52 flex-col justify-center rounded-2xl border border-border bg-background p-5">
      <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">Illustrative preview</p>
      {children}
    </div>
  );
}

function DonorPreview() {
  const rows = [
    { label: "Donated", amount: 25000 },
    { label: "Reached organization", amount: 24100 },
    { label: "Verified expenditure", amount: 21800 },
  ];
  return (
    <PreviewShell>
      <div className="space-y-3">
        {rows.map((row, i) => (
          <div key={row.label} className="flex items-center justify-between border-b border-border/70 pb-3 last:border-0 last:pb-0">
            <span className="text-xs text-muted-foreground">{row.label}</span>
            <Money
              amount={row.amount}
              currency="USD"
              className={i === rows.length - 1 ? "trail-gradient-text font-heading text-sm font-semibold" : "font-heading text-sm font-semibold text-foreground"}
            />
          </div>
        ))}
      </div>
    </PreviewShell>
  );
}

function NgoPreview() {
  return (
    <PreviewShell>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Documentation completeness</span>
        <span className="font-medium text-foreground">88%</span>
      </div>
      <Progress value={88} className="mt-2" />
      <div className="mt-5 flex items-center justify-between border-t border-border/70 pt-4">
        <span className="text-xs text-muted-foreground">Funds received</span>
        <Money amount={182400} currency="USD" className="font-heading text-sm font-semibold text-foreground" />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Allocated to programs</span>
        <Money amount={171200} currency="USD" className="font-heading text-sm font-semibold text-foreground" />
      </div>
    </PreviewShell>
  );
}

function CorporatePreview() {
  const segments = [
    { label: "Utilized", pct: 64, tint: "var(--accent-peach)" },
    { label: "Committed", pct: 22, tint: "var(--accent-lavender)" },
    { label: "Available", pct: 14, tint: "var(--accent-ice)" },
  ];
  return (
    <PreviewShell>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Grant utilization</span>
        <Money amount={500000} currency="USD" className="font-heading text-sm font-semibold text-foreground" />
      </div>
      <div className="mt-3 flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
        {segments.map((seg) => (
          <div key={seg.label} style={{ width: `${seg.pct}%`, background: seg.tint }} />
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-2 rounded-full" style={{ background: seg.tint }} />
            {seg.label} · {seg.pct}%
          </div>
        ))}
      </div>
    </PreviewShell>
  );
}

const PREVIEWS: Record<(typeof AUDIENCES)[number]["value"], React.ComponentType> = {
  donors: DonorPreview,
  ngos: NgoPreview,
  companies: CorporatePreview,
};

export function AudienceSections() {
  return (
    <section className="border-y border-border bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <SectionEyebrow className="justify-center flex">Built for every kind of giver</SectionEyebrow>
            <h2 className="mt-3 font-heading text-3xl font-medium text-foreground sm:text-4xl">One platform, three perspectives</h2>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <Tabs defaultValue="donors" className="mt-12">
            <TabsList className="mx-auto grid w-full max-w-md grid-cols-3 rounded-full">
              {AUDIENCES.map((a) => (
                <TabsTrigger key={a.value} value={a.value} className="rounded-full">
                  {a.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {AUDIENCES.map((a) => {
              const Preview = PREVIEWS[a.value];
              return (
                <TabsContent key={a.value} value={a.value} className="mt-10">
                  <div className="mx-auto grid max-w-3xl gap-6 rounded-3xl border border-border bg-card p-8 sm:p-10 trail-card-shadow md:grid-cols-[1.2fr_1fr] md:items-center">
                    <div>
                      <h3 className="font-heading text-2xl font-semibold text-foreground">{a.title}</h3>
                      <ul className="mt-5 space-y-3">
                        {a.points.map((point) => (
                          <li key={point} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                            <Check className="mt-0.5 size-4 shrink-0 text-success" />
                            {point}
                          </li>
                        ))}
                      </ul>
                      <Button asChild className="mt-6 gap-2 rounded-full">
                        <Link href={a.cta.href}>
                          {a.cta.label} <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                    </div>
                    <Preview />
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </Reveal>
      </div>
    </section>
  );
}
