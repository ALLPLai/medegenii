"use server"

import { createClient } from "@/lib/supabase/server"
import { logAudit } from "@/lib/audit"
import { revalidatePath } from "next/cache"
import type { PaymentStatus } from "@/lib/types/database"

export async function updatePayment(
  id: string,
  data: { amount_mad?: number; payment_status?: PaymentStatus }
) {
  const supabase = await createClient()

  const update: Record<string, unknown> = {}
  if (data.amount_mad !== undefined) update.amount_mad = data.amount_mad
  if (data.payment_status !== undefined) {
    update.payment_status = data.payment_status
    if (data.payment_status === "paid") {
      update.payment_date = new Date().toISOString()
    }
  }

  const { error } = await supabase
    .from("appointments")
    .update(update)
    .eq("id", id)

  if (error) return { error: error.message }

  await logAudit({
    action: "update_payment",
    entityType: "appointment",
    entityId: id,
    metadata: data,
  })

  revalidatePath("/dashboard/payments")
  revalidatePath("/dashboard")
  return { success: true }
}
