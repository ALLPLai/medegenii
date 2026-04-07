"use server"

import { createClient } from "@/lib/supabase/server"
import { logAudit } from "@/lib/audit"
import { revalidatePath } from "next/cache"

export async function updateDoctorProfile(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const name = formData.get("name") as string
  const phone = formData.get("phone") as string
  const specialty = formData.get("specialty") as string
  const city = formData.get("city") as string

  if (!name) return { error: "Le nom est requis." }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Non authentifié." }

  const { error } = await supabase
    .from("doctors")
    .update({
      name,
      phone: phone || null,
      specialty: specialty || "generaliste",
      city: city || null,
    })
    .eq("id", user.id)

  if (error) return { error: error.message }

  await logAudit({
    action: "update_profile",
    entityType: "doctor",
    entityId: user.id,
  })

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/settings")
  return { success: true }
}
