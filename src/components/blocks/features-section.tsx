"use client"

import { useEffect, useRef } from "react"
import { Bell, CalendarCheck, CreditCard, MessageCircle, Shield, Smartphone } from "lucide-react"
import { ZelligePattern } from "@/components/zellige-pattern"

const normalFeatures = [
  {
    icon: MessageCircle,
    title: "Confirmation instantanée",
    desc: "Le patient répond 1 ou 2. Le tableau se met à jour en temps réel sans aucune action.",
  },
  {
    icon: CalendarCheck,
    title: "Vue temps réel",
    desc: "RDV, confirmations, taux de no-show, impayés — tout sur un écran épuré.",
  },
  {
    icon: CreditCard,
    title: "Relance des impayés",
    desc: "Relances automatiques J+3 et J+7. Vos honoraires rentrés sans courir après les patients.",
  },
  {
    icon: Smartphone,
    title: "Mobile-first",
    desc: "Consultez et gérez votre agenda entre deux patients, depuis votre téléphone.",
  },
]

export function FeaturesSection() {
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
      id="features"
      ref={sectionRef}
      className="relative overflow-hidden bg-[#090C18] py-28 md:py-36"
    >
      <ZelligePattern opacity={0.025} />

      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          width: 700,
          height: 700,
          background: "radial-gradient(circle, rgba(245,166,35,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="sr-hidden mx-auto mb-16 max-w-xl text-center">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#F5A623]">
            Fonctionnalités
          </p>
          <h2
            className="font-heading font-light leading-tight text-[#E8DED0]"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3.2rem)" }}
          >
            L&apos;essentiel,{" "}
            <em className="italic text-[#F5A623]">sans le superflu</em>
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[#8A9BB0]">
            Chaque fonctionnalité résout un problème concret du cabinet médical marocain.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid auto-rows-auto gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {/* Large feature 1 — Rappels (tall card) */}
          <div
            className="sr-hidden group relative overflow-hidden rounded-3xl p-8 transition-all duration-300 hover:-translate-y-0.5 sm:row-span-2"
            style={{
              background: "linear-gradient(160deg, rgba(245,166,35,0.09) 0%, rgba(13,18,33,0.95) 55%)",
              border: "1px solid rgba(245,166,35,0.2)",
            }}
          >
            <div
              className="pointer-events-none absolute -left-12 -top-12 h-48 w-48 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
              style={{ background: "radial-gradient(circle, rgba(245,166,35,0.15) 0%, transparent 70%)" }}
            />
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#F5A623]/30 bg-[#F5A623]/12 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(245,166,35,0.2)]">
              <Bell className="h-5 w-5 text-[#F5A623]" />
            </div>
            <h3 className="mb-3 font-heading text-[1.4rem] font-semibold text-[#E8DED0]">
              Rappels H‑18 + H‑2
            </h3>
            <p className="mb-7 text-[14px] leading-relaxed text-[#8A9BB0]">
              WhatsApp texte + audio darija automatique. Le patient n&apos;oublie plus jamais son RDV.
            </p>

            {/* Mini WA preview inside card */}
            <div
              className="overflow-hidden rounded-2xl p-4"
              style={{ background: "rgba(11,20,9,0.8)", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-wider text-[#8A9BB0]">
                Aperçu WhatsApp
              </p>
              <div className="space-y-2">
                {[
                  { text: "Rappel : RDV demain 10h30 avec Dr. Alami 📅", dir: "left", time: "H‑18" },
                  { text: "1 ✓", dir: "right", time: "" },
                  { text: "✅ Confirmé ! À demain.", dir: "left", time: "" },
                  { text: "Votre RDV dans 2h ⏰", dir: "left", time: "H‑2" },
                ].map(({ text, dir, time }, idx) => (
                  <div key={idx} className={`flex items-center gap-1.5 ${dir === "right" ? "justify-end" : ""}`}>
                    {time && <span className="text-[9px] text-white/20">{time}</span>}
                    <div
                      className={`max-w-[85%] rounded-xl px-2.5 py-1.5 text-[10.5px] ${
                        dir === "right"
                          ? "bg-[#005C4B] font-bold text-white"
                          : "bg-[#1E2A1E] text-[#D4F7D4]"
                      }`}
                    >
                      {text}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[#F5A623]/15 bg-[#F5A623]/6 px-3 py-1">
              <div className="h-1 w-1 rounded-full bg-[#F5A623]" />
              <span className="text-[11px] text-[#F5A623]/75">Ouvre la fenêtre 24h Meta</span>
            </div>
          </div>

          {/* Normal features */}
          {normalFeatures.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              className="sr-hidden group relative overflow-hidden rounded-2xl p-7 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_40px_rgba(0,0,0,0.3)]"
              style={{
                background: "rgba(17,24,39,0.75)",
                border: "1px solid rgba(245,166,35,0.1)",
                backdropFilter: "blur(10px)",
                transitionDelay: `${(i + 1) * 80}ms`,
              }}
            >
              <div
                className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: "radial-gradient(circle, rgba(245,166,35,0.08) 0%, transparent 70%)" }}
              />
              <div
                className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-[#F5A623]/20 bg-[#F5A623]/8 transition-all duration-300 group-hover:scale-110 group-hover:bg-[#F5A623]/15"
                style={{ borderColor: "rgba(245,166,35,0.2)" }}
              >
                <Icon className="h-[18px] w-[18px] text-[#F5A623]" />
              </div>
              <h3 className="mb-2 font-heading text-[1.1rem] font-semibold text-[#E8DED0]">{title}</h3>
              <p className="text-[13.5px] leading-relaxed text-[#8A9BB0]">{desc}</p>
            </div>
          ))}

          {/* Large feature 2 — CNDP compliance */}
          <div
            className="sr-hidden group relative overflow-hidden rounded-3xl p-8 transition-all duration-300 hover:-translate-y-0.5 sm:col-span-1"
            style={{
              background: "linear-gradient(160deg, rgba(26,65,138,0.1) 0%, rgba(13,18,33,0.95) 60%)",
              border: "1px solid rgba(245,166,35,0.14)",
              transitionDelay: "480ms",
            }}
          >
            <div
              className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
              style={{ background: "radial-gradient(circle, rgba(245,166,35,0.08) 0%, transparent 70%)" }}
            />
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#F5A623]/25 bg-[#F5A623]/10 transition-all duration-300 group-hover:scale-110">
              <Shield className="h-5 w-5 text-[#F5A623]" />
            </div>
            <h3 className="mb-3 font-heading text-[1.4rem] font-semibold text-[#E8DED0]">
              Conforme CNDP
            </h3>
            <p className="mb-6 text-[14px] leading-relaxed text-[#8A9BB0]">
              Consentement tracé, données hébergées en UE, audit complet. Loi 09-08 respectée.
            </p>
            <div className="flex flex-wrap gap-2">
              {["CNDP ✓", "Loi 09-08 ✓", "Données UE ✓", "Consentement tracé ✓"].map((b) => (
                <span
                  key={b}
                  className="rounded-full border border-[#F5A623]/15 bg-[#F5A623]/6 px-2.5 py-1 text-[10.5px] font-medium text-[#F5A623]/70"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
