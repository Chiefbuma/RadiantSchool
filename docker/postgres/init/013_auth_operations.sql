ALTER TABLE portal_sessions
  ADD COLUMN IF NOT EXISTS ip_address INET,
  ADD COLUMN IF NOT EXISTS user_agent TEXT,
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now();
CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON portal_sessions(expires_at);
CREATE INDEX IF NOT EXISTS sessions_user_active_idx ON portal_sessions(user_id,expires_at DESC);

CREATE TABLE IF NOT EXISTS portal_login_attempts (
  id BIGSERIAL PRIMARY KEY,
  email_normalized TEXT NOT NULL,
  ip_address INET,
  succeeded BOOLEAN NOT NULL DEFAULT false,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS login_attempt_rate_idx ON portal_login_attempts(email_normalized,attempted_at DESC) WHERE succeeded=false;

CREATE OR REPLACE FUNCTION portal_expire_operational_data() RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM portal_sessions WHERE expires_at < now();
  DELETE FROM portal_login_attempts WHERE attempted_at < now()-interval '30 days';
  DELETE FROM portal_idempotency_keys WHERE expires_at < now();
  UPDATE portal_student_holds SET status='expired' WHERE status='active' AND expires_at IS NOT NULL AND expires_at<now();
END $$;
