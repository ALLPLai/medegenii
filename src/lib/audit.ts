"use server"

import { createClient } from "@/lib/supabase/server"

export async function logAudit(params: {
  action: string
  entityType: string
  entityId?: string
  metadata?: Record<string, unknown>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  try {
    await supabase.from("audit_log").insert({
      doctor_id: user.id,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId ?? null,
      metadata: params.metadata ?? {},
    })
  } catch {
    // Audit logging should never block the main operation
  }
}
