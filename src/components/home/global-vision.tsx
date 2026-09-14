import { SectionEyebrow } from "@/components/shared/money";
import { ALL_CURRENCIES, CURRENCY_NAMES } from "@/lib/utils/currency";
import { Globe2, Landmark, ShieldCheck } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/shared/reveal";

const PILLARS = [
  {
    icon: Globe2,
    title: "Built for cross-border giving",
    body: "Donors and organizations operate in different countries and currencies by default — not as an afterthought.",
  },
  {
    icon: Landmark,
    title: "Regulated money movement, by design",
    body: "GiveTrail is architected so donations can eventually settle directly with connected organization accounts, without pooling in a general operating account.",
  },
  {
    icon: ShieldCheck,
    title: "Verification without overreach",
    body: "GiveTrail verification confirms registration, documentation and financial reconciliation — it is not a government endorsement.",
  },
];

export function GlobalVision() {
  return (
    <section className="border-y border-border bg-card/60">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <SectionEyebrow className="justify-center flex">Global by design</SectionEyebrow>
            <h2 className="mt-3 font-heading text-3xl font-medium text-foreground sm:text-4xl">
              One accounting standard for giving, everywhere
            </h2>
          </div>
        </Reveal>

        <RevealGroup className="mt-14 grid gap-6 md:grid-cols-3">
          {PILLARS.map((p) => (
            <RevealItem key={p.title} className="rounded-2xl border border-border bg-background p-7">
              <div className="flex size-11 items-center justify-center rounded-xl border border-border text-foreground">
                <p.icon className="size-5" strokeWidth={1.5} />
              </div>
              <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
            </RevealItem>
          ))}
        </RevealGroup>

        <div className="mt-12 rounded-2xl border border-dashed border-border bg-background p-6">
          <p className="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Supported currencies</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {ALL_CURRENCIES.map((c) => (
              <span key={c} className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{c}</span> · {CURRENCY_NAMES[c]}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
