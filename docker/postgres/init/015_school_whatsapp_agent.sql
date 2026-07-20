BEGIN;

CREATE TABLE IF NOT EXISTS portal_whatsapp_conversations (
  phone TEXT PRIMARY KEY,
  state TEXT NOT NULL DEFAULT 'idle',
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_inbound_at TIMESTAMPTZ,
  last_outbound_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portal_whatsapp_messages (
  id BIGSERIAL PRIMARY KEY,
  provider_message_id TEXT UNIQUE,
  phone TEXT NOT NULL,
  direction TEXT NOT NULL CHECK(direction IN ('inbound','outbound')),
  message_type TEXT NOT NULL DEFAULT 'text',
  body TEXT,
  status TEXT NOT NULL,
  error TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  application_id BIGINT REFERENCES applications(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS whatsapp_messages_phone_timeline_idx ON portal_whatsapp_messages(phone,created_at DESC);
CREATE INDEX IF NOT EXISTS whatsapp_messages_application_idx ON portal_whatsapp_messages(application_id,created_at DESC) WHERE application_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS portal_whatsapp_outbox (
  id BIGSERIAL PRIMARY KEY,
  event_key TEXT NOT NULL UNIQUE,
  application_id BIGINT REFERENCES applications(id) ON DELETE CASCADE,
  destination TEXT NOT NULL,
  message_kind TEXT NOT NULL CHECK(message_kind IN ('application_received','status_update','offer_letter')),
  template_name TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','processing','sent','failed','cancelled')),
  attempts INTEGER NOT NULL DEFAULT 0 CHECK(attempts>=0),
  available_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  locked_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS whatsapp_outbox_dispatch_idx ON portal_whatsapp_outbox(status,available_at,id) WHERE status IN ('pending','failed');

CREATE TABLE IF NOT EXISTS portal_offer_documents (
  id BIGSERIAL PRIMARY KEY,
  application_id BIGINT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  offer_id BIGINT REFERENCES portal_admission_offers(id) ON DELETE SET NULL,
  access_token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS offer_documents_application_idx ON portal_offer_documents(application_id,created_at DESC);

CREATE OR REPLACE FUNCTION queue_application_whatsapp_status() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.source='whatsapp' AND NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO portal_whatsapp_outbox(event_key,application_id,destination,message_kind,template_name,payload)
    VALUES(
      'application-status:'||NEW.id||':'||NEW.version||':'||NEW.status,
      NEW.id,NEW.phone,
      CASE WHEN NEW.status='accepted' THEN 'offer_letter' ELSE 'status_update' END,
      CASE WHEN NEW.status='accepted' THEN current_setting('app.whatsapp_offer_template',true) ELSE current_setting('app.whatsapp_status_template',true) END,
      jsonb_build_object('applicationId',NEW.id,'status',NEW.status,'name',NEW.full_name,'reference','RHTI-'||NEW.id)
    ) ON CONFLICT(event_key) DO NOTHING;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS applications_whatsapp_status_outbox ON applications;
CREATE TRIGGER applications_whatsapp_status_outbox AFTER UPDATE OF status ON applications FOR EACH ROW EXECUTE FUNCTION queue_application_whatsapp_status();

COMMIT;
