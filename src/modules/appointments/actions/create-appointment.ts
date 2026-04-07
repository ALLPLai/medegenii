"use server"

import { createClient } from "@/lib/supabase/server"
import { logAudit } from "@/lib/audit"
import { revalidatePath } from "next/cache"

export async function createAppointment(formData: FormData) {
  const patientId = formData.get("patient_id") as string
  const dateTime = formData.get("date_time") as string
  const durationMin = parseInt(formData.get("duration_min") as string) || 20
  const amountMad = formData.get("amount_mad") as string
  const notes = formData.get("notes") as string

  if (!patientId || !dateTime) {
    return { error: "Le patient et la date sont requis." }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Non authentifié." }

  const { data, error } = await supabase
    .from("appointments")
    .insert({
      doctor_id: user.id,
      patient_id: patientId,
      date_time: dateTime,
      duration_min: durationMin,
      amount_mad: amountMad ? parseFloat(amountMad) : null,
      notes: notes || null,
    })
    .select("id")
    .single()

  if (error) return { error: error.message }

  await logAudit({
    action: "create",
    entityType: "appointment",
    entityId: data.id,
  })

  revalidatePath("/dashboard/appointments")
  revalidatePath("/dashboard")
  return { success: true }
}
