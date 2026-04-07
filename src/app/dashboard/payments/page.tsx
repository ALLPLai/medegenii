import { getPaymentOverview } from "@/modules/billing/actions/get-payment-overview"
import { getUnpaidAppointments } from "@/modules/billing/actions/get-unpaid-appointments"
import { PaymentOverviewCards } from "@/modules/billing/components/payment-overview-cards"
import { UnpaidList } from "@/modules/billing/components/unpaid-list"

export default async function PaymentsPage() {
  const [summary, unpaid] = await Promise.all([
    getPaymentOverview(),
    getUnpaidAppointments(),
  ])

  return (
    <div className="space-y-6">
      <div className="-mx-4 -mt-4 md:-mx-6 md:-mt-6 mb-2 rounded-b-xl bg-gradient-to-b from-violet-50/60 to-transparent px-4 pb-4 pt-4 md:px-6 md:pt-6 dark:from-violet-950/30 dark:to-transparent">
        <div>
          <h1 className="text-2xl font-bold">Paiements</h1>
          <p className="text-muted-foreground">Suivez les paiements et relancez les impayés.</p>
        </div>
      </div>
      <PaymentOverviewCards summary={summary} />
      <div>
        <h2 className="text-lg font-semibold mb-4">Impayés</h2>
        <UnpaidList appointments={unpaid} />
      </div>
    </div>
  )
}
