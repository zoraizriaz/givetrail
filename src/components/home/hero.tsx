import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionEyebrow } from "@/components/shared/money";
import { HomeTrailVisual } from "@/components/home/trail-visual";
import { HeroGlow } from "@/components/home/hero-glow";
import { getSampleDonationTrail } from "@/lib/supabase-data";

export async function Hero() {
  const trail = await getSampleDonationTrail();

  return (
    <section className="relative overflow-hidden">
      <HeroGlow />
      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-14 sm:px-6 lg:px-8 lg:pb-28 lg:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <SectionEyebrow className="hero-in justify-center flex">Give. Track. Verify.</SectionEyebrow>
          <h1
            className="hero-in mt-5 font-heading text-5xl font-medium leading-[1.03] tracking-tight text-balance sm:text-6xl lg:text-7xl"
            style={{ ["--hero-in-delay" as string]: "0.08s" }}
          >
            <span className="text-muted-foreground/70">See where</span>{" "}
            <span className="text-foreground">your giving goes.</span>
          </h1>
          <p
            className="hero-in mx-auto mt-6 max-w-xl text-balance text-lg text-muted-foreground"
            style={{ ["--hero-in-delay" as string]: "0.16s" }}
          >
            Donate to verified organizations and follow your contribution from payment to documented impact.
            Every donation leaves a trail.
          </p>
          <div
            className="hero-in mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
            style={{ ["--hero-in-delay" as string]: "0.24s" }}
          >
            <Button asChild size="lg" className="gap-2 rounded-full px-6" data-tour="hero-explore-cta">
              <Link href="/explore">
                Explore Causes <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-6">
              <Link href="/for-organizations">For Organizations</Link>
            </Button>
          </div>
        </div>

        {trail && (
          <div className="hero-in mx-auto mt-20 max-w-5xl" style={{ ["--hero-in-delay" as string]: "0.32s" }} data-tour="hero-trail-visual">
            <HomeTrailVisual
              currency={trail.donation.currency}
              grossAmount={trail.donation.grossAmount}
              platformFee={trail.donation.platformFee}
              amountReceivedByOrg={trail.donation.amountReceivedByOrg}
              programAllocation={trail.programAllocation}
              verifiedExpenditure={trail.allocatedToExpenditures}
              pctAccountedFor={trail.pctOfProgramAllocationUtilized}
              organizationName={trail.organization.name}
              organizationSlug={trail.organization.slug}
              expenseDescription={trail.expenditures[0]?.expense.donorSafeDescription}
              additionalExpenseCount={Math.max(0, trail.expenditures.length - 1)}
            />
          </div>
        )}
      </div>
    </section>
  );
}
