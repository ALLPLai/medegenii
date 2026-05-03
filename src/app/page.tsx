import { HeroSection } from "@/components/blocks/hero-section"
import { HowItWorks } from "@/components/blocks/how-it-works"
import { FeaturesSection } from "@/components/blocks/features-section"
import { PricingSection } from "@/components/blocks/pricing-section"
import { LandingFooter } from "@/components/blocks/landing-footer"

export default function Home() {
  return (
    <main className="bg-[#0C0F1D]">
      <HeroSection />
      <HowItWorks />
      <FeaturesSection />
      <PricingSection />
      <LandingFooter />
    </main>
  )
}
