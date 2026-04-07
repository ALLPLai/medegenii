"use server"

import { createClient } from "@/lib/supabase/server"

export interface DashboardStats {
  todayCount: number
  confirmationRate: number
  totalUnpaid: number
  totalPaidThisMonth: number
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient()
  const today = new Date().toISOString().split("T")[0]!
  const monthStart = `${today.substring(0, 7)}-01`

  // Today's appointments
  const { count: todayCount } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .gte("date_time", `${today}T00:00:00`)
    .lte("date_time", `${today}T23:59:59`)

  // Confirmation rate (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: recentAppts } = await supabase
    .from("appointments")
    .select("status")
    .gte("date_time", thirtyDaysAgo.toISOString())
    .in("status", ["confirmed", "completed", "no_show", "cancelled"])

  const total = recentAppts?.length ?? 0
  const confirmed = recentAppts?.filter(
    (a) => a.status === "confirmed" || a.status === "completed"
  ).length ?? 0
  const confirmationRate = total > 0 ? Math.round((confirmed / total) * 100) : 0

  // Total unpaid
  const { data: unpaidData } = await supabase
    .from("appointments")
    .select("amount_mad")
    .in("payment_status", ["pending", "partial", "overdue"])
    .not("amount_mad", "is", null)

  const totalUnpaid = unpaidData?.reduce(
    (sum, a) => sum + (Number(a.amount_mad) || 0),
    0
  ) ?? 0

  // Total paid this month
  const { data: paidData } = await supabase
    .from("appointments")
    .select("amount_mad")
    .eq("payment_status", "paid")
    .gte("payment_date", monthStart)

  const totalPaidThisMonth = paidData?.reduce(
    (sum, a) => sum + (Number(a.amount_mad) || 0),
    0
  ) ?? 0

  return {
    todayCount: todayCount ?? 0,
    confirmationRate,
    totalUnpaid,
    totalPaidThisMonth,
  }
}
