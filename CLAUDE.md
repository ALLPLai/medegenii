# CLAUDE.md — Medegenii

> SaaS médical pour médecins généralistes au Maroc.
> Phase 1 : anti no-show + relance paiement via WhatsApp.
> Phase 2+ : briques IA (transcription, résumé, vocal patient, copilote diagnostic).

## Stack

- Frontend : Next.js 16.x (App Router, Turbopack) + TypeScript strict + Tailwind CSS + shadcn/ui (CLI v4)
- Auth : Supabase Auth (magic link)
- Base de données : Supabase Postgres (région **eu-west-1** ou **eu-central-1** — OBLIGATOIRE)
- Stockage : Supabase Storage (même région EU) — bucket `audio-reminders/`
- Paiement Phase 1 : virement bancaire + facture PDF
- Paiement Phase 2 : Polar.sh (MoR) ou Dodo Payments
- Hébergement : Vercel
- Package manager : **pnpm** uniquement
- Node.js : **20+** requis

## Orchestration rappels
- Script Python `scripts/reminder_worker.py` exécuté par cron (`0 * * * *`) sur serveur 91.106.102.37
- API WhatsApp : WhatChimp (BSP officiel Meta, $12/mois lifetime, 0% markup)
- TTS : edge-tts (voix `ar-MA-MounaNeural` / `ar-MA-JamalNeural`) — gratuit
- Conversion audio : ffmpeg (MP3 → OGG/Opus pour notes vocales WhatsApp)
- Stockage audio : Supabase Storage bucket `audio-reminders/`
- L'app Next.js n'interagit PAS directement avec le worker — tout passe par Supabase

## Références détaillées

@docs/stack-details.md
@docs/whatsapp-workflows.md
@docs/compliance-cndp.md
@docs/roadmap-bricks.md
@docs/supabase-schema.md

## Commandes

```bash
pnpm dev              # Serveur dev (Turbopack)
pnpm build            # Build production
pnpm lint             # ESLint
pnpm format           # Prettier
pnpm typecheck        # tsc --noEmit
npx supabase db push  # Push migrations
npx supabase migration new <nom>  # Nouvelle migration
```

## Setup initial

```bash
npx create-next-app@latest medegenii --typescript --tailwind --app --src-dir --use-pnpm
cd medegenii
npx shadcn@latest init
npx supabase init
```

## MCP

```json
{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp?project_ref=VOTRE_REF&features=database,docs,development"
    }
  }
}
```

Sauvegarder dans `.claude/mcp.json`.

## Structure du projet

```
medegenii/
├── .claude/
│   ├── mcp.json
│   ├── commands/
│   │   ├── new-page.md
│   │   ├── new-module.md
│   │   └── db-migration.md
│   └── skills/
│       └── ok-skills/
├── .env.local
├── CLAUDE.md
├── CLAUDE.local.md
├── docs/
│   ├── stack-details.md
│   ├── whatsapp-workflows.md
│   ├── compliance-cndp.md
│   ├── roadmap-bricks.md
│   └── supabase-schema.md
├── scripts/
│   ├── reminder_worker.py    # Cron horaire — rappels WhatsApp
│   ├── requirements.txt      # Dépendances Python
│   └── .env.example          # Variables d'environnement
├── supabase/
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── login/page.tsx
│   │   └── dashboard/
│   │       ├── layout.tsx
│   │       ├── page.tsx
│   │       ├── patients/page.tsx
│   │       ├── appointments/page.tsx
│   │       ├── payments/page.tsx
│   │       └── settings/page.tsx
│   ├── modules/
│   │   ├── appointments/
│   │   │   ├── components/
│   │   │   ├── actions/
│   │   │   ├── hooks/
│   │   │   └── types.ts
│   │   ├── billing/
│   │   ├── patients/
│   │   ├── transcription/
│   │   ├── summary/
│   │   ├── vocal/
│   │   ├── drug-check/
│   │   ├── forms/
│   │   ├── patient-history/
│   │   └── imaging/
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── middleware.ts
│   │   ├── types/
│   │   │   └── shared.ts
│   │   └── utils.ts
│   └── config/
│       └── features.ts
└── tests/
```

## Règles de code

