import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionEyebrow } from "@/components/shared/money";
import { HomeTrailVisual } from "@/components/home/trail-visual";
import { getDonationTrail } from "@/lib/data";

export function Hero() {
  const trail = getDonationTrail("don-hero-1")!;

  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="trail-gradient-bg absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pb-28 lg:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <SectionEyebrow className="justify-center flex">Give. Track. Verify.</SectionEyebrow>
          <h1 className="mt-4 font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            See where your giving goes.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-balance text-lg text-muted-foreground">
            Donate to verified organizations and follow your contribution from payment to documented impact.
            Every donation leaves a trail.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="gap-2" data-tour="hero-explore-cta">
              <Link href="/explore">
                Explore Causes <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/for-organizations">For Organizations</Link>
            </Button>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-4xl" data-tour="hero-trail-visual">
          <HomeTrailVisual
            currency={trail.donation.currency}
            grossAmount={trail.donation.grossAmount}
            platformFee={trail.donation.platformFee}
            amountReceivedByOrg={trail.donation.amountReceivedByOrg}
            programAllocation={trail.programAllocation}
            verifiedExpenditure={trail.allocatedToExpenditures}
            pctAccountedFor={trail.pctOfProgramAllocationUtilized}
          />
        </div>
      </div>
    </section>
  );
}
