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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Trash2, Search } from "lucide-react"
import { EditAppointmentDialog } from "./appointment-dialog"
import { deleteAppointment } from "@/modules/appointments/actions/delete-appointment"
import { updateAppointmentStatus } from "@/modules/appointments/actions/update-appointment"
import type { AppointmentWithPatient, AppointmentStatus, Patient } from "@/lib/types/database"

const statusConfig: Record<AppointmentStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  scheduled: { label: "Planifié", variant: "secondary" },
  confirmed: { label: "Confirmé", variant: "default" },
  completed: { label: "Terminé", variant: "default" },
  cancelled: { label: "Annulé", variant: "outline" },
  no_show: { label: "Absent", variant: "destructive" },
}

const paymentLabels: Record<string, { label: string; className: string }> = {
  pending: { label: "En attente", className: "text-violet-600 bg-violet-50 border-violet-200" },
  paid: { label: "Payé", className: "text-blue-600 bg-blue-50 border-blue-200" },
  partial: { label: "Partiel", className: "text-violet-500 bg-violet-50/50 border-violet-200" },
  overdue: { label: "Impayé", className: "text-violet-800 bg-violet-100 border-violet-300" },
}

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Casablanca",
  }).format(new Date(iso))
}

export function AppointmentList({
  appointments,
  patients,
}: {
  appointments: AppointmentWithPatient[]
  patients: Patient[]
}) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isPending, startTransition] = useTransition()

  const filtered = appointments.filter((a) => {
    const matchesSearch =
      a.patients.name.toLowerCase().includes(search.toLowerCase()) ||
      a.patients.phone.includes(search)
    const matchesStatus = statusFilter === "all" || a.status === statusFilter
    return matchesSearch && matchesStatus
  })

  function handleDelete(id: string) {
    if (!confirm("Supprimer ce rendez-vous ?")) return
    startTransition(() => {
      deleteAppointment(id)
    })
  }

  function handleStatusChange(id: string, status: AppointmentStatus) {
    startTransition(() => {
      updateAppointmentStatus(id, status)
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher par patient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="scheduled">Planifié</SelectItem>
            <SelectItem value="confirmed">Confirmé</SelectItem>
            <SelectItem value="completed">Terminé</SelectItem>
            <SelectItem value="cancelled">Annulé</SelectItem>
            <SelectItem value="no_show">Absent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Date / Heure</TableHead>
              <TableHead>Durée</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Paiement</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  {appointments.length === 0
                    ? "Aucun rendez-vous. Créez votre premier rendez-vous."
                    : "Aucun résultat."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((appt) => {
                const status = statusConfig[appt.status]
                const payment = paymentLabels[appt.payment_status] ?? { label: "En attente", className: "text-orange-600 bg-orange-50" }

                return (
                  <TableRow key={appt.id}>
                    <TableCell className="font-medium">{appt.patients.name}</TableCell>
                    <TableCell>{formatDateTime(appt.date_time)}</TableCell>
                    <TableCell>{appt.duration_min} min</TableCell>
                    <TableCell>
                      <Select
                        value={appt.status}
                        onValueChange={(v) => handleStatusChange(appt.id, v as AppointmentStatus)}
                        disabled={isPending}
                      >
                        <SelectTrigger className="h-7 w-[120px]">
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scheduled">Planifié</SelectItem>
                          <SelectItem value="confirmed">Confirmé</SelectItem>
                          <SelectItem value="completed">Terminé</SelectItem>
                          <SelectItem value="cancelled">Annulé</SelectItem>
                          <SelectItem value="no_show">Absent</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {appt.amount_mad != null
                        ? `${appt.amount_mad} MAD`
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={payment.className}>
                        {payment.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <EditAppointmentDialog appointment={appt} patients={patients} />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(appt.id)}
                          disabled={isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
