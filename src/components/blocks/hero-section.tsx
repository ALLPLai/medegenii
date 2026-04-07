"use client"

import Link from "next/link"
import { Logo } from "@/components/logo"
import { ArrowRight, ChevronRight } from "lucide-react"

export function HeroSection() {
  return (
    <>
      {/* Hero wraps nav so gradient flows behind it */}
      <section className="relative overflow-hidden">
        {/* Background gradient — covers nav + hero */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-violet-50 via-violet-50/40 to-white" />
          <div className="absolute right-0 top-0 h-[600px] w-[600px] -translate-y-1/4 translate-x-1/4 rounded-full bg-gradient-to-br from-violet-200/50 to-blue-200/30 blur-3xl" />
          <div className="absolute left-0 top-1/3 h-[400px] w-[400px] -translate-x-1/3 rounded-full bg-gradient-to-br from-cyan-200/30 to-emerald-200/20 blur-3xl" />
        </div>

        {/* Nav — transparent, blends with hero gradient */}
        <header className="relative z-50">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2">
                <Logo size={28} />
                <span className="text-[15px] font-bold text-slate-900">Medgenii</span>
              </Link>
              <nav className="hidden items-center gap-5 md:flex">
                <a href="#features" className="text-[13px] font-medium text-slate-500 transition-colors hover:text-slate-900">
                  Fonctionnalités
                </a>
                <Link href="/pricing" className="text-[13px] font-medium text-slate-500 transition-colors hover:text-slate-900">
                  Tarifs
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden text-[13px] font-medium text-slate-500 transition-colors hover:text-slate-900 sm:block"
              >
                Se connecter
              </Link>
              <Link
                href="/login"
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-violet-600 px-3.5 text-[13px] font-medium text-white shadow-sm shadow-violet-600/20 transition-colors hover:bg-violet-700"
              >
                Commencer
                <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-6 pb-20 pt-20 md:pb-28 md:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="hero-appear mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200/60 bg-violet-50 px-3 py-1 text-[12px] font-semibold text-violet-700">
              <span className="flex size-1.5 rounded-full bg-violet-500" />
              Nouveau — Disponible au Maroc
              <ChevronRight className="size-3 text-violet-400" />
            </div>

            {/* Headline */}
            <h1 className="hero-appear delay-100 text-[clamp(2.25rem,5.5vw,4rem)] font-extrabold leading-[1.08] tracking-[-0.035em] text-slate-900">
              Votre cabinet,
              <br />
              <span className="bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
                sans les no-shows.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="hero-appear delay-200 mx-auto mt-5 max-w-lg text-[16px] leading-relaxed text-slate-500">
              Rappels WhatsApp automatiques, confirmation en un clic,
              relance des impayés. L&apos;infrastructure invisible de votre cabinet.
            </p>

            {/* CTAs */}
            <div className="hero-appear delay-300 mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/login"
                className="group inline-flex h-11 items-center gap-2 rounded-xl bg-violet-600 px-5 text-[14px] font-semibold text-white shadow-md shadow-violet-600/20 transition-all hover:bg-violet-700 hover:shadow-lg hover:shadow-violet-600/25"
              >
                Essayer gratuitement
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-[14px] font-medium text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50"
              >
                Voir les tarifs
              </Link>
            </div>

            {/* Social proof */}
            <div className="hero-appear delay-400 mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[13px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-600">50%</span> moins de no-shows
              </span>
              <span className="hidden h-3 w-px bg-slate-200 sm:block" />
              <span className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-600">2 min</span> pour démarrer
              </span>
              <span className="hidden h-3 w-px bg-slate-200 sm:block" />
              <span className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-600">0 MAD</span> pour essayer
              </span>
            </div>
          </div>

          {/* Dashboard mockup */}
          <div className="hero-appear-zoom delay-500 mx-auto mt-16 max-w-5xl">
            <div className="relative rounded-xl border border-slate-200/80 bg-white shadow-[0_4px_40px_rgba(0,0,0,0.06)] ring-1 ring-slate-900/[0.04]">
              {/* Browser bar */}
              <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-2.5">
                <div className="flex gap-1.5">
                  <div className="size-2.5 rounded-full bg-slate-200" />
                  <div className="size-2.5 rounded-full bg-slate-200" />
                  <div className="size-2.5 rounded-full bg-slate-200" />
                </div>
                <div className="mx-auto flex h-6 w-64 items-center justify-center rounded-md bg-slate-50 px-3 text-[11px] font-medium text-slate-400">
                  medgenii.app/dashboard
                </div>
              </div>

              {/* Dashboard content */}
              <div className="p-5 md:p-6">
                {/* Header */}
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <div className="text-[14px] font-semibold text-slate-800">Bonjour, Dr Amrani</div>
                    <div className="text-[12px] text-slate-400">Lundi 7 avril 2026 &middot; Médecine Générale</div>
                  </div>
                  <div className="hidden rounded-lg bg-violet-600 px-3 py-1.5 text-[12px] font-medium text-white sm:block">
                    + Nouveau RDV
                  </div>
                </div>

                {/* KPI cards */}
                <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                  <KPICard label="RDV aujourd'hui" value="8" badge="+2" color="violet" />
                  <KPICard label="Taux confirmation" value="87%" badge="+12%" color="emerald" />
                  <KPICard label="Impayés" value="2 400 MAD" color="rose" />
                  <KPICard label="Payé ce mois" value="18 600" suffix="MAD" badge="+8%" color="blue" />
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-lg border border-slate-100">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/60">
                        <th className="px-3 py-2.5 text-left font-medium text-slate-500">Patient</th>
                        <th className="px-3 py-2.5 text-left font-medium text-slate-500">Heure</th>
                        <th className="px-3 py-2.5 text-left font-medium text-slate-500">Statut</th>
                        <th className="px-3 py-2.5 text-left font-medium text-slate-500">Paiement</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: "Fatima Benali", time: "09:00", status: "Confirmé", sc: "emerald", pay: "Payé", pc: "emerald" },
                        { name: "Ahmed Khalil", time: "09:30", status: "En attente", sc: "amber", pay: "—", pc: "slate" },
                        { name: "Nadia Moussaoui", time: "10:00", status: "Confirmé", sc: "emerald", pay: "Impayé", pc: "rose" },
                        { name: "Youssef Alami", time: "10:30", status: "En attente", sc: "amber", pay: "Payé", pc: "emerald" },
                        { name: "Khadija Tazi", time: "11:00", status: "Confirmé", sc: "emerald", pay: "Payé", pc: "emerald" },
                      ].map((r) => (
                        <tr key={r.name} className="border-b border-slate-50 last:border-0">
                          <td className="px-3 py-2.5 font-medium text-slate-700">{r.name}</td>
                          <td className="px-3 py-2.5 text-slate-500">{r.time}</td>
                          <td className="px-3 py-2.5"><Pill color={r.sc}>{r.status}</Pill></td>
                          <td className="px-3 py-2.5"><Pill color={r.pc}>{r.pay}</Pill></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function KPICard({ label, value, suffix, badge, color }: {
  label: string; value: string; suffix?: string; badge?: string; color: string
}) {
  const accent: Record<string, string> = {
    violet: "text-violet-600",
    emerald: "text-emerald-600",
    rose: "text-rose-500",
    blue: "text-blue-600",
  }
  const badgeBg: Record<string, string> = {
    violet: "bg-violet-50 text-violet-600",
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
  }
  return (
    <div className="rounded-lg border border-slate-100 bg-white p-3">
      <div className="text-[11px] font-medium text-slate-400">{label}</div>
      <div className="mt-1.5 flex items-baseline gap-1.5">
        <span className={`text-[18px] font-bold tracking-tight ${accent[color] ?? "text-slate-800"}`}>
          {value}
        </span>
        {suffix && <span className="text-[11px] text-slate-400">{suffix}</span>}
        {badge && (
          <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${badgeBg[color] ?? "bg-slate-50 text-slate-500"}`}>
            {badge}
          </span>
        )}
      </div>
    </div>
  )
}

function Pill({ children, color }: { children: React.ReactNode; color: string }) {
  const styles: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-600",
    slate: "bg-slate-50 text-slate-400",
  }
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${styles[color] ?? styles.slate}`}>
      {children}
    </span>
  )
}
