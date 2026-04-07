import { getDashboardStats } from "@/modules/appointments/actions/get-stats"
import { getAppointments } from "@/modules/appointments/actions/get-appointments"
import { getUnpaidAppointments } from "@/modules/billing/actions/get-unpaid-appointments"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarCheck, AlertTriangle, Banknote, UserPlus, CalendarPlus, CreditCard } from "lucide-react"
import { ConfirmationRate } from "@/modules/appointments/components/confirmation-rate"
import { TodayAppointments } from "@/modules/appointments/components/today-appointments"
import { UnpaidList } from "@/modules/billing/components/unpaid-list"
import Link from "next/link"
import type { AppointmentWithPatient } from "@/lib/types/database"

export default async function DashboardPage() {
  const today = new Date().toISOString().split("T")[0]!
  const formattedDate = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let doctorName = "Docteur"
  if (user) {
    const { data: doctor } = await supabase
      .from("doctors")
      .select("name")
      .eq("id", user.id)
      .single()
    doctorName = doctor?.name ?? user.email?.split("@")[0] ?? "Docteur"
  }

  const [stats, todayAppointments, unpaid] = await Promise.all([
    getDashboardStats(),
    getAppointments({
      dateFrom: `${today}T00:00:00`,
      dateTo: `${today}T23:59:59`,
    }),
    getUnpaidAppointments(),
  ])

  const recentUnpaid = unpaid.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-5 shadow-lg shadow-violet-600/10">
        <h1 className="text-2xl font-bold text-white">
          Bonjour, Dr {doctorName}
        </h1>
        <p className="mt-1 text-sm text-violet-200 capitalize">
          {formattedDate}
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-violet-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RDV aujourd&apos;hui</CardTitle>
            <div className="rounded-lg bg-violet-100 p-1.5">
              <CalendarCheck className="h-4 w-4 text-violet-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-700">{stats.todayCount}</div>
          </CardContent>
        </Card>

        <ConfirmationRate rate={stats.confirmationRate} />

        <Card className="border-l-4 border-l-violet-400 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total impayé</CardTitle>
            <div className="rounded-lg bg-violet-100 p-1.5">
              <AlertTriangle className="h-4 w-4 text-violet-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-700">
              {stats.totalUnpaid.toLocaleString("fr-FR")} MAD
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payé ce mois</CardTitle>
            <div className="rounded-lg bg-blue-100 p-1.5">
              <Banknote className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalPaidThisMonth.toLocaleString("fr-FR")} MAD
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid gap-3 md:grid-cols-3">
        <Link
          href="/dashboard/patients"
          className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-sm font-medium transition-colors hover:bg-violet-50 hover:border-violet-200 hover:text-violet-700"
        >
          <div className="rounded-md bg-violet-100 p-1.5">
            <UserPlus className="h-4 w-4 text-violet-600" />
          </div>
          Nouveau patient
        </Link>
        <Link
          href="/dashboard/appointments"
          className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-sm font-medium transition-colors hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
        >
          <div className="rounded-md bg-blue-100 p-1.5">
            <CalendarPlus className="h-4 w-4 text-blue-600" />
          </div>
          Nouveau RDV
        </Link>
        <Link
          href="/dashboard/payments"
          className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-sm font-medium transition-colors hover:bg-violet-50 hover:border-violet-200 hover:text-violet-700"
        >
          <div className="rounded-md bg-violet-100 p-1.5">
            <CreditCard className="h-4 w-4 text-violet-600" />
          </div>
          Voir les impayés
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <TodayAppointments appointments={todayAppointments as AppointmentWithPatient[]} />

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Impayés récents</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentUnpaid.length === 0 ? (
              <p className="text-sm text-muted-foreground px-6 pb-4">
                Aucun impayé.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <UnpaidList appointments={recentUnpaid} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
