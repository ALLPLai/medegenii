import { Bell, CalendarCheck, CreditCard, MessageCircle, Shield, Smartphone } from "lucide-react"

const features = [
  {
    icon: Bell,
    title: "Rappels automatiques",
    description: "WhatsApp J-1 à 20h et H-2 avant le RDV. Le patient n'oublie plus jamais.",
    color: "text-violet-600 bg-violet-50",
  },
  {
    icon: MessageCircle,
    title: "Confirmation instantanée",
    description: "Le patient répond 1 ou 2. Le tableau se met à jour en temps réel.",
    color: "text-blue-600 bg-blue-50",
  },
  {
    icon: CalendarCheck,
    title: "Vue temps réel",
    description: "RDV, confirmations, taux, impayés — tout sur un seul écran.",
    color: "text-cyan-600 bg-cyan-50",
  },
  {
    icon: CreditCard,
    title: "Relance des impayés",
    description: "Relances automatiques à J+3 et J+7. Vos honoraires sans courir après.",
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    icon: Smartphone,
    title: "Mobile-first",
    description: "Consultez et gérez entre deux patients, depuis votre téléphone.",
    color: "text-amber-600 bg-amber-50",
  },
  {
    icon: Shield,
    title: "Conforme CNDP",
    description: "Consentement tracé, données en UE, audit complet. Loi 09-08.",
    color: "text-rose-600 bg-rose-50",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="bg-gradient-to-b from-white to-white py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-violet-600">
            Fonctionnalités
          </p>
          <h2 className="mt-3 text-[clamp(1.5rem,3.5vw,2.25rem)] font-extrabold leading-tight tracking-[-0.02em] text-slate-900">
            L&apos;essentiel, sans le superflu
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-500">
            Chaque fonctionnalité résout un problème concret du cabinet médical marocain.
          </p>
        </div>

        {/* Feature grid */}
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm transition-all hover:border-slate-200 hover:shadow-md"
            >
              <div className={`mb-4 inline-flex size-10 items-center justify-center rounded-xl ${feature.color}`}>
                <feature.icon className="size-5" />
              </div>
              <h3 className="mb-1.5 text-[15px] font-semibold text-slate-900">
                {feature.title}
              </h3>
              <p className="text-[13px] leading-relaxed text-slate-500">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
