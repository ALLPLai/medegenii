import Link from "next/link"
import { Logo } from "@/components/logo"
import { ArrowRight } from "lucide-react"

export function LandingFooter() {
  return (
    <footer className="relative overflow-hidden">
      {/* Same gradient style as hero */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-t from-violet-50 via-violet-50/40 to-white" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] translate-y-1/4 -translate-x-1/4 rounded-full bg-gradient-to-br from-violet-200/50 to-blue-200/30 blur-3xl" />
        <div className="absolute bottom-1/4 right-0 h-[400px] w-[400px] translate-x-1/3 rounded-full bg-gradient-to-br from-cyan-200/30 to-emerald-200/20 blur-3xl" />
      </div>

      {/* CTA section */}
      <section className="relative py-20 md:py-28">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-[clamp(1.5rem,4vw,2.25rem)] font-extrabold leading-tight tracking-[-0.02em] text-slate-900">
            Prêt à transformer votre cabinet ?
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-500">
            Essai gratuit. Aucune carte bancaire. Démarrage en 2 minutes.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/login"
              className="group inline-flex h-11 items-center gap-2 rounded-xl bg-violet-600 px-5 text-[14px] font-semibold text-white shadow-md shadow-violet-600/20 transition-all hover:bg-violet-700 hover:shadow-lg hover:shadow-violet-600/25"
            >
              Commencer maintenant
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-[14px] font-medium text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50"
            >
              Voir les tarifs
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom bar */}
      <div className="relative border-t border-slate-200/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-6 md:flex-row">
          <div className="flex items-center gap-2">
            <Logo size={22} />
            <span className="text-[13px] font-semibold text-slate-900">Medgenii</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="text-[12px] font-medium text-slate-500 transition-colors hover:text-slate-900">
              Tarifs
            </Link>
            <a href="mailto:contact@medgenii.app" className="text-[12px] font-medium text-slate-500 transition-colors hover:text-slate-900">
              Contact
            </a>
          </div>
          <p className="text-[11px] text-slate-400">
            &copy; {new Date().getFullYear()} Medgenii &middot; Conforme CNDP &middot; Données UE
          </p>
        </div>
      </div>
    </footer>
  )
}
