export type { Patient, PatientConsent, LanguagePref, ConsentType } from "@/lib/types/database"

export interface PatientWithConsents {
  id: string
  doctor_id: string
  name: string
  phone: string
  language_pref: "fr" | "ar" | "darija"
  created_at: string
  patient_consents: {
    id: string
    consent_type: string
    consented_at: string
    revoked_at: string | null
  }[]
}
