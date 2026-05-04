"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle2, TrendingUp } from "lucide-react"
import { ZelligePattern } from "@/components/zellige-pattern"

/* ── Counter hook ──────────────────────────────────────────────────────────── */
function useCountUp(target: number, duration = 1600) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry?.isIntersecting) return
        obs.disconnect()
        let start: number | null = null
        const step = (ts: number) => {
          if (!start) start = ts
          const p = Math.min((ts - start) / duration, 1)
          const ease = 1 - Math.pow(1 - p, 3)
          setCount(Math.round(ease * target))
          if (p < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
      },
      { threshold: 0.5 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [target, duration])

  return { count, ref }
}

/* ── Scroll-reveal hook ─────────────────────────────────────────────────────── */
function useScrollReveal() {
  const containerRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const els = containerRef.current?.querySelectorAll(".sr-hidden")
    if (!els?.length) return
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("sr-visible"); obs.unobserve(e.target) } }),
      { threshold: 0.12 }
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])
  return containerRef
}

/* ── Phone mockup ───────────────────────────────────────────────────────────── */
function PhoneMockup() {
  return (
    <div
      className="animate-float-phone relative mx-auto select-none"
      style={{ width: 268, filter: "drop-shadow(0 50px 80px rgba(0,0,0,0.6)) drop-shadow(0 0 50px rgba(245,166,35,0.12))" }}
    >
      {/* Ambient glow behind */}
      <div
        className="absolute -inset-8 -z-10 rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(ellipse at 50% 60%, #F5A623 0%, transparent 65%)" }}
      />

      {/* Outer frame */}
      <div
        className="overflow-hidden rounded-[44px]"
        style={{
          background: "linear-gradient(160deg, #2A2D3E 0%, #1A1C2A 100%)",
          padding: 7,
          boxShadow: "0 0 0 1px rgba(255,255,255,0.07), inset 0 1px 0 rgba(255,255,255,0.09)",
        }}
      >
        {/* Screen bezel */}
        <div className="overflow-hidden rounded-[38px] bg-[#0B1409]">
          {/* Status bar */}
          <div className="relative flex items-center justify-between bg-[#111B10] px-5 py-2.5">
            <span className="text-[10px] font-semibold text-white/50">9:41</span>
            {/* Dynamic island */}
            <div
              className="absolute left-1/2 top-0 -translate-x-1/2 rounded-b-2xl bg-[#0A0C18]"
              style={{ width: 110, height: 28 }}
            />
            <div className="flex items-center gap-1 text-white/50">
              {/* Signal bars */}
              <svg viewBox="0 0 17 12" className="h-3 w-3 fill-current">
                <rect x="0" y="5" width="3" height="7" rx="0.5" />
                <rect x="4.5" y="3" width="3" height="9" rx="0.5" />
                <rect x="9" y="1" width="3" height="11" rx="0.5" />
                <rect x="13.5" y="0" width="3" height="12" rx="0.5" opacity="0.3" />
              </svg>
              {/* Battery */}
              <svg viewBox="0 0 25 12" className="h-3 w-4 fill-current">
                <rect x="0" y="1" width="21" height="10" rx="2" opacity="0.35" />
                <rect x="1" y="2" width="17" height="8" rx="1.5" />
                <rect x="22" y="4" width="2" height="4" rx="1" opacity="0.4" />
              </svg>
            </div>
          </div>

          {/* WA header */}
          <div className="flex items-center gap-3 border-b border-white/5 bg-[#1F2C24] px-4 py-2.5">
            <div className="relative shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5A623]/20">
                <span className="font-heading text-[14px] font-bold italic text-[#F5A623]">M</span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#1F2C24] bg-emerald-400" />
            </div>
            <div>
              <p className="text-[12px] font-semibold text-white">Medgenii</p>
              <p className="text-[10px] text-emerald-400">en ligne</p>
            </div>
            <svg viewBox="0 0 24 24" className="ml-auto h-4 w-4 fill-white/30">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
            </svg>
          </div>

          {/* Messages */}
          <div className="space-y-2.5 bg-[#0B1409] p-3.5">
            {/* Received – audio */}
            <div
              className="max-w-[88%] rounded-2xl rounded-tl-sm bg-[#1E2A1E] p-3"
              style={{ animation: "wa-appear 0.5s 0.2s cubic-bezier(0.16,1,0.3,1) both" }}
            >
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F5A623]">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-[#0C0F1D]">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                  </svg>
                </div>
                <div className="flex flex-1 items-end gap-px">
                  {[3,5,4,7,5,8,4,6,5,7,4,6,5,4,3,5,6].map((h, i) => (
                    <div key={i} className="rounded-full bg-[#F5A623]/50 transition-all" style={{ width: 2, height: h * 2 }} />
                  ))}
                  <span className="ml-2 shrink-0 text-[9px] text-white/30">0:14</span>
                </div>
              </div>
              <p className="text-[10.5px] leading-relaxed text-[#D4F7D4]">
                Bonjour Mme Benali 👋 rappel : votre RDV est{" "}
                <strong className="text-white">demain à 10h30</strong> avec Dr. Alami.<br />
                Répondez <strong className="text-[#F5A623]">1</strong> pour confirmer,{" "}
                <strong className="text-[#F5A623]">2</strong> pour reporter.
              </p>
              <p className="mt-1 text-right text-[9px] text-white/20">20:00</p>
            </div>

            {/* Sent */}
            <div
              className="flex justify-end"
              style={{ animation: "wa-appear 0.5s 0.9s cubic-bezier(0.16,1,0.3,1) both" }}
            >
              <div className="rounded-2xl rounded-tr-sm bg-[#005C4B] px-3.5 py-2">
                <p className="text-[13px] font-bold text-white">1</p>
                <div className="flex items-center justify-end gap-1">
                  <span className="text-[9px] text-white/30">20:14</span>
                  <svg viewBox="0 0 24 24" className="h-3 w-3 fill-[#53BDEB]">
                    <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Confirmed */}
            <div
              className="max-w-[75%] rounded-2xl rounded-tl-sm bg-[#1E2A1E] px-3 py-2"
              style={{ animation: "wa-appear 0.5s 1.5s cubic-bezier(0.16,1,0.3,1) both" }}
            >
              <p className="text-[10.5px] text-[#D4F7D4]">✅ Confirmé ! À demain 😊</p>
              <p className="mt-0.5 text-right text-[9px] text-white/20">20:14</p>
            </div>

            {/* H-2 */}
            <div
              className="max-w-[80%] rounded-2xl rounded-tl-sm bg-[#1E2A1E] px-3 py-2"
              style={{ animation: "wa-appear 0.5s 2.1s cubic-bezier(0.16,1,0.3,1) both" }}
            >
              <p className="text-[10.5px] text-[#D4F7D4]">⏰ Votre RDV dans <strong className="text-white">2h</strong>. Bonne journée !</p>
              <p className="mt-0.5 text-right text-[9px] text-white/20">08:30</p>
            </div>
          </div>

          {/* Input bar */}
          <div className="flex items-center gap-2 bg-[#1A2419] px-3 py-2">
            <div className="flex-1 rounded-full bg-[#243024] px-3 py-1.5 text-[10px] text-white/20">
              Message…
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#00A884]">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-white">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </div>
          </div>

          {/* Home bar */}
          <div className="flex justify-center bg-[#1A2419] pb-2 pt-1.5">
            <div className="h-1 w-24 rounded-full bg-white/15" />
          </div>
        </div>
      </div>

      {/* Floating card — taux confirmation */}
      <div
        className="absolute -left-14 bottom-24 rounded-2xl border border-[#F5A623]/20 bg-[#0E1420]/95 px-4 py-3 shadow-2xl backdrop-blur-sm"
        style={{ animation: "float-card 4.5s ease-in-out infinite" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F5A623]/15">
            <TrendingUp className="h-4 w-4 text-[#F5A623]" />
          </div>
          <div>
            <p className="text-[10px] text-[#8A9BB0]">Taux confirmation</p>
            <p className="font-heading text-[22px] font-semibold leading-none text-[#F5A623]">+63%</p>
          </div>
        </div>
      </div>

      {/* Floating card — no-show */}
      <div
        className="absolute -right-10 top-24 rounded-2xl border border-emerald-500/20 bg-[#0E1420]/95 px-3.5 py-2.5 shadow-2xl backdrop-blur-sm"
        style={{ animation: "float-card 5s ease-in-out infinite 1.2s" }}
      >
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <div>
            <p className="text-[9px] text-[#8A9BB0]">No-shows</p>
            <p className="text-[14px] font-bold text-emerald-400">−37%</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Hero section ───────────────────────────────────────────────────────────── */
export function HeroSection() {
  const { count: c1, ref: r1 } = useCountUp(37)
  const { count: c2, ref: r2 } = useCountUp(3)
  const { count: c3, ref: r3 } = useCountUp(399)

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#0C0F1D]">
      {/* ── Animated gradient blobs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute rounded-full"
          style={{
            top: "-10%", left: "5%",
            width: 700, height: 700,
            background: "radial-gradient(circle, rgba(245,166,35,0.09) 0%, transparent 70%)",
            animation: "blob-drift-1 20s ease-in-out infinite",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            bottom: "0%", right: "-5%",
            width: 600, height: 600,
            background: "radial-gradient(circle, rgba(26,65,138,0.12) 0%, transparent 70%)",
            animation: "blob-drift-2 26s ease-in-out infinite",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            top: "40%", left: "35%",
            width: 500, height: 500,
            background: "radial-gradient(circle, rgba(74,26,106,0.07) 0%, transparent 70%)",
            animation: "blob-drift-3 32s ease-in-out infinite",
          }}
        />
      </div>

      {/* Zellige pattern */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <ZelligePattern opacity={0.04} />
      </div>

      {/* Grain overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          backgroundSize: "180px",
        }}
      />

      {/* ── Nav ── */}
      <header className="reveal reveal-d0 relative z-50">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#F5A623]/40 bg-[#F5A623]/10 transition-all group-hover:bg-[#F5A623]/20">
              <span className="font-heading text-[15px] font-bold italic text-[#F5A623]">M</span>
            </div>
            <span className="font-heading text-[17px] font-semibold tracking-wide text-[#E8DED0]">Medgenii</span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {[
              ["Fonctionnalités", "#features"],
              ["Comment ça marche", "#how-it-works"],
              ["Tarifs", "#pricing"],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="text-[13px] font-medium text-[#8A9BB0] transition-colors hover:text-[#E8DED0]"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-[13px] font-medium text-[#8A9BB0] transition-colors hover:text-[#E8DED0] sm:block"
            >
              Se connecter
            </Link>
            <Link
              href="/login"
              className="group inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#F5A623] px-4 text-[13px] font-semibold text-[#0C0F1D] transition-all hover:bg-[#FFC554] hover:-translate-y-px hover:shadow-lg hover:shadow-[#F5A623]/25"
            >
              Commencer
              <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-12 md:pt-16">
        <div className="grid items-center gap-16 lg:grid-cols-[1fr_300px]">

          {/* Left — text */}
          <div>
            {/* Badge */}
            <div className="reveal reveal-d1 mb-8 inline-flex items-center gap-2.5 rounded-full border border-[#F5A623]/25 bg-[#F5A623]/8 px-4 py-1.5">
              <span className="animate-pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-[#F5A623]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#F5A623]">
                Rappels WhatsApp + audio darija
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-heading font-light leading-[1.0] tracking-[-0.02em]"
                style={{ fontSize: "clamp(3.6rem, 8.5vw, 7rem)" }}>
              <span
                className="block text-[#E8DED0]"
                style={{ animation: "slide-up-blur 0.8s 0.1s cubic-bezier(0.16,1,0.3,1) both" }}
              >
                Fini les
              </span>
              <span
                className="shimmer-gold block font-semibold italic"
                style={{ animation: "slide-up-blur 0.8s 0.22s cubic-bezier(0.16,1,0.3,1) both" }}
              >
                rendez-vous
              </span>
              <span
                className="block text-[#E8DED0]"
                style={{ animation: "slide-up-blur 0.8s 0.34s cubic-bezier(0.16,1,0.3,1) both" }}
              >
                manqués.
              </span>
            </h1>

            {/* Sub */}
            <p
              className="mt-6 max-w-[490px] text-[16px] leading-[1.75] text-[#8A9BB0]"
              style={{ animation: "slide-up-blur 0.8s 0.5s cubic-bezier(0.16,1,0.3,1) both" }}
            >
              Medgenii envoie automatiquement des rappels WhatsApp texte&nbsp;+&nbsp;audio
              darija à vos patients. Ils confirment en un message.
              Votre agenda reste plein, sans effort.
            </p>

            {/* CTAs */}
            <div
              className="mt-8 flex flex-wrap items-center gap-3"
              style={{ animation: "slide-up-blur 0.8s 0.64s cubic-bezier(0.16,1,0.3,1) both" }}
            >
              <Link
                href="/login"
                className="group inline-flex h-12 items-center gap-2 rounded-xl bg-[#F5A623] px-7 text-[15px] font-semibold text-[#0C0F1D] shadow-xl shadow-[#F5A623]/20 transition-all hover:bg-[#FFC554] hover:-translate-y-0.5 hover:shadow-[#F5A623]/35"
              >
                Démarrer gratuitement
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-[rgba(245,166,35,0.22)] px-7 text-[15px] font-medium text-[#E8DED0] transition-all hover:border-[rgba(245,166,35,0.5)] hover:bg-[#F5A623]/5 hover:-translate-y-0.5"
              >
                Voir comment ça marche
              </a>
            </div>

            {/* Trust badges */}
            <div
              className="mt-5 flex flex-wrap items-center gap-5"
              style={{ animation: "slide-up-blur 0.8s 0.76s cubic-bezier(0.16,1,0.3,1) both" }}
            >
              {["Essai gratuit · aucune CB", "Conforme CNDP Maroc", "Données hébergées UE"].map((t) => (
                <div key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-[#F5A623]" />
                  <span className="text-[12px] text-[#8A9BB0]">{t}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div
              className="mt-12 grid grid-cols-3 gap-4 border-t pt-8"
              style={{
                borderColor: "rgba(245,166,35,0.1)",
                animation: "slide-up-blur 0.8s 0.9s cubic-bezier(0.16,1,0.3,1) both",
              }}
            >
              {[
                { refObj: r1, value: c1, suffix: "%", label: "de no-shows\nen moins" },
                { refObj: r2, value: c2, suffix: " min", label: "de setup\npour démarrer" },
                { refObj: r3, value: c3, suffix: "", label: "MAD / mois\ntout inclus" },
              ].map(({ refObj, value, suffix, label }) => (
                <div key={label}>
                  <p
                    ref={refObj as React.RefObject<HTMLParagraphElement>}
                    className="font-heading font-semibold leading-none text-[#F5A623]"
                    style={{
                      fontSize: "clamp(2rem, 3.5vw, 3rem)",
                      textShadow: "0 0 30px rgba(245,166,35,0.25)",
                    }}
                  >
                    {value}{suffix}
                  </p>
                  <p className="mt-2 whitespace-pre-line text-[12px] leading-snug text-[#8A9BB0]">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — phone */}
          <div
            className="hidden lg:flex lg:items-center lg:justify-center"
            style={{ animation: "slide-up-blur 1s 0.4s cubic-bezier(0.16,1,0.3,1) both" }}
          >
            <PhoneMockup />
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0C0F1D] to-transparent" />
    </section>
  )
}
