import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionEyebrow } from "@/components/shared/money";
import { Money } from "@/components/shared/money";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/reveal";
import { getOrgPublicProfile } from "@/lib/supabase-data";

export async function TransparencyExample() {
  const profile = await getOrgPublicProfile("bright-path-education-trust");
  if (!profile) return null;
  const { organization: org, transparency: t } = profile;
  const documentedPct = t.allocatedToPrograms > 0 ? t.documentedExpenditure / t.allocatedToPrograms : 0;

  const rows = [
    { label: "Funds received", value: t.fundsReceived },
    { label: "Allocated to programs", value: t.allocatedToPrograms },
    { label: "Documented expenditure", value: t.documentedExpenditure, emphasis: true },
  ];

  return (
    <section className="relative overflow-hidden bg-[#111111] py-24 text-white">
      <div
        className="pointer-events-none absolute -left-32 top-0 size-[36rem] rounded-full opacity-25 blur-[100px]"
        style={{ background: "radial-gradient(circle, var(--accent-ice), transparent 70%)" }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-0 size-[32rem] rounded-full opacity-20 blur-[100px]"
        style={{ background: "radial-gradient(circle, var(--accent-rose), transparent 70%)" }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <SectionEyebrow className="text-white/50">Real transparency, not a slogan</SectionEyebrow>
            <h2 className="mt-3 font-heading text-3xl font-medium text-white sm:text-4xl">
              What transparency looks like
            </h2>
            <p className="mt-4 text-white/60">
              This is {org.name}&rsquo;s current, real-time breakdown on GiveTrail — the same view every donor sees
              on the organization&rsquo;s public profile before and after they give.
            </p>
            <Button asChild variant="outline" className="mt-6 gap-2 rounded-full border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">
              <Link href={`/organizations/${org.slug}`}>
                View {org.name}&rsquo;s profile <ArrowRight className="size-4" />
              </Link>
            </Button>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm">
              <div className="space-y-5">
                {rows.map((row) => (
                  <div key={row.label} className="flex items-center justify-between border-b border-white/10 pb-4 last:border-0 last:pb-0">
                    <span className="text-sm text-white/60">{row.label}</span>
                    <Money
                      amount={row.value}
                      currency={t.currency}
                      className={
                        row.emphasis
                          ? "font-heading text-xl font-semibold text-white"
                          : "font-heading text-lg font-semibold text-white/90"
                      }
                    />
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <div className="flex items-center justify-between text-xs text-white/50">
                  <span>Documentation completeness</span>
                  <span>{(documentedPct * 100).toFixed(0)}% accounted for ✓</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, documentedPct * 100)}%`,
                      background: "linear-gradient(90deg, var(--accent-ice), var(--accent-lavender))",
                    }}
                  />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
