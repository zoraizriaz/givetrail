import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionEyebrow } from "@/components/shared/money";
import { Money } from "@/components/shared/money";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getOrgPublicProfile } from "@/lib/supabase-data";

export async function TransparencyExample() {
  const profile = await getOrgPublicProfile("bright-path-education-trust");
  if (!profile) return null;
  const { organization: org, transparency: t } = profile;
  const documentedPct = t.allocatedToPrograms > 0 ? t.documentedExpenditure / t.allocatedToPrograms : 0;

  const rows = [
    { label: "Funds received", value: t.fundsReceived },
    { label: "Allocated to programs", value: t.allocatedToPrograms },
    { label: "Documented expenditure", value: t.documentedExpenditure },
    { label: "Awaiting documentation", value: t.awaitingDocumentation },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <SectionEyebrow>Real transparency, not a slogan</SectionEyebrow>
          <h2 className="mt-3 font-heading text-3xl font-semibold text-foreground sm:text-4xl">
            Every verified organization publishes a live transparency snapshot
          </h2>
          <p className="mt-4 text-muted-foreground">
            This is {org.name}&rsquo;s current, real-time breakdown on GiveTrail — the same view every donor sees on
            the organization&rsquo;s public profile before and after they give.
          </p>
          <Button asChild variant="outline" className="mt-6 gap-2">
            <Link href={`/organizations/${org.slug}`}>
              View {org.name}&rsquo;s profile <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="rounded-3xl border border-border bg-card p-8 trail-card-shadow">
          <div className="space-y-5">
            {rows.map((row) => (
              <div key={row.label} className="flex items-center justify-between border-b border-border/70 pb-3 last:border-0 last:pb-0">
                <span className="text-sm text-muted-foreground">{row.label}</span>
                <Money amount={row.value} currency={t.currency} className="font-heading text-lg font-semibold text-foreground" />
              </div>
            ))}
          </div>
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Documentation completeness</span>
              <span>{(documentedPct * 100).toFixed(0)}%</span>
            </div>
            <Progress value={documentedPct * 100} className="mt-2" />
          </div>
        </div>
      </div>
    </section>
  );
}