- TypeScript strict : `strict: true`, `noUncheckedIndexedAccess: true`
- Server Components par défaut. `"use client"` uniquement si interactivité.
- Tailwind uniquement, pas de CSS custom.
- Nommage : `kebab-case` fichiers, `PascalCase` composants, `camelCase` fonctions/variables.
- Textes UI en **français**.
- JAMAIS de `console.log` en production.
- JAMAIS de données patient dans les logs, messages d'erreur, ou Sentry.
- Chaque module isolé dans `/src/modules/{brick-name}/`.
- ZÉRO import croisé entre modules.
- Libs partagées dans `/src/lib/`.
- Migrations Supabase **additives uniquement**.
- Feature flags dans `/src/config/features.ts`.
- IMPORTANT : toute query Supabase DOIT passer par RLS. Pas de service_role côté client.
- IMPORTANT : région Supabase EU obligatoire. Jamais US.

## Erreurs à éviter

- NE PAS importer entre modules (`/modules/billing` ne doit JAMAIS importer depuis `/modules/appointments`)
- NE PAS modifier une migration existante — toujours créer une nouvelle migration
- NE PAS créer de Client Component sans `"use client"` explicite
- NE PAS utiliser `any` — utiliser `unknown` si type inconnu
- NE PAS installer de package sans vérifier la compatibilité Next.js 16 + React 19
- NE PAS utiliser `npm` ou `yarn` — uniquement `pnpm`
- NE PAS committer `.env.local` ou des clés API

## Pattern de référence — Server Action

```typescript
// src/modules/appointments/actions/get-appointments.ts
"use server"

import { createClient } from "@/lib/supabase/server"
import type { Appointment } from "@/modules/appointments/types"

export async function getAppointments(): Promise<Appointment[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("appointments")
    .select("*, patients(name, phone)")
    .order("date_time", { ascending: true })
  if (error) throw new Error(error.message)
  return data
}
```

## Pattern de référence — Client Component

```typescript
// src/modules/appointments/components/appointment-list.tsx
"use client"

import { useState, useEffect } from "react"
import { getAppointments } from "@/modules/appointments/actions/get-appointments"
import type { Appointment } from "@/modules/appointments/types"

export function AppointmentList() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAppointments()
      .then(setAppointments)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="animate-pulse h-32" />

  return (
    <ul>
      {appointments.map((a) => (
        <li key={a.id}>{a.patients?.name} — {new Date(a.date_time).toLocaleDateString("fr-FR")}</li>
      ))}
    </ul>
  )
}
```

## Feature flags

```typescript
// src/config/features.ts
export const FEATURES = {
  APPOINTMENTS: true,
  BILLING: true,
  TRANSCRIPTION: false,
  SUMMARY: false,
  VOCAL_PATIENT: false,
  DRUG_CHECK: false,
  FORMS_CNSS: false,
  PATIENT_HISTORY: false,
  IMAGING: false,
  LOCAL_AI: false,
} as const
```

## Variables d'environnement

