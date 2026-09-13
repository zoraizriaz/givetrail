import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { AudienceSections } from "@/components/home/audience-sections";
import { TransparencyExample } from "@/components/home/transparency-example";
import { GlobalVision } from "@/components/home/global-vision";
import { OrganizationCta } from "@/components/home/org-cta";
import { PageTour } from "@/components/tour/page-tour";
import { homeTourSteps } from "@/components/tour/steps";

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <AudienceSections />
      <TransparencyExample />
      <GlobalVision />
      <OrganizationCta />
      <PageTour tourId="home" steps={homeTourSteps} />
    </>
  );
}
