# Conformité CNDP — Medegenii

## Cadre légal

- Loi 09-08 : données de santé = données sensibles au Maroc
- Délibération D-941-2025 (publiée 28/11/2025) : modèle d'autorisation simplifié pour le suivi patient (RDV, suivi, diagnostic, télémédecine)
- La CNDP est l'équivalent marocain de la CNIL

## Actions obligatoires AVANT mise en production

1. Créer une identité numérique sur sante.cndp.ma
2. Remplir le formulaire D-941-2025
3. Imprimer, signer, envoyer à conf-secteur-sante@cndp.ma
4. Demander l'autorisation de transfert international vers l'UE (pour Supabase EU)
5. Rédiger une politique de confidentialité FR + AR accessible depuis l'app
6. Implémenter le mécanisme de consentement patient dans l'app

## Consentement patient

Consentement EXPLICITE obligatoire avant tout envoi WhatsApp.
Écran de consentement dans l'app avec horodatage stocké dans la table `patient_consents`.

Types de consentement :
- `whatsapp_reminder` : rappels RDV
- `whatsapp_vocal` : messages vocaux post-consultation (Phase 3)
- `data_processing` : traitement des données médicales
- `transcription` : enregistrement et transcription audio (Phase 2)

Le patient peut révoquer à tout moment (champ `revoked_at`).
Avant tout envoi WhatsApp, vérifier :

```sql
SELECT EXISTS (
  SELECT 1 FROM patient_consents
  WHERE patient_id = $1
  AND consent_type = $2
  AND revoked_at IS NULL
)
```

## Table patient_consents (migration 00004)

```sql
CREATE TABLE patient_consents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE NOT NULL,
  consent_type TEXT NOT NULL
    CHECK (consent_type IN ('whatsapp_reminder','whatsapp_vocal','data_processing','transcription')),
  consented_at TIMESTAMPTZ DEFAULT now(),
  ip_address INET,
  revoked_at TIMESTAMPTZ
);

ALTER TABLE patient_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "consents_own_doctor" ON patient_consents
  FOR ALL USING (doctor_id = auth.uid());

CREATE INDEX idx_consents_patient ON patient_consents(patient_id);
CREATE INDEX idx_consents_type ON patient_consents(consent_type);
```

## Table audit_log (migration 00005)

```sql
CREATE TABLE audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID REFERENCES doctors(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_own_doctor" ON audit_log
  FOR ALL USING (doctor_id = auth.uid());

CREATE INDEX idx_audit_doctor ON audit_log(doctor_id);
CREATE INDEX idx_audit_created ON audit_log(created_at);
```

## Hébergement et souveraineté

| Phase | Hébergement | Conformité |
|-------|-------------|------------|
| Phase 1-2 | Supabase EU (eu-west-1 ou eu-central-1) | Autorisation CNDP + transfert UE |
| Phase 3 (50+ médecins) | Inwi Cloud HDS + Supabase self-hosted | Données 100% Maroc |

Pays adéquats selon la CNDP : France, UE, UK, Canada, Suisse. USA NON inclus dans la liste des pays adéquats.

## Architecture zero-leak (Phase 3 locale)

- Données identifiables (nom, téléphone, diagnostic) : traitement LOCAL uniquement via Gemma 4 + Ollama
- Scripts vocaux anonymisés : peuvent transiter par cloud TTS si nécessaire
- Variable d'environnement : `AI_PROVIDER=local|cloud`
- Supabase self-hosted sur Inwi Cloud HDS pour données 100% Maroc

## Règles pour le code

- JAMAIS de données patient dans les logs applicatifs
- JAMAIS de données patient dans les messages d'erreur
- Logger uniquement des IDs (doctor_id, patient_id, appointment_id)
- Toute action sur une donnée patient doit être tracée dans audit_log
- Le consentement doit être vérifié AVANT tout envoi WhatsApp
