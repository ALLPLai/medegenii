import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, Bell } from "lucide-react"
import type { PaymentSummary } from "@/modules/billing/types"

export function PaymentOverviewCards({ summary }: { summary: PaymentSummary }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="border-l-4 border-l-violet-500 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total impayé</CardTitle>
          <div className="rounded-lg bg-violet-100 p-1.5">
            <AlertTriangle className="h-4 w-4 text-violet-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-violet-700">
            {summary.totalUnpaid.toLocaleString("fr-FR")} MAD
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-blue-500 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total payé</CardTitle>
          <div className="rounded-lg bg-blue-100 p-1.5">
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {summary.totalPaid.toLocaleString("fr-FR")} MAD
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-violet-400 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Relances en cours</CardTitle>
          <div className="rounded-lg bg-violet-100 p-1.5">
            <Bell className="h-4 w-4 text-violet-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-violet-700">
            {summary.relancesEnCours}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
