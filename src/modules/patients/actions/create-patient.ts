"use server"

import { createClient } from "@/lib/supabase/server"
import { logAudit } from "@/lib/audit"
import { revalidatePath } from "next/cache"

export async function createPatient(formData: FormData) {
  const name = formData.get("name") as string
  const phone = formData.get("phone") as string
  const languagePref = (formData.get("language_pref") as string) || "fr"
  const consentReminder = formData.get("consent_whatsapp_reminder") === "on"

  if (!name || !phone) {
    return { error: "Le nom et le téléphone sont requis." }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Non authentifié." }

  const { data: patient, error } = await supabase
    .from("patients")
    .insert({
      doctor_id: user.id,
      name,
      phone,
      language_pref: languagePref,
    })
    .select("id")
    .single()

  if (error) return { error: error.message }

  // Create consent records (non-blocking — consent insert failure should not block patient creation)
  const consents = [
    { consent_type: "data_processing" as const },
    ...(consentReminder ? [{ consent_type: "whatsapp_reminder" as const }] : []),
  ]

  for (const consent of consents) {
    try {
      await supabase.from("patient_consents").insert({
        patient_id: patient.id,
        doctor_id: user.id,
        consent_type: consent.consent_type,
      })
    } catch {
      // Consent insert failure should not block patient creation
    }
  }

  await logAudit({
    action: "create",
    entityType: "patient",
    entityId: patient.id,
  })

  revalidatePath("/dashboard/patients")
  return { success: true }
}
