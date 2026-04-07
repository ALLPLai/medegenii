"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AppointmentForm } from "./appointment-form"
import { Plus, Pencil } from "lucide-react"
import type { AppointmentWithPatient, Patient } from "@/lib/types/database"

export function CreateAppointmentDialog({ patients }: { patients: Patient[] }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors">
        <Plus className="h-4 w-4" />
        Nouveau rendez-vous
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouveau rendez-vous</DialogTitle>
        </DialogHeader>
        <AppointmentForm patients={patients} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

export function EditAppointmentDialog({
  appointment,
  patients,
}: {
  appointment: AppointmentWithPatient
  patients: Patient[]
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-foreground h-9 w-9">
        <Pencil className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le rendez-vous</DialogTitle>
        </DialogHeader>
        <AppointmentForm
          appointment={appointment}
          patients={patients}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
