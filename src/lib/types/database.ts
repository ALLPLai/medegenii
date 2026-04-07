export type AppointmentStatus = "scheduled" | "confirmed" | "cancelled" | "completed" | "no_show"
export type PatientResponse = "confirmed" | "reschedule" | "cancelled"
export type PaymentStatus = "pending" | "paid" | "partial" | "overdue"
export type LanguagePref = "fr" | "ar" | "darija"
export type ConsentType = "whatsapp_reminder" | "whatsapp_vocal" | "data_processing" | "transcription"
export type SubscriptionStatus = "trial" | "active" | "past_due" | "cancelled" | "master"

export interface Doctor {
  id: string
  email: string
  name: string
  phone: string | null
  specialty: string
  city: string | null
  subscription_status: SubscriptionStatus
  subscription_provider: string
  created_at: string
}

export interface Patient {
  id: string
  doctor_id: string
  name: string
  phone: string
  language_pref: LanguagePref
  created_at: string
}

export interface Appointment {
  id: string
  doctor_id: string
  patient_id: string
  date_time: string
  duration_min: number
  status: AppointmentStatus
  reminder_j1_sent: boolean
  reminder_j0_sent: boolean
  patient_response: PatientResponse | null
  amount_mad: number | null
  payment_status: PaymentStatus
  payment_date: string | null
  relance_count: number
  last_relance_at: string | null
  notes: string | null
  created_at: string
}

export interface AppointmentWithPatient extends Appointment {
  patients: { name: string; phone: string }
}

export interface PatientConsent {
  id: string
  patient_id: string
  doctor_id: string
  consent_type: ConsentType
  consented_at: string
  ip_address: string | null
  revoked_at: string | null
}

export interface AuditLog {
  id: string
  doctor_id: string
  action: string
  entity_type: string
  entity_id: string | null
  metadata: Record<string, unknown>
  created_at: string
}
