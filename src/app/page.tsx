import { SiteShell } from "@/components/site/SiteShell";
import { Hero } from "@/components/home/Hero";
import { Snapshot } from "@/components/home/Snapshot";
import { ValueProp } from "@/components/home/ValueProp";
import { FeaturedInsights } from "@/components/home/FeaturedInsights";

export default function HomePage() {
  return (
    <SiteShell>
      <Hero />
      <Snapshot />
      <ValueProp />
      <FeaturedInsights />
    </SiteShell>
  );
}
