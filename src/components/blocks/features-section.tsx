"use client"

import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Bell, CalendarCheck, CreditCard, MessageCircle, Shield, Smartphone } from "lucide-react"
import { ZelligePattern } from "@/components/zellige-pattern"

gsap.registerPlugin(ScrollTrigger)

const features = [
  { icon: Bell,          title: "Rappels H-18 + H-2",        desc: "WhatsApp texte + audio darija automatique. Le patient n'oublie plus jamais son RDV." },
  { icon: MessageCircle, title: "Confirmation instantanée",   desc: "Le patient répond 1 ou 2. Le tableau se met à jour en temps réel sans aucune action de votre part." },
  { icon: CalendarCheck, title: "Vue temps réel",             desc: "RDV, confirmations, taux de no-show, impayés — tout sur un seul écran épuré." },
  { icon: CreditCard,    title: "Relance des impayés",        desc: "Relances automatiques à J+3 et J+7. Vos honoraires rentrés sans courir après les patients." },
  { icon: Smartphone,    title: "Mobile-first",               desc: "Consultez et gérez votre agenda entre deux patients, depuis votre téléphone." },
  { icon: Shield,        title: "Conforme CNDP",              desc: "Consentement tracé, données hébergées en UE, audit complet. Loi 09-08 respectée." },
]

export function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    gsap.from(".feat-card", {
      opacity: 0,
      y: 36,
      duration: 0.65,
      stagger: { amount: 0.5, from: "start" },
      ease: "power3.out",
      scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
    })
    gsap.from(".feat-title", {
      opacity: 0,
      y: 24,
      duration: 0.6,
      scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
    })
  }, { scope: sectionRef })

  return (
    <section id="features" ref={sectionRef} className="relative overflow-hidden bg-[#0C0F1D] py-24 md:py-32">
      <ZelligePattern opacity={0.03} />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="feat-title mx-auto mb-16 max-w-xl text-center">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#F5A623]">Fonctionnalités</p>
          <h2 className="font-heading text-[clamp(2rem,4.5vw,3.2rem)] font-light leading-tight text-[#E8DED0]">
            L&apos;essentiel, <em className="italic text-[#F5A623]">sans le superflu</em>
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[#8A9BB0]">
            Chaque fonctionnalité résout un problème concret du cabinet médical marocain.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="feat-card card-zellige group rounded-2xl p-7 transition-all">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-[#F5A623]/20 bg-[#F5A623]/8 transition-colors group-hover:bg-[#F5A623]/14">
                <Icon className="h-5 w-5 text-[#F5A623]" />
              </div>
              <h3 className="mb-2 font-heading text-[1.1rem] font-semibold text-[#E8DED0]">{title}</h3>
              <p className="text-[13.5px] leading-relaxed text-[#8A9BB0]">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
