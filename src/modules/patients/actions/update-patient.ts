"use server"

import { createClient } from "@/lib/supabase/server"
import { logAudit } from "@/lib/audit"
import { revalidatePath } from "next/cache"

export async function updatePatient(formData: FormData) {
  const id = formData.get("id") as string
  const name = formData.get("name") as string
  const phone = formData.get("phone") as string
  const languagePref = (formData.get("language_pref") as string) || "fr"

  if (!id || !name || !phone) {
    return { error: "Données manquantes." }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("patients")
    .update({ name, phone, language_pref: languagePref })
    .eq("id", id)

  if (error) return { error: error.message }

  await logAudit({
    action: "update",
    entityType: "patient",
    entityId: id,
  })

  revalidatePath("/dashboard/patients")
  return { success: true }
}
