export type { PaymentStatus, AppointmentWithPatient } from "@/lib/types/database"

export interface PaymentSummary {
  totalUnpaid: number
  totalPaid: number
  relancesEnCours: number
}

export interface UnpaidAppointment {
  id: string
  patient_name: string
  patient_phone: string
  date_time: string
  amount_mad: number
  payment_status: string
  relance_count: number
}
