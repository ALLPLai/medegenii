"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PatientForm } from "./patient-form"
import { Plus, Pencil } from "lucide-react"
import type { Patient } from "@/lib/types/database"

export function CreatePatientDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors">
        <Plus className="h-4 w-4" />
        Ajouter un patient
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouveau patient</DialogTitle>
        </DialogHeader>
        <PatientForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

export function EditPatientDialog({ patient }: { patient: Patient }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-foreground h-9 w-9">
        <Pencil className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le patient</DialogTitle>
        </DialogHeader>
        <PatientForm patient={patient} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
