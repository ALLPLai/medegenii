# Workflows n8n — Medegenii

Tous les workflows utilisent n8n Cloud.
L'app Next.js envoie/reçoit via webhooks uniquement.
WhatsApp utilise le nœud natif "WhatsApp Business Cloud" de n8n (Meta Cloud API directe).

## Brick 0 — Rappel RDV J-1 (cron 20h00)

```
Schedule Trigger (cron: 0 20 * * *)
  → Supabase node
    Query:
      SELECT a.*, p.name as patient_name, p.phone as patient_phone, d.name as doctor_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN doctors d ON a.doctor_id = d.id
      WHERE a.date_time::date = CURRENT_DATE + INTERVAL '1 day'
        AND a.reminder_j1_sent = false
        AND a.status = 'scheduled'
  → Split In Batches (batch size: 10)
  → WhatsApp Business Cloud node
    Template name: "appointment_reminder"
    To: {{$json.patient_phone}}
    Parameters:
      - {{$json.patient_name}}
      - heure extraite de {{$json.date_time}}
      - {{$json.doctor_name}}
    Message preview:
      "Bonjour {patient}, rappel RDV demain à {heure} avec Dr {docteur}.
       Répondez 1 pour confirmer, 2 pour reporter."
  → Supabase node
    Query: UPDATE appointments SET reminder_j1_sent = true WHERE id = '{{$json.id}}'
```

## Brick 0 — Rappel RDV J-0 H-2 (cron toutes les 30 min)

```
Schedule Trigger (cron: */30 * * * *)
  → Supabase node
    Query:
      SELECT a.*, p.name, p.phone, d.name as doctor_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN doctors d ON a.doctor_id = d.id
      WHERE a.date_time BETWEEN now() + INTERVAL '1 hour 30 minutes'
                           AND now() + INTERVAL '2 hours 30 minutes'
        AND a.reminder_j0_sent = false
        AND a.status IN ('scheduled', 'confirmed')
  → Split In Batches
  → WhatsApp Business Cloud node (template rappel imminent)
  → Supabase node (UPDATE reminder_j0_sent = true)
```

## Brick 0 — Réponse patient (webhook entrant)

```
Webhook node (POST /whatsapp-inbound)
  → Extraire message.text et message.from du payload Meta
  → Switch node :
    Condition "1" :
      → Supabase (UPDATE appointments SET status = 'confirmed',
          patient_response = 'confirmed'
          WHERE patient_id = (SELECT id FROM patients WHERE phone = {{from}})
            AND date_time::date >= CURRENT_DATE
            AND status = 'scheduled')
      → WhatsApp (réponse: "Confirmé. À demain !")
    Condition "2" :
      → Supabase (UPDATE appointments SET status = 'cancelled',
          patient_response = 'cancelled' ...)
      → WhatsApp au patient ("Annulé. Contactez le cabinet pour reporter.")
      → WhatsApp au médecin ("Le patient {nom} a annulé son RDV de {heure}.")
    Default :
      → WhatsApp ("Répondez 1 pour confirmer ou 2 pour annuler.")
```

## Brick 1 — Relance paiement (cron 10h00)

```
Schedule Trigger (cron: 0 10 * * *)
  → Supabase node
    Query:
      SELECT a.*, p.name, p.phone
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      WHERE a.payment_status = 'pending'
        AND a.date_time < now() - INTERVAL '3 days'
        AND a.relance_count < 2
        AND a.amount_mad > 0
  → Split In Batches
  → WhatsApp Business Cloud node
    "Bonjour {patient}, un solde de {amount} MAD est en attente
     pour votre consultation du {date}. Merci de procéder au règlement."
  → Supabase node
    UPDATE appointments SET relance_count = relance_count + 1,
      last_relance_at = now() WHERE id = '{{$json.id}}'
```

## Brick 2 — Transcription (Phase 2, ne pas implémenter maintenant)

```
Webhook (POST /transcribe, body: { audio_url, consultation_id })
  → HTTP Request (GET audio_url → binary)
  → HTTP Request (POST https://api.groq.com/openai/v1/audio/transcriptions
      model: whisper-large-v3-turbo
      file: binary audio)
  → Supabase (UPDATE consultations SET transcript = {{response.text}}
      WHERE id = consultation_id)
  → Respond to Webhook (transcript)
```

## Brick 3 — Résumé structuré (Phase 2, ne pas implémenter maintenant)

```
Webhook (POST /summarize, body: { consultation_id })
  → Supabase (SELECT transcript FROM consultations WHERE id = consultation_id)
  → HTTP Request (POST Gemini Flash-Lite API)
    Prompt système:
      "Tu es un assistant médical. Résume cette consultation en JSON strict :
       { "motif": "...", "examen_clinique": "...", "diagnostic": "...",
         "traitement": [{"medicament": "...", "posologie": "...", "duree": "..."}],
         "suivi": "...", "prochain_rdv": "...", "alertes": ["..."] }"
    Message utilisateur: {{transcript}}
  → Supabase (UPDATE consultations SET summary_json = response)
  → Respond to Webhook (summary_json)
```

## Brick 4 — Vocal patient (Phase 3, ne pas implémenter maintenant)

```
Webhook (POST /send-vocal, body: { consultation_id })
  → Supabase (SELECT c.summary_json, p.language_pref, p.phone
      FROM consultations c
      JOIN patients p ON c.patient_id = p.id
      WHERE c.id = consultation_id)
  → HTTP Request (Gemini Flash-Lite)
    Prompt: "Transforme ce résumé médical en instructions simples pour le patient.
      Langue : {{language_pref}}. Ton chaleureux et rassurant.
      Pas de jargon médical. Maximum 30 secondes de lecture."
  → HTTP Request (Gemini 2.5 Flash TTS, voice: FR ou AR selon language_pref)
    → output: audio .ogg
  → Supabase Storage (upload .ogg dans bucket 'vocals')
  → WhatsApp Business Cloud (send audio message to patient phone)
  → Supabase (INSERT INTO messages:
      consultation_id, patient_id, channel='whatsapp', type='vocal', sent_at=now())
```
