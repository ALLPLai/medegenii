"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ZelligePattern } from "@/components/zellige-pattern"

export function LandingFooter() {
  return (
    <footer className="relative overflow-hidden bg-[#0C0F1D]">
      <div className="divider-gold mx-auto max-w-6xl px-6" />

      {/* CTA section */}
      <section className="relative py-24 md:py-32">
        <ZelligePattern opacity={0.04} />
        {/* Gold center glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F5A623]/5 blur-[100px]" />

        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[#F5A623]">
            Prêt ?
          </p>
          <h2 className="font-heading text-[clamp(2rem,5vw,3.8rem)] font-light leading-tight text-[#E8DED0]">
            Transformez votre cabinet <em className="italic text-[#F5A623]">dès aujourd&apos;hui</em>
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[#8A9BB0]">
            Essai gratuit. Aucune carte bancaire. Démarrage en 3 minutes.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/login"
              className="group inline-flex h-12 items-center gap-2 rounded-xl bg-[#F5A623] px-7 text-[15px] font-semibold text-[#0C0F1D] shadow-xl shadow-[#F5A623]/20 transition-all hover:bg-[#FFC554] hover:shadow-[#F5A623]/30"
            >
              Commencer gratuitement
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="mailto:contact@medgenii.app"
              className="inline-flex h-12 items-center rounded-xl border border-[#F5A623]/20 px-7 text-[15px] font-medium text-[#E8DED0] transition-all hover:border-[#F5A623]/40 hover:bg-[#F5A623]/5"
            >
              Parler à l&apos;équipe
            </a>
          </div>
        </div>
      </section>

      {/* Bottom bar */}
      <div className="border-t border-[rgba(245,166,35,0.10)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-6 md:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[#F5A623]/30 bg-[#F5A623]/10">
              <span className="font-heading text-[13px] font-bold italic text-[#F5A623]">M</span>
            </div>
            <span className="font-heading text-[15px] font-semibold tracking-wide text-[#E8DED0]">Medgenii</span>
          </div>

          <div className="flex items-center gap-6">
            {[["Fonctionnalités","#features"],["Tarifs","#pricing"],["Contact","mailto:contact@medgenii.app"]].map(([label,href]) => (
              <a key={label} href={href} className="text-[12px] text-[#8A9BB0] transition-colors hover:text-[#E8DED0]">{label}</a>
            ))}
          </div>

          <p className="text-[11px] text-[#8A9BB0]">
            © {new Date().getFullYear()} Medgenii &middot; Conforme CNDP &middot; Données UE
          </p>
        </div>
      </div>
    </footer>
  )
}
