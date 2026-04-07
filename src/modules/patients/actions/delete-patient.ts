"use server"

import { createClient } from "@/lib/supabase/server"
import { logAudit } from "@/lib/audit"
import { revalidatePath } from "next/cache"

export async function deletePatient(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("patients")
    .delete()
    .eq("id", id)

  if (error) return { error: error.message }

  await logAudit({
    action: "delete",
    entityType: "patient",
    entityId: id,
  })

  revalidatePath("/dashboard/patients")
  return { success: true }
}
