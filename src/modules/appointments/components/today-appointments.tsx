import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarClock } from "lucide-react"
import type { AppointmentWithPatient, AppointmentStatus } from "@/lib/types/database"

const statusLabels: Record<AppointmentStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  scheduled: { label: "Planifié", variant: "secondary" },
  confirmed: { label: "Confirmé", variant: "default" },
  completed: { label: "Terminé", variant: "default" },
  cancelled: { label: "Annulé", variant: "outline" },
  no_show: { label: "Absent", variant: "destructive" },
}

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    timeStyle: "short",
    timeZone: "Africa/Casablanca",
  }).format(new Date(iso))
}

export function TodayAppointments({
  appointments,
}: {
  appointments: AppointmentWithPatient[]
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Rendez-vous du jour</CardTitle>
        <div className="rounded-lg bg-violet-100 p-1.5">
          <CalendarClock className="h-4 w-4 text-violet-600" />
        </div>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun rendez-vous aujourd&apos;hui.</p>
        ) : (
          <ul className="space-y-3">
            {appointments.map((appt) => {
              const status = statusLabels[appt.status]
              return (
                <li key={appt.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{appt.patients.name}</span>
                    <span className="text-muted-foreground ml-2">{formatTime(appt.date_time)}</span>
                  </div>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
