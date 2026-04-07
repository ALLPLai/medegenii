"use client"

import { useTransition } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { markAsPaid } from "@/modules/billing/actions/mark-as-paid"
import type { UnpaidAppointment } from "@/modules/billing/types"

const paymentLabels: Record<string, { label: string; className: string }> = {
  pending: { label: "En attente", className: "text-violet-600 bg-violet-50 border-violet-200" },
  partial: { label: "Partiel", className: "text-blue-600 bg-blue-50 border-blue-200" },
  overdue: { label: "Impayé", className: "text-violet-800 bg-violet-100 border-violet-300" },
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeZone: "Africa/Casablanca",
  }).format(new Date(iso))
}

export function UnpaidList({ appointments }: { appointments: UnpaidAppointment[] }) {
  const [isPending, startTransition] = useTransition()

  function handleMarkPaid(id: string) {
    if (!confirm("Marquer ce rendez-vous comme payé ?")) return
    startTransition(() => {
      markAsPaid(id)
    })
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Montant</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Relances</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                Aucun impayé. Tous les paiements sont à jour.
              </TableCell>
            </TableRow>
          ) : (
            appointments.map((appt) => {
              const payment = paymentLabels[appt.payment_status] ?? { label: "En attente", className: "text-orange-600 bg-orange-50" }
              return (
                <TableRow key={appt.id}>
                  <TableCell className="font-medium">{appt.patient_name}</TableCell>
                  <TableCell>{formatDate(appt.date_time)}</TableCell>
                  <TableCell>{appt.amount_mad} MAD</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={payment.className}>
                      {payment.label}
                    </Badge>
                  </TableCell>
                  <TableCell>{appt.relance_count}/2</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkPaid(appt.id)}
                      disabled={isPending}
                    >
                      <Check className="mr-1 h-4 w-4" />
                      Marquer payé
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
