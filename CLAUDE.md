# CLAUDE.md — Medegenii

> SaaS médical pour médecins généralistes au Maroc.
> Phase 1 : anti no-show + relance paiement via WhatsApp.
> Phase 2+ : briques IA (transcription, résumé, vocal patient, copilote diagnostic).

## Stack

- Frontend : Next.js 16.x (App Router, Turbopack) + TypeScript strict + Tailwind CSS + shadcn/ui (CLI v4)
- Auth : Supabase Auth (magic link)
- Base de données : Supabase Postgres (région **eu-west-1** ou **eu-central-1** — OBLIGATOIRE)
- Stockage : Supabase Storage (même région EU)
- Orchestration : n8n Cloud (plan Starter $24/mois, 2 500 exec)
- WhatsApp : Meta Cloud API directe (nœud natif n8n) — pas 360dialog
- Paiement Phase 1 : virement bancaire + facture PDF
- Paiement Phase 2 : Polar.sh (MoR) ou Dodo Payments
- Hébergement : Vercel
- Package manager : **pnpm** uniquement
- Node.js : **20+** requis

## Références détaillées

@docs/stack-details.md
@docs/n8n-workflows.md
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
│   ├── n8n-workflows.md
│   ├── compliance-cndp.md
│   ├── roadmap-bricks.md
│   └── supabase-schema.md
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

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
WHATSAPP_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_VERIFY_TOKEN=
N8N_WEBHOOK_BASE_URL=
GROQ_API_KEY=
GEMINI_API_KEY=
POLAR_ACCESS_TOKEN=
POLAR_WEBHOOK_SECRET=
AI_PROVIDER=cloud
OLLAMA_BASE_URL=http://localhost:11434
LOCAL_MODEL=gemma4:12b
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

Implémente uniquement Brick 0 (appointments) et Brick 1 (billing). Utilise le skill planning-with-files pour créer un plan avant de coder. Consulte @docs/supabase-schema.md pour les migrations. Consulte @docs/n8n-workflows.md pour la logique WhatsApp. NE CRÉE PAS de code pour les briques Phase 2+. Montre-moi le plan avant de coder.
