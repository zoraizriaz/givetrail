import { SectionEyebrow, Money } from "@/components/shared/money";
import { Reveal, RevealGroup, RevealItem } from "@/components/shared/reveal";
import { getPlatformStats } from "@/lib/supabase-data";

const TINTS = ["var(--accent-champagne)", "var(--accent-ice)", "var(--accent-lavender)", "var(--accent-rose)"];

export async function Stats() {
  const stats = await getPlatformStats();

  const rows = [
    {
      value: <Money amount={stats.totalTracked} currency={stats.currency} compact className="tabular-nums" />,
      label: "tracked through GiveTrail",
      fill: 92,
    },
    {
      value: stats.verifiedOrganizations,
      label: "GiveTrail-verified organizations",
      fill: 70,
    },
    {
      value: stats.countriesRepresented,
      label: "countries represented",
      fill: 55,
    },
    {
      value: stats.verifiedExpenditures,
      label: "verified expenditures on record",
      fill: 80,
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal>
        <SectionEyebrow>Live on the platform</SectionEyebrow>
        <h2 className="mt-3 max-w-lg font-heading text-3xl font-medium text-foreground sm:text-4xl">
          Real numbers, tracked in real time
        </h2>
      </Reveal>

      <RevealGroup className="mt-10 divide-y divide-border border-t border-border">
        {rows.map((row, i) => (
          <RevealItem key={row.label}>
            <div className="grid items-center gap-3 py-6 sm:grid-cols-[1fr_auto] sm:gap-10">
              <div>
                <p className="font-heading text-4xl font-semibold tabular-nums text-foreground sm:text-5xl">{row.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{row.label}</p>
              </div>
              <div className="relative hidden h-1.5 w-56 rounded-full bg-muted sm:block">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${row.fill}%`,
                    background: `linear-gradient(90deg, ${TINTS[i % TINTS.length]}, color-mix(in oklab, ${TINTS[i % TINTS.length]} 40%, transparent))`,
                  }}
                />
                <span
                  className="absolute top-1/2 size-3 -translate-y-1/2 rounded-full border-2 border-card"
                  style={{
                    left: `calc(${row.fill}% - 6px)`,
                    background: TINTS[i % TINTS.length],
                    boxShadow: `0 0 8px 1px color-mix(in oklab, ${TINTS[i % TINTS.length]} 70%, transparent)`,
                  }}
                />
              </div>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
