import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar, MobileNav } from "./components/sidebar"
import { hasDashboardAccess } from "@/lib/subscription"
import type { SubscriptionStatus } from "@/lib/types/database"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: doctor } = await supabase
    .from("doctors")
    .select("name, specialty, subscription_status")
    .eq("id", user.id)
    .single()

  // Safety net: ensure doctor record exists (in case auth callback failed to create it)
  if (!doctor) {
    const nameFromEmail = user.email?.split("@")[0] ?? "Docteur"
    await supabase.from("doctors").insert({
      id: user.id,
      email: user.email!,
      name: nameFromEmail,
    })
  }

  const subscriptionStatus = (doctor?.subscription_status ?? "trial") as SubscriptionStatus

  // Redirect to pricing if subscription expired or cancelled
  if (!hasDashboardAccess(subscriptionStatus)) {
    redirect("/pricing?reason=expired")
  }

  const doctorName = doctor?.name ?? user.email?.split("@")[0] ?? "Docteur"
  const doctorSpecialty = doctor?.specialty ?? "generaliste"

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar doctorName={doctorName} doctorSpecialty={doctorSpecialty} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <MobileNav doctorName={doctorName} doctorSpecialty={doctorSpecialty} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
