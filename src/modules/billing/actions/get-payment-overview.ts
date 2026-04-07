"use server"

import { createClient } from "@/lib/supabase/server"
import type { PaymentSummary } from "@/modules/billing/types"

export async function getPaymentOverview(): Promise<PaymentSummary> {
  const supabase = await createClient()

  const [unpaidResult, paidResult, relanceResult] = await Promise.all([
    supabase
      .from("appointments")
      .select("amount_mad")
      .in("payment_status", ["pending", "partial", "overdue"])
      .not("amount_mad", "is", null),
    supabase
      .from("appointments")
      .select("amount_mad")
      .eq("payment_status", "paid")
      .not("amount_mad", "is", null),
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .in("payment_status", ["pending", "overdue"])
      .gt("relance_count", 0)
      .lt("relance_count", 2),
  ])

  const totalUnpaid =
    unpaidResult.data?.reduce((sum, a) => sum + (Number(a.amount_mad) || 0), 0) ?? 0
  const totalPaid =
    paidResult.data?.reduce((sum, a) => sum + (Number(a.amount_mad) || 0), 0) ?? 0

  return {
    totalUnpaid,
    totalPaid,
    relancesEnCours: relanceResult.count ?? 0,
  }
}
