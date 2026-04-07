import Link from "next/link"
import { Logo } from "@/components/logo"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { hasDashboardAccess } from "@/lib/subscription"
import { ArrowRight, Check, Clock } from "lucide-react"
import type { SubscriptionStatus } from "@/lib/types/database"

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: doctor } = await supabase
      .from("doctors")
      .select("subscription_status")
      .eq("id", user.id)
      .single()
    const status = (doctor?.subscription_status ?? "trial") as SubscriptionStatus
    if (hasDashboardAccess(status)) {
      redirect("/dashboard")
    }
  }

  const isExpired = params.reason === "expired"

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-slate-900/5 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={28} />
            <span className="text-[15px] font-bold text-slate-900">Medgenii</span>
          </Link>
          {user ? (
            <Link href="/dashboard" className="text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors">
              Tableau de bord
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-violet-600 px-3.5 text-[13px] font-medium text-white shadow-sm shadow-violet-600/20 hover:bg-violet-700 transition-colors"
            >
              Se connecter
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-16 md:py-24">
        {/* Expired notice */}
        {isExpired && (
          <div className="mx-auto mb-10 max-w-md rounded-xl border border-amber-200 bg-amber-50 p-4 text-center text-[13px] font-medium text-amber-800">
            Votre période d&apos;essai a expiré. Choisissez un plan pour continuer.
          </div>
        )}

        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-violet-600">
            Tarifs
          </p>
          <h1 className="mt-3 text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold leading-tight tracking-[-0.03em] text-slate-900">
            Simple et transparent
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-500">
            Pas de frais cachés. Pas d&apos;engagement. Paiement par virement bancaire.
          </p>
        </div>

        {/* Cards */}
        <div className="mx-auto mt-14 grid max-w-3xl gap-6 md:grid-cols-2">
          {/* Essentiel */}
          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="mb-6">
              <h3 className="text-[15px] font-semibold text-slate-900">Essentiel</h3>
              <p className="mt-0.5 text-[13px] text-slate-500">Rappels RDV + suivi paiements</p>
            </div>
            <div className="mb-6 flex items-baseline">
              <span className="text-[40px] font-extrabold tracking-tight text-slate-900">300</span>
              <span className="ml-1.5 text-[14px] font-medium text-slate-400">MAD/mois</span>
            </div>
            <ul className="mb-7 space-y-2.5">
              <Feature>Rappels WhatsApp J-1 et H-2</Feature>
              <Feature>Confirmation patient WhatsApp</Feature>
              <Feature>Gestion des rendez-vous</Feature>
              <Feature>Suivi des paiements</Feature>
              <Feature>Relances automatiques impayés</Feature>
              <Feature>Dashboard en temps réel</Feature>
            </ul>
            <a
              href="https://wa.me/212600000000?text=Je%20souhaite%20souscrire%20au%20plan%20Essentiel%20Medgenii"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-slate-200 bg-white text-[13px] font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300"
            >
              Commencer
            </a>
          </div>

          {/* Pro */}
          <div className="relative rounded-2xl border-2 border-violet-600 bg-white p-7 shadow-lg shadow-violet-600/5">
            <div className="absolute -top-3 right-6">
              <span className="inline-flex rounded-full bg-violet-600 px-3 py-0.5 text-[11px] font-bold text-white">
                Populaire
              </span>
            </div>
            <div className="mb-6">
              <h3 className="text-[15px] font-semibold text-slate-900">Pro</h3>
              <p className="mt-0.5 text-[13px] text-slate-500">Tout Essentiel + briques IA</p>
            </div>
            <div className="mb-6 flex items-baseline">
              <span className="text-[40px] font-extrabold tracking-tight text-slate-900">500</span>
              <span className="ml-1.5 text-[14px] font-medium text-slate-400">MAD/mois</span>
            </div>
            <ul className="mb-7 space-y-2.5">
              <Feature accent>Tout le plan Essentiel</Feature>
              <Feature accent>Taux de confirmation en temps réel</Feature>
              <Feature accent>Statistiques avancées</Feature>
              <Feature accent>Multi-spécialités</Feature>
              <Feature accent>Support prioritaire WhatsApp</Feature>
              <Feature soon>Transcription vocale</Feature>
              <Feature soon>Résumé IA consultation</Feature>
            </ul>
            <a
              href="https://wa.me/212600000000?text=Je%20souhaite%20souscrire%20au%20plan%20Pro%20Medgenii"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-violet-600 text-[13px] font-semibold text-white shadow-md shadow-violet-600/20 transition-all hover:bg-violet-700 hover:shadow-lg"
            >
              Souscrire au Pro
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>

        {/* Trust */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-6 text-[12px] font-medium text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            Conforme CNDP
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            Données hébergées en UE
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            Paiement par virement
          </span>
        </div>
      </main>
    </div>
  )
}

function Feature({ children, accent, soon }: { children: React.ReactNode; accent?: boolean; soon?: boolean }) {
  return (
    <li className="flex items-start gap-2.5">
      {soon ? (
        <Clock className="mt-0.5 size-4 shrink-0 text-slate-300" />
      ) : (
        <Check className={`mt-0.5 size-4 shrink-0 ${accent ? "text-violet-600" : "text-slate-400"}`} />
      )}
      <span className={`text-[13px] ${soon ? "text-slate-400" : "text-slate-600"}`}>
        {children}
        {soon && (
          <span className="ml-1.5 inline-flex rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
            Bientôt
          </span>
        )}
      </span>
    </li>
  )
}
