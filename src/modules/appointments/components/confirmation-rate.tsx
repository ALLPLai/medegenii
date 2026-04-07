import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export function ConfirmationRate({ rate }: { rate: number }) {
  return (
    <Card className="border-l-4 border-l-violet-400 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Taux de confirmation</CardTitle>
        <div className="rounded-lg bg-violet-100 p-1.5">
          <CheckCircle className="h-4 w-4 text-violet-600" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-violet-700">{rate}%</div>
        <p className="text-xs text-muted-foreground">30 derniers jours</p>
      </CardContent>
    </Card>
  )
}
