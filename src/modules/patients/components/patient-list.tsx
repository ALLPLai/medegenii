"use client"

import { useState, useTransition } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Search } from "lucide-react"
import { EditPatientDialog } from "./patient-dialog"
import { deletePatient } from "@/modules/patients/actions/delete-patient"
import type { Patient } from "@/lib/types/database"

const langLabels: Record<string, string> = {
  fr: "Français",
  ar: "Arabe",
  darija: "Darija",
}

export function PatientList({ patients }: { patients: Patient[] }) {
  const [search, setSearch] = useState("")
  const [isPending, startTransition] = useTransition()

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search)
  )

  function handleDelete(id: string) {
    if (!confirm("Supprimer ce patient et tous ses rendez-vous ?")) return
    startTransition(() => {
      deletePatient(id)
    })
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher un patient..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Langue</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  {patients.length === 0
                    ? "Aucun patient. Ajoutez votre premier patient."
                    : "Aucun résultat."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell>{patient.phone}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {langLabels[patient.language_pref] ?? patient.language_pref}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <EditPatientDialog patient={patient} />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(patient.id)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
