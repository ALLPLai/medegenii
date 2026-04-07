# Stack technique détaillée — Medegenii

## Frontend

- Next.js 16.x (App Router) — Turbopack par défaut, React 19.2
- Tailwind CSS 4.x
- shadcn/ui (CLI v4, mars 2026) — commande : `npx shadcn@latest init`
- Pas de CSS-in-JS, pas de styled-components

## Auth

- Supabase Auth avec magic link email
- Pas de mot de passe — les médecins se connectent par email
- Session gérée par middleware Supabase (`src/lib/supabase/middleware.ts`)

## Base de données

- Supabase Postgres en région EU (eu-west-1 Dublin ou eu-central-1 Frankfurt)
- RLS obligatoire sur toutes les tables contenant des données patient
- Pas de service_role key côté client — uniquement dans les Server Actions

## WhatsApp

- Meta Cloud API directe (gratuit côté infra, frais Meta par message uniquement)
- Maroc classé "Rest of Africa" dans le pricing Meta
- Messages utility gratuits dans une fenêtre de service client (24h)
- Messages non-template gratuits dans CSW
- Messages template (rappels RDV) : ~$0.026/message (Rest of Africa rate, avril 2026)
- n8n utilise le nœud natif "WhatsApp Business Cloud"
- Depuis juillet 2025 : pricing per-message (pas par conversation)

## Paiement

| Phase | Solution | Frais | Intégration |
|-------|----------|-------|-------------|
| Phase 1 (0-10 médecins) | Virement bancaire + facture PDF via WhatsApp | 0% | Aucune |
| Phase 2 (10-30 médecins) | Polar.sh (MoR) ou Dodo Payments | 5% par transaction | API/webhook, intégrable via n8n |
| Phase 3 (30+ médecins) | Payzone (CMI marocain) | ~2.5% | Freelance (~3000 MAD) |

Stripe ne fonctionne PAS au Maroc sans entité étrangère.

## Orchestration

- n8n Cloud plan Starter : $24/mois, 2 500 exécutions/mois
- Estimation pour 20-30 médecins (10 patients/jour) : 200-600 exec/jour
- Passage au plan Pro ($50/mois, 10 000 exec) à prévoir dès 15+ médecins actifs
- L'app Next.js communique avec n8n via webhooks uniquement

## IA (Phase 2+)

| Couche | Phase 1-2 (cloud) | Phase 3+ (local/souverain) |
|--------|-------------------|---------------------------|
| STT | Groq Whisper Large v3 Turbo (~$7/mois) | Gemma 4 E4B ou Whisper.cpp |
| LLM | Gemini 3.1 Flash-Lite (~$2/mois) | Gemma 4 12B MoE via Ollama |
| TTS | Gemini 2.5 Flash (~$25/mois) | Piper TTS (FR + AR, open-source) |
| Embedding | Gemini Embedding | pgvector + Gemini Embedding |
| Imagerie | MedGemma 1.5 via Vertex AI | MedGemma 1.5 local |

## Hébergement

- Vercel (plan gratuit puis Pro $20/mois)
- Domaine : medegenii.app (possédé)

## Coût mensuel total estimé

| Phase | Composants | Coût approx. |
|-------|-----------|-------------|
| Phase 1 | Vercel free + Supabase free + n8n Starter + Meta WhatsApp | ~$30-50 |
| Phase 2 | + Groq + Gemini Flash-Lite | ~$60-80 |
| Phase 3 | + Gemini TTS + DrugBank | ~$120-150 |
