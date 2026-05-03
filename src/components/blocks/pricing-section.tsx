"use client"

import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import Link from "next/link"

gsap.registerPlugin(ScrollTrigger)

const plans = [
  {
    name: "Essentiel",
    price: "399",
    period: "MAD/mois",
    badge: "Actif",
    highlight: false,
    desc: "Pour démarrer et réduire vos no-shows dès la première semaine.",
    features: [
      "Rappels WhatsApp texte + audio darija",
      "H-18 (template) + H-2 + post-consultation",
      "Gestion rendez-vous & patients",
      "Dashboard taux de no-show",
      "500 patients actifs / mois",
      "1 médecin + 1 secrétaire",
    ],
    cta: "Commencer",
    ctaHref: "/login",
  },
  {
    name: "Pro",
    price: "799",
    period: "MAD/mois",
    badge: "Bientôt",
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

  useGSAP(() => {
    gsap.from(".price-card", {
      opacity: 0,
      y: 40,
      duration: 0.7,
      stagger: 0.15,
      ease: "power3.out",
      scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
    })
    gsap.from(".pricing-title", {
      opacity: 0,
      y: 24,
      duration: 0.6,
      scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
    })
  }, { scope: sectionRef })

  return (
    <section id="pricing" ref={sectionRef} className="relative bg-[#0C0F1D] py-24 md:py-32">
      <div className="divider-gold mx-auto mb-16 max-w-6xl px-6" />

      <div className="mx-auto max-w-6xl px-6">
        <div className="pricing-title mx-auto mb-16 max-w-xl text-center">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#F5A623]">Tarifs</p>
          <h2 className="font-heading text-[clamp(2rem,4.5vw,3.2rem)] font-light leading-tight text-[#E8DED0]">
            Simple. <em className="italic text-[#F5A623]">Transparent.</em>
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[#8A9BB0]">
            Pas d&apos;engagement, pas de frais cachés. Commencez gratuitement.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map(({ name, price, period, badge, highlight, desc, features, cta, ctaHref }) => (
            <div
              key={name}
              className={`price-card relative flex flex-col rounded-2xl p-8 transition-all ${
                highlight
                  ? "border border-[#F5A623]/50 bg-gradient-to-b from-[#1A1A0E] to-[#111827] shadow-[0_0_60px_rgba(245,166,35,0.10)]"
                  : "border border-[rgba(245,166,35,0.14)] bg-[#111827] hover:border-[#F5A623]/30"
              }`}
            >
              {/* Badge */}
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-heading text-[1.3rem] font-semibold text-[#E8DED0]">{name}</h3>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                  badge === "Actif"
                    ? "bg-[#F5A623]/15 text-[#F5A623]"
                    : "bg-white/5 text-[#8A9BB0]"
                }`}>
                  {badge}
                </span>
              </div>

              {/* Price */}
              <div className="mb-4">
                {period ? (
                  <div className="flex items-end gap-1.5">
                    <span className="font-heading text-[3rem] font-light leading-none text-[#E8DED0]">{price}</span>
                    <span className="mb-1 text-[13px] text-[#8A9BB0]">{period}</span>
                  </div>
                ) : (
                  <span className="font-heading text-[2rem] font-light text-[#E8DED0]">{price}</span>
                )}
              </div>

              <p className="mb-6 text-[13.5px] leading-relaxed text-[#8A9BB0]">{desc}</p>

              {/* Divider */}
              <div className="divider-gold mb-6" />

              {/* Features */}
              <ul className="mb-8 flex-1 space-y-3">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13.5px] text-[#8A9BB0]">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#F5A623]" />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={ctaHref}
                className={`group inline-flex h-11 items-center justify-center gap-2 rounded-xl text-[14px] font-semibold transition-all ${
                  highlight
                    ? "bg-[#F5A623] text-[#0C0F1D] shadow-lg shadow-[#F5A623]/20 hover:bg-[#FFC554]"
                    : "border border-[#F5A623]/30 text-[#F5A623] hover:bg-[#F5A623]/8"
                }`}
              >
                {cta}
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
