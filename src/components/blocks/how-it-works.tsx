"use client"

import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { CalendarPlus, MessageCircle, TrendingUp } from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

const steps = [
  {
    icon: CalendarPlus,
    number: "01",
    title: "RDV créé dans le dashboard",
    desc: "Ajoutez un rendez-vous depuis l'app. Le patient est automatiquement enregistré dans la file de rappels.",
  },
  {
    icon: MessageCircle,
    number: "02",
    title: "WhatsApp H-18 + H-2 automatiques",
    desc: "À H-18 : message texte + audio darija. À H-2 : rappel court. Tout dans la fenêtre 24h Meta — gratuit.",
  },
  {
    icon: TrendingUp,
    number: "03",
    title: "Agenda plein, no-shows réduits",
    desc: "Le patient confirme (1) ou reporte (2). Le dashboard se met à jour. Vos consultations sont honorées.",
  },
]

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    gsap.from(".step-card", {
      opacity: 0,
      y: 40,
      duration: 0.7,
      stagger: 0.18,
      ease: "power3.out",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 75%",
      },
    })
    gsap.from(".hiw-title", {
      opacity: 0,
      y: 24,
      duration: 0.6,
      ease: "power2.out",
      scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
    })
  }, { scope: sectionRef })

  return (
    <section id="how-it-works" ref={sectionRef} className="relative overflow-hidden bg-[#0C0F1D] py-24 md:py-32">
      {/* Divider top */}
      <div className="divider-gold mx-auto mb-16 max-w-6xl px-6" />

      <div className="mx-auto max-w-6xl px-6">
        <div className="hiw-title mx-auto mb-16 max-w-xl text-center">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#F5A623]">
            Comment ça marche
          </p>
          <h2 className="font-heading text-[clamp(2rem,4.5vw,3.2rem)] font-light leading-tight text-[#E8DED0]">
            Simple comme envoyer un <em className="italic text-[#F5A623]">WhatsApp</em>
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map(({ icon: Icon, number, title, desc }, i) => (
            <div key={number} className="step-card group relative overflow-hidden rounded-2xl border border-[rgba(245,166,35,0.14)] bg-[#111827] p-8 transition-all hover:border-[#F5A623]/30 hover:bg-[#141b2d]">
              {/* Number watermark */}
              <div className="pointer-events-none absolute -right-3 -top-4 font-heading text-[7rem] font-bold leading-none text-[#F5A623]/5 select-none">
                {number}
              </div>

              {/* Connector arrow (except last) */}
              {i < steps.length - 1 && (
                <div className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 md:block">
                  <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#F5A623]/30">
                    <path fill="currentColor" d="M9.4 18L8 16.6l4.6-4.6L8 7.4 9.4 6l6 6-6 6z" />
                  </svg>
                </div>
              )}

              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-[#F5A623]/20 bg-[#F5A623]/8">
                <Icon className="h-5 w-5 text-[#F5A623]" />
              </div>

              <h3 className="mb-2.5 font-heading text-[1.25rem] font-semibold leading-snug text-[#E8DED0]">
                {title}
              </h3>
              <p className="text-[14px] leading-relaxed text-[#8A9BB0]">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
