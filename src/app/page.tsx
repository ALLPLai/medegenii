import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { HeroSection } from "@/components/blocks/hero-section"
import { FeaturesSection } from "@/components/blocks/features-section"
import { LandingFooter } from "@/components/blocks/landing-footer"

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <main>
      <HeroSection />
      <FeaturesSection />
      <LandingFooter />
    </main>
  )
}
