import { getPatients } from "@/modules/patients/actions/get-patients"
import { PatientList } from "@/modules/patients/components/patient-list"
import { CreatePatientDialog } from "@/modules/patients/components/patient-dialog"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Patients — Medgenii",
}

export default async function PatientsPage() {
  const patients = await getPatients()

  return (
    <div className="space-y-6">
      <div className="-mx-4 -mt-4 md:-mx-6 md:-mt-6 mb-2 rounded-b-xl bg-gradient-to-b from-violet-50/60 to-transparent px-4 pb-4 pt-4 md:px-6 md:pt-6 dark:from-violet-950/30 dark:to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Patients</h1>
            <p className="text-muted-foreground">
              {patients.length} patient{patients.length !== 1 ? "s" : ""} enregistré{patients.length !== 1 ? "s" : ""}
            </p>
          </div>
          <CreatePatientDialog />
        </div>
      </div>
      <PatientList patients={patients} />
    </div>
  )
}
