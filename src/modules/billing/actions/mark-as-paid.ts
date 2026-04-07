"use server"

import { createClient } from "@/lib/supabase/server"
import { logAudit } from "@/lib/audit"
import { revalidatePath } from "next/cache"

export async function markAsPaid(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("appointments")
    .update({
      payment_status: "paid",
      payment_date: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) return { error: error.message }

  await logAudit({
    action: "mark_paid",
    entityType: "appointment",
    entityId: id,
  })

  revalidatePath("/dashboard/payments")
  revalidatePath("/dashboard")
  return { success: true }
}
