"use server"

import { createClient } from "@/lib/supabase/server"
import type { Patient } from "@/lib/types/database"

export async function getPatients(): Promise<Patient[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .order("name", { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}
