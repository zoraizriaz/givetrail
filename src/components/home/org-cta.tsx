import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/reveal";

export function OrganizationCta() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <Reveal>
        <p className="font-heading text-4xl font-medium leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          Every donation <span className="text-muted-foreground/60">leaves</span> a trail.
        </p>
      </Reveal>

      <Reveal delay={0.12}>
        <div className="mt-12 flex flex-col items-start justify-between gap-8 rounded-3xl border border-border bg-muted/50 p-8 sm:flex-row sm:items-center sm:p-10">
          <div>
            <h2 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
              Ready to show your donors where it goes?
            </h2>
            <p className="mt-2 max-w-lg text-muted-foreground">
              Join GiveTrail as a verified organization and turn transparency into your strongest fundraising asset.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="gap-2 rounded-full">
              <Link href="/onboarding/ngo">
                Register Your Organization <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link href="/for-organizations">Learn more</Link>
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
