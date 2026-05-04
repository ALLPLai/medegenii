"use client"

import { useEffect, useRef } from "react"
import { CalendarPlus, MessageCircle, TrendingUp } from "lucide-react"

const steps = [
  {
    icon: CalendarPlus,
    number: "01",
    title: "RDV créé dans le dashboard",
    desc: "Ajoutez un rendez-vous depuis l'app web ou mobile. Le patient est automatiquement ajouté à la file de rappels.",
    detail: "Interface intuitive, accessible en 3 min",
  },
  {
    icon: MessageCircle,
    number: "02",
    title: "WhatsApp H‑18 + H‑2 automatiques",
    desc: "À H‑18 : message texte + audio darija. À H‑2 : rappel court gratuit. Tout dans la fenêtre 24h Meta.",
    detail: "~0,26 MAD par RDV · 100% automatique",
  },
  {
    icon: TrendingUp,
    number: "03",
    title: "Agenda plein, no-shows réduits",
    desc: "Le patient répond 1 ou 2. Le dashboard se met à jour en temps réel. Vos consultations sont honorées.",
    detail: "−37% de no-shows dès la 1ère semaine",
  },
]

export function HowItWorks() {
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
      { threshold: 0.1 }
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative overflow-hidden bg-[#0F0B06] py-28 md:py-36"
    >
      {/* Top divider */}
      <div className="divider-gold mx-auto mb-20 max-w-6xl px-6" />

      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="sr-hidden mx-auto mb-20 max-w-xl text-center">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#F0A020]">
            Comment ça marche
          </p>
          <h2
            className="font-heading font-light leading-tight text-[#F2E9D6]"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3.2rem)" }}
          >
            Simple comme envoyer un{" "}
            <em className="italic text-[#F0A020]">WhatsApp</em>
          </h2>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line (desktop) */}
          <div
            className="absolute left-0 right-0 top-[52px] hidden h-px md:block"
            style={{
              background:
                "linear-gradient(90deg, transparent 6%, rgba(240,160,32,0.15) 20%, rgba(240,160,32,0.15) 80%, transparent 94%)",
            }}
          />

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map(({ icon: Icon, number, title, desc, detail }, i) => (
              <div
                key={number}
                className="sr-hidden group relative"
                style={{ transitionDelay: `${i * 130}ms` }}
              >
                {/* Icon badge row */}
                <div className="mb-6 flex items-center gap-4">
                  <div
                    className="relative flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_24px_rgba(240,160,32,0.25)]"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(240,160,32,0.15) 0%, rgba(240,160,32,0.05) 100%)",
                      border: "1px solid rgba(240,160,32,0.3)",
                    }}
                  >
                    <Icon className="h-5 w-5 text-[#F0A020]" />
                    <span className="pointer-events-none absolute -right-1 -top-3 font-heading text-[10px] font-bold text-[#F0A020]/50">
                      {number}
                    </span>
                  </div>

                  {/* Arrow connector (desktop, not last) */}
                  {i < steps.length - 1 && (
                    <div className="hidden flex-1 items-center justify-end pr-2 md:flex">
                      <svg
                        viewBox="0 0 16 16"
                        className="h-3.5 w-3.5 text-[#F0A020]/30"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 8h11M9 4l4 4-4 4" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Card */}
                <div
                  className="relative overflow-hidden rounded-2xl p-6 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-[rgba(240,160,32,0.28)] group-hover:shadow-[0_8px_40px_rgba(0,0,0,0.3)]"
                  style={{
                    background: "rgba(30,20,9,0.75)",
                    border: "1px solid rgba(240,160,32,0.1)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  {/* Watermark number */}
                  <div
                    className="pointer-events-none absolute -right-2 -top-2 select-none font-heading text-[6rem] font-bold leading-none"
                    style={{ color: "rgba(240,160,32,0.035)" }}
                  >
                    {number}
                  </div>

                  <h3 className="mb-2.5 font-heading text-[1.2rem] font-semibold leading-snug text-[#F2E9D6]">
                    {title}
                  </h3>
                  <p className="mb-5 text-[13.5px] leading-relaxed text-[#9A8C74]">{desc}</p>

                  <div className="inline-flex items-center gap-1.5 rounded-full border border-[#F0A020]/15 bg-[#F0A020]/6 px-3 py-1">
                    <div className="h-1 w-1 rounded-full bg-[#F0A020]" />
                    <span className="text-[11px] font-medium text-[#F0A020]/75">{detail}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
