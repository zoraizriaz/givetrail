import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SectionEyebrow } from "@/components/shared/money";

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
];

export function AudienceSections() {
  return (
    <section className="border-y border-border bg-card/60">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <SectionEyebrow className="justify-center flex">Built for every kind of giver</SectionEyebrow>
          <h2 className="mt-3 font-heading text-3xl font-semibold text-foreground sm:text-4xl">One platform, three perspectives</h2>
        </div>

        <Tabs defaultValue="donors" className="mt-12">
          <TabsList className="mx-auto grid w-full max-w-md grid-cols-3">
            {AUDIENCES.map((a) => (
              <TabsTrigger key={a.value} value={a.value}>
                {a.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {AUDIENCES.map((a) => (
            <TabsContent key={a.value} value={a.value} className="mt-10">
              <div className="mx-auto grid max-w-3xl gap-6 rounded-3xl border border-border bg-background p-8 sm:p-10 trail-card-shadow md:grid-cols-[1.2fr_1fr] md:items-center">
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
                  <Button asChild className="mt-6 gap-2">
                    <Link href={a.cta.href}>
                      {a.cta.label} <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
                <div className="hidden h-full min-h-40 rounded-2xl trail-gradient-bg md:block" aria-hidden="true" />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
