import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SettingsForm } from "./settings-form"

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: doctor } = await supabase
    .from("doctors")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!doctor) redirect("/login")

  return (
    <div className="space-y-6">
      <div className="-mx-4 -mt-4 md:-mx-6 md:-mt-6 mb-2 rounded-b-xl bg-gradient-to-b from-violet-50/60 to-transparent px-4 pb-4 pt-4 md:px-6 md:pt-6 dark:from-violet-950/30 dark:to-transparent">
        <h1 className="text-2xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground">Gérez votre profil et vos préférences.</p>
      </div>
      <SettingsForm doctor={doctor} />
    </div>
  )
}
