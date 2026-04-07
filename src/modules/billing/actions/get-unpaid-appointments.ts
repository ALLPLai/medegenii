"use server"

import { createClient } from "@/lib/supabase/server"
import type { UnpaidAppointment } from "@/modules/billing/types"

export async function getUnpaidAppointments(): Promise<UnpaidAppointment[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("appointments")
    .select("id, date_time, amount_mad, payment_status, relance_count, patients(name, phone)")
    .in("payment_status", ["pending", "partial", "overdue"])
    .not("amount_mad", "is", null)
    .order("date_time", { ascending: false })

  if (error) throw new Error(error.message)

  return (data ?? []).map((row) => ({
    id: row.id,
    patient_name: (row.patients as unknown as { name: string; phone: string }).name,
    patient_phone: (row.patients as unknown as { name: string; phone: string }).phone,
    date_time: row.date_time,
    amount_mad: Number(row.amount_mad) || 0,
    payment_status: row.payment_status,
    relance_count: row.relance_count,
  }))
}
