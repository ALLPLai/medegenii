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

- **WhatChimp API** (BSP officiel Meta, $12/mois lifetime, 0% markup sur conversations Meta)
- Maroc classé "Rest of Africa" dans le pricing Meta
- Conversations utility ouvertes : envoi libre pendant 24h (texte + audio + média)
- Conversations template (premier contact / hors fenêtre) : ~$0.026/message (Rest of Africa rate, avril 2026)
- Optimisation : ouvrir une conversation utility par jour et grouper tous les rappels dans la fenêtre 24h
- Depuis juillet 2025 : pricing per-message Meta (pas par conversation)

## Génération vocale (rappels WhatsApp)

- **edge-tts** (Microsoft TTS, gratuit, illimité)
- Voix darija : `ar-MA-MounaNeural` (féminine), `ar-MA-JamalNeural` (masculine)
- Voix française : `fr-FR-DeniseNeural`, `fr-FR-HenriNeural`
- **ffmpeg** : conversion MP3 → OGG/Opus (format requis par WhatsApp pour les notes vocales)
- **Supabase Storage** : bucket `voice-reminders` (région EU) — URL signée transmise à WhatChimp

## Orchestration des rappels

- **Script Python `reminder_worker.py`** exécuté via cron (toutes les heures) sur serveur dédié `91.106.102.37`
- Pas de service tiers (Make/n8n/Zapier) — full contrôle, zéro abonnement SaaS
- Le script lit les RDV éligibles dans Supabase, génère le vocal, l'upload, déclenche WhatChimp, marque l'envoi
- L'app Next.js ne communique PAS directement avec le script — tout passe par Supabase
- Logs centralisés dans `reminder_logs` (table Supabase) + stdout via systemd journal
- Voir `docs/whatsapp-workflows.md` pour le détail des cas et la logique de retry

## Paiement

| Phase | Solution | Frais | Intégration |
|-------|----------|-------|-------------|
| Phase 1 (0-10 médecins) | Virement bancaire + facture PDF via WhatsApp | 0% | Aucune |
| Phase 2 (10-30 médecins) | Polar.sh (MoR) ou Dodo Payments | 5% par transaction | API/webhook, intégrable au script Python |
| Phase 3 (30+ médecins) | Payzone (CMI marocain) | ~2.5% | Freelance (~3000 MAD) |

Stripe ne fonctionne PAS au Maroc sans entité étrangère.

## IA (Phase 2+)

| Couche | Phase 1-2 (cloud) | Phase 3+ (local/souverain) |
|--------|-------------------|---------------------------|
| STT | Groq Whisper Large v3 Turbo (~$7/mois) | Gemma 4 E4B ou Whisper.cpp |
| LLM | Gemini 3.1 Flash-Lite (~$2/mois) | Gemma 4 12B MoE via Ollama |
| TTS | edge-tts gratuit (déjà utilisé pour les rappels) | Piper TTS (FR + AR, open-source) |
| Embedding | Gemini Embedding | pgvector + Gemini Embedding |
| Imagerie | MedGemma 1.5 via Vertex AI | MedGemma 1.5 local |

## Hébergement

- Vercel (plan gratuit puis Pro $20/mois) — app Next.js
- Serveur dédié `91.106.102.37` — script Python `reminder_worker.py` (cron horaire)
- Domaine : medegenii.app (possédé)

## Coût mensuel total estimé — brique WhatsApp (rappels + vocal)

| Composant | Coût |
|-----------|------|
| WhatChimp BSP (lifetime) | ~$12/mois (≈ 120 MAD) |
| Meta WhatsApp templates (1 par jour par médecin pour ouvrir la fenêtre) | ~$0.78/médecin/mois (≈ 8 MAD) |
| edge-tts | $0 (gratuit) |
| ffmpeg | $0 (open-source) |
| Supabase Storage (voix < 1 Go) | $0 (free tier) |
| Serveur dédié (mutualisé avec autres clients) | ~120 MAD/mois alloués |
| **Total brique WhatsApp** | **~270 MAD/mois** pour 5-10 médecins |

## Coût mensuel total estimé — par phase

| Phase | Composants | Coût approx. |
|-------|-----------|-------------|
| Phase 1 | Vercel free + Supabase free + WhatChimp + serveur Python | ~270 MAD (~$27) |
| Phase 2 | + Groq Whisper + Gemini Flash-Lite | ~600 MAD (~$60) |
| Phase 3 | + DrugBank + volume IA | ~1300 MAD (~$130) |
