"use client"

import { useState, useTransition } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Pencil } from "lucide-react"
import { updatePayment } from "@/modules/billing/actions/update-payment"
import type { PaymentStatus } from "@/lib/types/database"
import type { UnpaidAppointment } from "@/modules/billing/types"

export function PaymentDialog({ appointment }: { appointment: UnpaidAppointment }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(formData: FormData) {
    setError(null)
    const amount = parseFloat(formData.get("amount_mad") as string)
    const status = formData.get("payment_status") as PaymentStatus

    startTransition(async () => {
      const result = await updatePayment(appointment.id, {
        amount_mad: amount,
        payment_status: status,
      })
      if (result.error) {
        setError(result.error)
      } else {
        setOpen(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-foreground h-9 w-9">
        <Pencil className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le paiement</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Patient</Label>
            <p className="text-sm text-muted-foreground">{appointment.patient_name}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount_mad">Montant (MAD)</Label>
            <Input
              id="amount_mad"
              name="amount_mad"
              type="number"
              min={0}
              step={10}
              defaultValue={appointment.amount_mad}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_status">Statut de paiement</Label>
            <Select name="payment_status" defaultValue={appointment.payment_status}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="paid">Payé</SelectItem>
                <SelectItem value="partial">Partiel</SelectItem>
                <SelectItem value="overdue">Impayé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
