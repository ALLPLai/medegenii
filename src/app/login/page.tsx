import { LoginForm } from "./login-form"
import { Logo } from "@/components/logo"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Connexion — Medgenii",
}

const features = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
    ),
    title: "Anti no-show",
    description: "Rappels automatiques J-1 et H-2 par WhatsApp",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="1" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
    ),
    title: "Relance paiement",
    description: "Recouvrement automatique des impayés",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    ),
    title: "Gestion patients",
    description: "Dossiers, rendez-vous et historique centralisés",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
    ),
    title: "WhatsApp natif",
    description: "Communication directe avec vos patients",
  },
]

export default function LoginPage() {
  return (
    <main className="flex min-h-screen">
      {/* Left panel - Branding */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-900 p-12 lg:flex">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-violet-950 to-blue-950" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Glow accent */}
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute -right-16 top-1/4 h-56 w-56 rounded-full bg-blue-400/5 blur-3xl" />

        {/* Top: Logo + title */}
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <Logo size={48} />
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Medgenii
              </h1>
              <p className="text-sm font-medium text-violet-400">
                Assistant medical intelligent
              </p>
            </div>
          </div>

          <div className="mt-16">
            <h2 className="text-3xl font-semibold leading-tight text-white">
              Votre cabinet,
              <br />
              <span className="text-violet-400">sans les no-shows.</span>
            </h2>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-slate-400">
              La plateforme qui automatise les rappels, relance les impayés et
              libère votre temps pour vos patients.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="relative z-10 space-y-5">
          {features.map((feature) => (
            <div key={feature.title} className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/80 text-violet-400">
                {feature.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {feature.title}
                </p>
                <p className="text-sm text-slate-400">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom: trust line */}
        <div className="relative z-10">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
          <p className="mt-4 text-xs text-slate-500">
            Conforme CNDP (Loi 09-08) &middot; Données hébergées en UE
            &middot; Chiffrement de bout en bout
          </p>
        </div>
      </div>

      {/* Right panel - Login form */}
      <div className="flex w-full flex-col items-center justify-center bg-muted/40 px-6 py-12 lg:w-1/2">
        {/* Mobile-only condensed branding */}
        <div className="mb-10 flex flex-col items-center gap-3 lg:hidden">
          <Logo size={48} />
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">Medgenii</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Votre cabinet, sans les no-shows.
            </p>
          </div>
          {/* Mobile feature pills */}
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {features.map((feature) => (
              <span
                key={feature.title}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
              >
                <span className="text-violet-500">{feature.icon}</span>
                {feature.title}
              </span>
            ))}
          </div>
        </div>

        <div className="w-full max-w-md">
          <LoginForm />
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground lg:hidden">
          Conforme CNDP &middot; Données UE &middot; Chiffrement E2E
        </p>
      </div>
    </main>
  )
}
