"use client";

import Link from "next/link";
import { ArrowRight, Check, HeartHandshake } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SectionEyebrow, Money } from "@/components/shared/money";
import { Reveal } from "@/components/shared/reveal";
import { StatCard } from "@/components/shared/stat-card";
import { LogoMark } from "@/components/shared/logo";
import { VerificationLevelBadge, OrgVerificationBadge } from "@/components/shared/verification-badge";
import { AllocationPolicyBar } from "@/components/org/allocation-policy-bar";
import { formatMoney } from "@/lib/utils/currency";

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

/** A small window-chrome header so each preview reads as a real product surface, not a generic mockup. */
function PreviewChrome({ title }: { title: string }) {
  return (
    <div className="mb-4 flex items-center gap-2 border-b border-border/70 pb-3">
      <LogoMark size={16} />
      <span className="text-xs font-medium text-muted-foreground">{title}</span>
    </div>
  );
}

function PreviewShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex h-full min-h-56 flex-col justify-center rounded-2xl border border-border bg-background p-5 trail-card-shadow">
      <PreviewChrome title={title} />
      {children}
    </div>
  );
}

function DonorPreview() {
  return (
    <PreviewShell title="Giving Trail">
      <StatCard label="Total lifetime giving" value={formatMoney(120000, "USD")} icon={HeartHandshake} className="border-0 bg-transparent p-0 shadow-none" />
      <div className="mt-5 flex items-center justify-between border-t border-border/70 pt-4">
        <span className="text-xs text-muted-foreground">Verified expenditure</span>
        <Money amount={21800} currency="USD" className="trail-gradient-text font-heading text-sm font-semibold" />
      </div>
      <div className="mt-3">
        <VerificationLevelBadge level="program_verified" />
      </div>
    </PreviewShell>
  );
}

function NgoPreview() {
  return (
    <PreviewShell title="Organization Dashboard">
      <OrgVerificationBadge status="verified" />
      <div className="mt-4 flex items-center justify-between text-xs">
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
  return (
    <PreviewShell title="Grant Utilization">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Total committed</span>
        <Money amount={50000000} currency="USD" className="font-heading text-sm font-semibold text-foreground" />
      </div>
      <div className="mt-4">
        <AllocationPolicyBar policy={{ programPct: 0.64, operationsPct: 0.14, fundraisingPct: 0.08, paymentProcessingPct: 0.14 }} />
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
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <SectionEyebrow className="justify-center flex">Built for every kind of giver</SectionEyebrow>
            <h2 className="mt-3 font-heading text-3xl font-medium text-foreground sm:text-4xl">One platform, three perspectives</h2>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <Tabs defaultValue="donors" className="mt-8">
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
                <TabsContent key={a.value} value={a.value} className="mt-8">
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
