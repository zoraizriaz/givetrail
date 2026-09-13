import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OrganizationCta() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl trail-gradient-bg px-8 py-14 text-center sm:px-16">
        <h2 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
          Ready to show your donors where it goes?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Join GiveTrail as a verified organization and turn transparency into your strongest fundraising asset.
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/onboarding/ngo">
              Register Your Organization <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="bg-background/60">
            <Link href="/for-organizations">Learn more</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
