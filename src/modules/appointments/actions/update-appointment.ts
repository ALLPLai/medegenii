"use server"

import { createClient } from "@/lib/supabase/server"
import { logAudit } from "@/lib/audit"
import { revalidatePath } from "next/cache"
import type { AppointmentStatus } from "@/lib/types/database"

export async function updateAppointmentStatus(id: string, status: AppointmentStatus) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", id)

  if (error) return { error: error.message }

  await logAudit({
    action: "update_status",
    entityType: "appointment",
    entityId: id,
    metadata: { status },
  })

  revalidatePath("/dashboard/appointments")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function updateAppointment(formData: FormData) {
  const id = formData.get("id") as string
  const dateTime = formData.get("date_time") as string
  const durationMin = parseInt(formData.get("duration_min") as string) || 20
  const amountMad = formData.get("amount_mad") as string
  const notes = formData.get("notes") as string

  if (!id || !dateTime) {
    return { error: "Données manquantes." }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("appointments")
    .update({
      date_time: dateTime,
      duration_min: durationMin,
      amount_mad: amountMad ? parseFloat(amountMad) : null,
      notes: notes || null,
    })
    .eq("id", id)

  if (error) return { error: error.message }

  await logAudit({
    action: "update",
    entityType: "appointment",
    entityId: id,
  })

  revalidatePath("/dashboard/appointments")
  revalidatePath("/dashboard")
  return { success: true }
}
