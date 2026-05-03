"use client"

import { useRef } from "react"
import Link from "next/link"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { ZelligePattern } from "@/components/zellige-pattern"

gsap.registerPlugin(useGSAP, ScrollTrigger)

function WaBubble({
  text,
  time,
  type = "received",
  hasAudio = false,
}: {
  text: string
  time: string
  type?: "received" | "sent"
  hasAudio?: boolean
}) {
  return (
    <div className={`wa-bubble flex gap-2 ${type === "sent" ? "flex-row-reverse" : ""}`}
      style={{ opacity: 0, transform: "translateY(12px)" }}>
      <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[12px] leading-relaxed shadow-sm ${
        type === "received" ? "rounded-tl-sm bg-[#1E2A1E] text-[#E2FFE2]" : "rounded-tr-sm bg-[#005C4B] text-[#E2FFE2]"
      }`}>
        {hasAudio && (
          <div className="mb-1.5 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F5A623]">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-black">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
              </svg>
            </div>
            <div className="flex-1 space-y-0.5">
              <div className="h-1.5 w-24 rounded-full bg-[#F5A623]/40" />
              <div className="h-1 w-16 rounded-full bg-[#F5A623]/20" />
            </div>
            <span className="text-[10px] text-[#8B9B8B]">0:12</span>
          </div>
        )}
        <p>{text}</p>
        <div className={`mt-0.5 flex items-center gap-1 ${type === "sent" ? "justify-end" : ""}`}>
          <span className="text-[10px] text-[#8B9B8B]">{time}</span>
          {type === "sent" && (
            <svg viewBox="0 0 24 24" className="h-3 w-3 fill-[#53BDEB]">
              <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z" />
            </svg>
          )}
        </div>
      </div>
    </div>
  )
}

function WhatsAppMockup() {
  const ref = useRef<HTMLDivElement>(null)
  useGSAP(() => {
    const bubbles = ref.current?.querySelectorAll(".wa-bubble")
    if (!bubbles) return
    gsap.to(Array.from(bubbles), { opacity: 1, y: 0, duration: 0.5, stagger: 0.35, ease: "power2.out", delay: 1.2 })
  }, { scope: ref })

  return (
    <div ref={ref} className="relative w-full max-w-[300px] overflow-hidden rounded-2xl border border-white/10 bg-[#0B1409] shadow-2xl" style={{ opacity: 0 }}>
      <div className="flex items-center gap-3 border-b border-white/5 bg-[#1F2C24] px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5A623]/20 text-[13px] font-semibold text-[#F5A623]">M</div>
        <div>
          <p className="text-[13px] font-medium text-white">Medgenii</p>
          <p className="text-[11px] text-[#8B9B8B]">Cabinet Dr. Alami</p>
        </div>
      </div>
      <div className="space-y-3 p-4">
        <WaBubble text="Bonjour Mme Benali, rappel : votre RDV est demain à 10h30 avec Dr. Alami. Répondez 1 pour confirmer." time="20:00" hasAudio />
        <WaBubble text="1" time="20:14" type="sent" />
        <WaBubble text="✅ Confirmé. À demain à 10h30 !" time="20:14" />
        <WaBubble text="Rappel : votre RDV dans 2h. Bonne journée !" time="08:30" />
      </div>
      <div className="flex items-center gap-2 px-4 pb-4">
        <div className="flex gap-1">
          {[0, 0.15, 0.3].map((d, i) => (
            <div key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#8B9B8B]" style={{ animationDelay: `${d}s` }} />
          ))}
        </div>
        <span className="text-[11px] text-[#8B9B8B]">en ligne</span>
      </div>
    </div>
  )
}

export function HeroSection() {
  const containerRef = useRef<HTMLElement>(null)
  const mockupRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } })
    tl.from(".hero-badge",  { opacity: 0, y: 20, duration: 0.6 })
      .from(".hero-h1 .line", { opacity: 0, y: 40, duration: 0.7, stagger: 0.12 }, "-=0.2")
      .from(".hero-sub",   { opacity: 0, y: 20, duration: 0.6 }, "-=0.3")
      .from(".hero-cta",   { opacity: 0, y: 16, duration: 0.5, stagger: 0.1 }, "-=0.3")
      .from(".hero-stats .stat-item", { opacity: 0, y: 20, duration: 0.5, stagger: 0.1 }, "-=0.2")
    if (mockupRef.current) {
      tl.to(mockupRef.current, { opacity: 1, duration: 0.6 }, "-=0.8")
    }
    gsap.to(".zellige-drift", { rotate: 3, scale: 1.04, duration: 30, ease: "none", repeat: -1, yoyo: true })
  }, { scope: containerRef })

  return (
    <section ref={containerRef} className="relative min-h-screen overflow-hidden bg-[#0C0F1D]">
      <div className="zellige-drift absolute inset-0"><ZelligePattern opacity={0.05} /></div>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-[#F5A623]/6 blur-[120px]" />
        <div className="absolute -right-40 top-1/3 h-[400px] w-[400px] rounded-full bg-[#1A2744]/80 blur-[80px]" />
      </div>

      {/* Nav */}
      <header className="relative z-50">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#F5A623]/30 bg-[#F5A623]/10">
              <span className="font-heading text-[15px] font-bold italic text-[#F5A623]">M</span>
            </div>
            <span className="font-heading text-[17px] font-semibold tracking-wide text-[#E8DED0]">Medgenii</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {[["Fonctionnalités","#features"],["Tarifs","#pricing"],["Contact","mailto:contact@medgenii.app"]].map(([label, href]) => (
              <a key={label} href={href} className="text-[13px] font-medium text-[#8A9BB0] transition-colors hover:text-[#E8DED0]">{label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden text-[13px] font-medium text-[#8A9BB0] transition-colors hover:text-[#E8DED0] sm:block">Se connecter</Link>
            <Link href="/login" className="group inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#F5A623]/40 bg-[#F5A623]/10 px-4 text-[13px] font-semibold text-[#F5A623] transition-all hover:bg-[#F5A623]/20 hover:border-[#F5A623]/60">
              Commencer<ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-16 md:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_auto]">
          <div className="max-w-2xl">
            <div className="hero-badge mb-8 inline-flex items-center gap-2 rounded-full border border-[#F5A623]/25 bg-[#F5A623]/8 px-4 py-1.5">
              <span className="flex h-1.5 w-1.5 rounded-full bg-[#F5A623]" />
              <span className="text-[12px] font-semibold tracking-wide text-[#F5A623]">Anti no-show WhatsApp + audio darija</span>
            </div>

            <h1 className="hero-h1 font-heading text-[clamp(3rem,7vw,5.5rem)] font-light leading-[1.05] tracking-[-0.02em] text-[#E8DED0]">
              <span className="line block">Fini les</span>
              <span className="line block italic text-[#F5A623]" style={{ textShadow: "0 0 60px rgba(245,166,35,0.3)" }}>rendez-vous</span>
              <span className="line block">manqués.</span>
            </h1>

            <p className="hero-sub mt-6 max-w-lg text-[16px] leading-relaxed text-[#8A9BB0]">
              Medgenii envoie automatiquement des rappels WhatsApp + audio darija à vos patients. Moins de no-shows, plus de consultations honorées.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login" className="hero-cta group inline-flex h-11 items-center gap-2 rounded-xl bg-[#F5A623] px-6 text-[14px] font-semibold text-[#0C0F1D] shadow-lg shadow-[#F5A623]/20 transition-all hover:bg-[#FFC554] hover:shadow-[#F5A623]/30">
                Démarrer gratuitement<ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a href="#how-it-works" className="hero-cta inline-flex h-11 items-center gap-2 rounded-xl border border-[#F5A623]/20 px-6 text-[14px] font-medium text-[#E8DED0] transition-all hover:border-[#F5A623]/40 hover:bg-[#F5A623]/5">
                Voir comment ça marche
              </a>
            </div>

            <div className="hero-cta mt-5 flex flex-wrap items-center gap-4">
              {["Essai gratuit", "Conforme CNDP", "Données UE"].map((t) => (
                <div key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-[#F5A623]" />
                  <span className="text-[12px] text-[#8A9BB0]">{t}</span>
                </div>
              ))}
            </div>

            <div className="hero-stats mt-12 grid grid-cols-3 gap-4 border-t border-[rgba(245,166,35,0.12)] pt-8">
              {[["37%","no-shows en moins"],["3 min","de setup"],["399 MAD","par mois"]].map(([value,label]) => (
                <div key={label} className="stat-item">
                  <p className="font-heading text-[clamp(1.6rem,3vw,2.4rem)] font-semibold leading-none text-[#F5A623]" style={{ textShadow: "0 0 30px rgba(245,166,35,0.25)" }}>{value}</p>
                  <p className="mt-1.5 text-[12px] leading-snug text-[#8A9BB0]">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div ref={mockupRef} className="hidden lg:flex lg:items-center lg:justify-center" style={{ opacity: 0 }}>
            <div className="relative">
              <div className="absolute inset-0 -z-10 scale-125 rounded-3xl bg-[#F5A623]/8 blur-[40px]" />
              <WhatsAppMockup />
              <div className="absolute -bottom-4 -left-8 rounded-xl border border-[#F5A623]/20 bg-[#111827]/90 px-4 py-2.5 shadow-xl backdrop-blur-sm">
                <p className="text-[11px] text-[#8A9BB0]">Taux de confirmation</p>
                <p className="font-heading text-[22px] font-semibold text-[#F5A623]">+63%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0C0F1D] to-transparent" />
    </section>
  )
}
