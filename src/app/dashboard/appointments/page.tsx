import { getAppointments } from "@/modules/appointments/actions/get-appointments"
import { getPatients } from "@/modules/patients/actions/get-patients"
import { AppointmentList } from "@/modules/appointments/components/appointment-list"
import { CreateAppointmentDialog } from "@/modules/appointments/components/appointment-dialog"

export default async function AppointmentsPage() {
  const [appointments, patients] = await Promise.all([
    getAppointments(),
    getPatients(),
  ])

  return (
    <div className="space-y-6">
      <div className="-mx-4 -mt-4 md:-mx-6 md:-mt-6 mb-2 rounded-b-xl bg-gradient-to-b from-violet-50/60 to-transparent px-4 pb-4 pt-4 md:px-6 md:pt-6 dark:from-violet-950/30 dark:to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Rendez-vous</h1>
            <p className="text-muted-foreground">Gérez vos rendez-vous et suivez les confirmations.</p>
          </div>
          <CreateAppointmentDialog patients={patients} />
        </div>
      </div>
      <AppointmentList appointments={appointments} patients={patients} />
    </div>
  )
}