App Next.js (`.env.local`) :

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GROQ_API_KEY=
GEMINI_API_KEY=
POLAR_ACCESS_TOKEN=
POLAR_WEBHOOK_SECRET=
AI_PROVIDER=cloud
OLLAMA_BASE_URL=http://localhost:11434
LOCAL_MODEL=gemma4:12b
```

Worker Python (`scripts/.env`, sur le serveur 91.106.102.37 — voir `scripts/.env.example`) :

```env
SUPABASE_URL=
SUPABASE_KEY=                # service_role (RLS bypass)
WHATCHIMP_API_KEY=
WHATCHIMP_PHONE_ID=
SUPABASE_STORAGE_BUCKET=audio-reminders
```

## Skills recommandés (ok-skills)

```bash
mkdir -p ~/.agents/skills
cd ~/.agents/skills
git clone https://github.com/mxyhi/ok-skills.git ok-skills
```

Utiliser :
- `planning-with-files` : OBLIGATOIRE avant toute tâche complexe.
- `vercel-react-best-practices` : Lors de la création de composants React ou pages Next.js.
- `frontend-skill` : Pour la landing page et les écrans dashboard.
- `context7-cli` : Consulter la doc Supabase/Next.js/shadcn avant de coder.
- `subagent-driven-development` : Pour les briques Phase 2+ (multi-étapes).

## Checklist avant commit

- [ ] Pas de changements cross-module
- [ ] `pnpm typecheck` passe
- [ ] `pnpm lint` passe
- [ ] Aucun log avec données patient
- [ ] Migrations additives uniquement
- [ ] Feature flags respectés
- [ ] UI responsive (mobile-first)
- [ ] Textes UI en français

## Commande d'implémentation

Implémente uniquement la brique anti no-show WhatsApp (texte + audio darija) — offre Essentiel à 399 MAD/mois. Utilise le skill planning-with-files pour créer un plan avant de coder. Consulte @docs/supabase-schema.md pour les migrations. Consulte @docs/whatsapp-workflows.md pour la logique du worker Python. NE CRÉE PAS de code pour les briques FSE CNSS, transcription, copilote IA, etc. Montre-moi le plan avant de coder.

## Tables Supabase

- doctors, patients, appointments, patient_consents, audit_log
- voice_templates (id, type, language, audio_url, text_template, created_at)
- reminder_logs (observabilité worker — appointment_id, reminder_type, status, whatchimp_message_id, audio_url, error_message, duration_ms)

### Colonnes notables

- `patients.language_pref` (TEXT, défaut 'fr', valeurs : `fr`/`ar`/`darija`/`amazigh`)
- `patients.consent_whatsapp` (BOOLEAN, vérifié avant chaque envoi — conformité CNDP)
- `appointments.conversation_opened_at` (TIMESTAMPTZ, optimisation fenêtre 24h Meta)
- `appointments.rappel_h18`, `rappel_h2`, `post_consultation_sent` (BOOLEAN, flags d'envoi)
- `appointments.last_error` (TEXT), `retry_count` (INTEGER, max 3)

## Pricing

### Essentiel — 399 MAD/mois par médecin ✅ ACTIVE
- Rappels WhatsApp texte + audio darija (3 messages / fenêtre 24h)
  - H-18 : texte + audio (ouvre la fenêtre Meta)
  - H-2 : texte court (gratuit, dans la fenêtre)
  - Post-consultation : satisfaction / conseil santé (gratuit, dans la fenêtre)
- Gestion rendez-vous & patients
- Dashboard taux de no-show
- Cap : 500 patients actifs / mois
- 1 médecin + 1 secrétaire par abonnement

### Pro — 799 MAD/mois par médecin 🔜 BIENTÔT
- Tout Essentiel +
- FSE CNSS pré-remplie (PDF puis télétransmission API)
- Codes actes NGAP avec tarifs CNSS intégrés
- Statistiques avancées (revenus, remboursements, actes)
- Cap : 1 500 patients actifs / mois

### Clinique — Sur devis 🔜 BIENTÔT
- Tout Pro +
- Multi-praticiens illimités
- Dashboard consolidé
- Reporting par spécialité
- Support prioritaire

## Roadmap

### Phase 1 — WhatsApp texte + audio (EN COURS)
- `reminder_worker.py` : rappels H-18, H-2, post-consultation
- edge-tts darija + fichiers audio manuels sur Supabase Storage
- WhatChimp API, optimisation fenêtre 24h
- Offre Essentiel 399 MAD/mois active

### Phase 2 — FSE CNSS (PROCHAIN)
- Tables `consultations` + `consultation_acts` + `reference_acts` dans Supabase
- Génération PDF pré-rempli (formulaire CNSS 610-1-02)
- Interface saisie actes avec codes NGAP
- Activation offre Pro 799 MAD/mois

### Phase 3 — Intégration API CNSS (EN ATTENTE SANDBOX)
- Candidature fse@cnss.ma pour accès sandbox Netopia
- Remplacement PDF par télétransmission API
- Homologation CNSS

### Phase 4 — Extensions
- Relance impayés automatique (J+3, J+7) — brique séparée
- Chatbot patient WhatsApp (confirmation / annulation)
- Offre Clinique multi-praticiens

## Coûts mensuels (pour 20 médecins, ~500 patients/médecin)

| Poste | Coût |
|---|---|
| WhatChimp (BSP Meta) | 120 MAD ($12) |
| Conversations Meta (~10 000 conv, fenêtre 24h optimisée) | ~3 000 MAD |
| Vercel (hosting Next.js) | 0 MAD (tier gratuit) |
| Supabase (DB + Storage) | 0 MAD (tier gratuit) |
| Serveur 91.106.102.37 (cron + scripts) | déjà payé |
| edge-tts + ffmpeg | 0 MAD |
| **Total** | **~3 120 MAD/mois** |
| **Revenu (20 × 399 MAD)** | **7 980 MAD/mois** |
| **Marge brute** | **~4 860 MAD/mois (61%)** |
