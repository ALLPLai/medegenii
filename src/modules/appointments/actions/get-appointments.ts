"use server"

import { createClient } from "@/lib/supabase/server"
import type { AppointmentWithPatient } from "@/lib/types/database"

export async function getAppointments(filters?: {
  status?: string
  dateFrom?: string
  dateTo?: string
}): Promise<AppointmentWithPatient[]> {
  const supabase = await createClient()

  let query = supabase
    .from("appointments")
    .select("*, patients(name, phone)")
    .order("date_time", { ascending: true })

  if (filters?.status) {
    query = query.eq("status", filters.status)
  }
  if (filters?.dateFrom) {
    query = query.gte("date_time", filters.dateFrom)
  }
  if (filters?.dateTo) {
    query = query.lte("date_time", filters.dateTo)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)
  return (data ?? []) as AppointmentWithPatient[]
}
