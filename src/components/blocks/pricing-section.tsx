"use client"

import { useEffect, useRef } from "react"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Essentiel",
    price: "399",
    period: "MAD/mois",
    badge: "Actif",
    badgeColor: "gold",
    highlight: false,
    desc: "Pour démarrer et réduire vos no-shows dès la première semaine.",
    features: [
      "Rappels WhatsApp texte + audio darija",
      "H‑18 (template) + H‑2 + post-consultation",
      "Gestion rendez-vous & patients",
      "Dashboard taux de no-show",
      "500 patients actifs / mois",
      "1 médecin + 1 secrétaire",
    ],
    cta: "Commencer gratuitement",
    ctaHref: "/login",
  },
  {
    name: "Pro",
    price: "799",
    period: "MAD/mois",
    badge: "Bientôt",
    badgeColor: "muted",
    highlight: true,
    desc: "Pour les cabinets qui veulent aussi simplifier la facturation CNSS.",
    features: [
      "Tout Essentiel inclus",
      "FSE CNSS pré-remplie (PDF)",
      "Codes actes NGAP + tarifs CNSS",
      "Statistiques avancées (revenus, actes)",
      "1 500 patients actifs / mois",
      "Multi-secrétaires",
    ],
    cta: "Rejoindre la liste d'attente",
    ctaHref: "mailto:contact@medgenii.app",
  },
  {
    name: "Clinique",
    price: "Sur devis",
    period: "",
    badge: "Bientôt",
    badgeColor: "muted",
    highlight: false,
    desc: "Pour les polycliniques et groupements de médecins.",
    features: [
      "Tout Pro inclus",
      "Multi-praticiens illimités",
      "Dashboard consolidé multi-sites",
      "Reporting par spécialité",
      "Intégration API CNSS",
      "Support prioritaire dédié",
    ],
    cta: "Nous contacter",
    ctaHref: "mailto:contact@medgenii.app",
  },
]

export function PricingSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const els = sectionRef.current?.querySelectorAll(".sr-hidden")
    if (!els?.length) return
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("sr-visible")
            obs.unobserve(e.target)
          }
        }),
      { threshold: 0.08 }
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <section
      id="pricing"
      ref={sectionRef}
      className="relative overflow-hidden bg-[#0F0B06] py-28 md:py-36"
    >
      {/* Top divider */}
      <div className="divider-gold mx-auto mb-20 max-w-6xl px-6" />

      {/* Spotlight for Pro */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          width: 500,
          height: 500,
          background: "radial-gradient(circle, rgba(240,160,32,0.07) 0%, transparent 65%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="sr-hidden mx-auto mb-16 max-w-xl text-center">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#F0A020]">Tarifs</p>
          <h2
            className="font-heading font-light leading-tight text-[#F2E9D6]"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3.2rem)" }}
          >
            Simple.{" "}
            <em className="italic text-[#F0A020]">Transparent.</em>
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[#9A8C74]">
            Pas d&apos;engagement, pas de frais cachés. Commencez gratuitement.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-5 md:grid-cols-3 md:items-start">
          {plans.map(({ name, price, period, badge, badgeColor, highlight, desc, features, cta, ctaHref }, i) => (
            <div
              key={name}
              className={`sr-hidden relative flex flex-col rounded-3xl p-8 transition-all duration-300 ${
                highlight
                  ? "hover:-translate-y-1"
                  : "hover:-translate-y-0.5"
              }`}
              style={{
                background: highlight
                  ? "linear-gradient(160deg, rgba(240,160,32,0.1) 0%, rgba(28,18,8,0.97) 50%)"
                  : "rgba(30,20,9,0.75)",
                border: highlight
                  ? "1px solid rgba(240,160,32,0.45)"
                  : "1px solid rgba(240,160,32,0.12)",
                boxShadow: highlight
                  ? "0 0 60px rgba(240,160,32,0.1), 0 30px 80px rgba(0,0,0,0.4)"
                  : "none",
                transitionDelay: `${i * 100}ms`,
              }}
            >
              {/* Glow for Pro */}
              {highlight && (
                <>
                  <div
                    className="pointer-events-none absolute inset-0 animate-glow-pulse rounded-3xl"
                    style={{ border: "1px solid rgba(240,160,32,0.3)" }}
                  />
                  <div
                    className="pointer-events-none absolute -inset-px rounded-3xl opacity-50"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(240,160,32,0.12) 0%, transparent 50%, rgba(240,160,32,0.06) 100%)",
                    }}
                  />
                </>
              )}

              {/* Header row */}
              <div className="relative mb-6 flex items-center justify-between">
                <h3 className="font-heading text-[1.3rem] font-semibold text-[#F2E9D6]">{name}</h3>
                <span
                  className={`rounded-full px-3 py-0.5 text-[11px] font-bold ${
                    badgeColor === "gold"
                      ? "bg-[#F0A020]/15 text-[#F0A020]"
                      : "bg-white/5 text-[#9A8C74]"
                  }`}
                >
                  {badge}
                </span>
              </div>

              {/* Price */}
              <div className="relative mb-4">
                {period ? (
                  <div className="flex items-end gap-2">
                    <span
                      className="font-heading font-light leading-none text-[#F2E9D6]"
                      style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)" }}
                    >
                      {price}
                    </span>
                    <span className="mb-1.5 text-[13px] text-[#9A8C74]">{period}</span>
                  </div>
                ) : (
                  <span className="font-heading text-[2rem] font-light text-[#F2E9D6]">{price}</span>
                )}
              </div>

              <p className="relative mb-6 text-[13.5px] leading-relaxed text-[#9A8C74]">{desc}</p>

              {/* Divider */}
              <div className="divider-gold relative mb-6" />

              {/* Features */}
              <ul className="relative mb-8 flex-1 space-y-3">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13.5px] text-[#9A8C74]">
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-[#F0A020]"
                    />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={ctaHref}
                className={`group relative inline-flex h-11 items-center justify-center gap-2 rounded-xl text-[14px] font-semibold transition-all duration-200 ${
                  highlight
                    ? "bg-[#F0A020] text-[#0F0B06] shadow-lg shadow-[#F0A020]/20 hover:bg-[#FFB830] hover:shadow-[#F0A020]/35 hover:-translate-y-px"
                    : "border border-[#F0A020]/25 text-[#F0A020] hover:bg-[#F0A020]/8 hover:border-[#F0A020]/50"
                }`}
              >
                {cta}
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p className="sr-hidden mt-10 text-center text-[13px] text-[#9A8C74]">
          Pas d&apos;engagement annuel · Annulation à tout moment ·{" "}
          <a href="mailto:contact@medgenii.app" className="text-[#F0A020]/70 transition-colors hover:text-[#F0A020]">
            contact@medgenii.app
          </a>
        </p>
      </div>
    </section>
  )
}
