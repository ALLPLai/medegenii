"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createPatient } from "@/modules/patients/actions/create-patient"
import { updatePatient } from "@/modules/patients/actions/update-patient"
import type { Patient } from "@/lib/types/database"

interface PatientFormProps {
  patient?: Patient
  onSuccess?: () => void
}

function formAction(
  patient: Patient | undefined,
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  if (patient) {
    formData.set("id", patient.id)
    return updatePatient(formData)
  }
  return createPatient(formData)
}

export function PatientForm({ patient, onSuccess }: PatientFormProps) {
  const boundAction = formAction.bind(null, patient)
  const [state, action, isPending] = useActionState(boundAction, null)

  if (state?.success) {
    onSuccess?.()
  }

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nom complet</Label>
        <Input
          id="name"
          name="name"
          defaultValue={patient?.name}
          placeholder="Mohamed Alami"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Téléphone</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={patient?.phone}
          placeholder="0612345678"
          pattern="^0[67]\d{8}$"
          title="Numéro marocain : 06 ou 07 suivi de 8 chiffres"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="language_pref">Langue préférée</Label>
        <Select name="language_pref" defaultValue={patient?.language_pref ?? "fr"}>
          <SelectTrigger>
            <SelectValue placeholder="Choisir une langue" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fr">Français</SelectItem>
            <SelectItem value="ar">Arabe</SelectItem>
            <SelectItem value="darija">Darija</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!patient && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="consent_whatsapp_reminder"
            name="consent_whatsapp_reminder"
            defaultChecked
            className="rounded border-input"
          />
          <Label htmlFor="consent_whatsapp_reminder" className="text-sm font-normal">
            Consentement rappels WhatsApp
          </Label>
        </div>
      )}

      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending
          ? "Enregistrement..."
          : patient
            ? "Modifier"
            : "Ajouter le patient"}
      </Button>
    </form>
  )
}
