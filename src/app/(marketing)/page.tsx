import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { AudienceSections } from "@/components/home/audience-sections";
import { TransparencyExample } from "@/components/home/transparency-example";
import { GlobalVision } from "@/components/home/global-vision";
import { OrganizationCta } from "@/components/home/org-cta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <AudienceSections />
      <TransparencyExample />
      <GlobalVision />
      <OrganizationCta />
    </>
  );
}
