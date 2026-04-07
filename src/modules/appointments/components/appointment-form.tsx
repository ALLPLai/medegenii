"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createAppointment } from "@/modules/appointments/actions/create-appointment"
import { updateAppointment } from "@/modules/appointments/actions/update-appointment"
import type { AppointmentWithPatient, Patient } from "@/lib/types/database"

interface AppointmentFormProps {
  appointment?: AppointmentWithPatient
  patients: Patient[]
  onSuccess?: () => void
}

function formAction(
  appointment: AppointmentWithPatient | undefined,
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  if (appointment) {
    formData.set("id", appointment.id)
    return updateAppointment(formData)
  }
  return createAppointment(formData)
}

export function AppointmentForm({ appointment, patients, onSuccess }: AppointmentFormProps) {
  const boundAction = formAction.bind(null, appointment)
  const [state, action, isPending] = useActionState(boundAction, null)

  if (state?.success) {
    onSuccess?.()
  }

  const defaultDateTime = appointment
    ? appointment.date_time.slice(0, 16)
    : ""

  return (
    <form action={action} className="space-y-4">
      {!appointment && (
        <div className="space-y-2">
          <Label htmlFor="patient_id">Patient</Label>
          <Select name="patient_id" required>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un patient" />
            </SelectTrigger>
            <SelectContent>
              {patients.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} — {p.phone}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="date_time">Date et heure</Label>
        <Input
          id="date_time"
          name="date_time"
          type="datetime-local"
          defaultValue={defaultDateTime}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="duration_min">Durée (minutes)</Label>
        <Input
          id="duration_min"
          name="duration_min"
          type="number"
          min={5}
          max={120}
          step={5}
          defaultValue={appointment?.duration_min ?? 20}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount_mad">Montant (MAD)</Label>
        <Input
          id="amount_mad"
          name="amount_mad"
          type="number"
          min={0}
          step={10}
          defaultValue={appointment?.amount_mad ?? ""}
          placeholder="Ex: 200"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Input
          id="notes"
          name="notes"
          defaultValue={appointment?.notes ?? ""}
          placeholder="Notes optionnelles..."
        />
      </div>

      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending
          ? "Enregistrement..."
          : appointment
            ? "Modifier"
            : "Créer le rendez-vous"}
      </Button>
    </form>
  )
}
