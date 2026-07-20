-- Production lifecycle hardening. Additive and idempotent so it can be applied
-- to both existing installations and fresh Docker databases.
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE OR REPLACE FUNCTION portal_touch_row() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  IF to_jsonb(NEW) ? 'version' THEN NEW.version = COALESCE(OLD.version, 0) + 1; END IF;
  RETURN NEW;
END $$;

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES portal_users(id),
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'website',
  ADD COLUMN IF NOT EXISTS notes TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS applications_active_email_program_intake_uidx
  ON applications (lower(email), program_id, intake_id) WHERE deleted_at IS NULL AND status NOT IN ('rejected','withdrawn');
CREATE INDEX IF NOT EXISTS applications_review_queue_idx
  ON applications (status, created_at DESC) INCLUDE (full_name, email, program_id, intake_id) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS portal_application_status_history (
  id BIGSERIAL PRIMARY KEY,
  application_id BIGINT NOT NULL REFERENCES applications(id) ON DELETE RESTRICT,
  from_status TEXT,
  to_status TEXT NOT NULL,
  reason TEXT,
  changed_by UUID REFERENCES portal_users(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS application_history_lookup_idx ON portal_application_status_history(application_id, changed_at DESC);

ALTER TABLE portal_students
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES portal_users(id);
CREATE INDEX IF NOT EXISTS students_active_number_idx ON portal_students(student_number) WHERE deleted_at IS NULL;

ALTER TABLE portal_student_enrollments
  ADD COLUMN IF NOT EXISTS academic_year_id BIGINT REFERENCES portal_academic_years(id),
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS status_reason TEXT,
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE UNIQUE INDEX IF NOT EXISTS one_active_enrollment_per_student_idx
  ON portal_student_enrollments(student_id) WHERE status = 'active' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS enrollment_roster_idx
  ON portal_student_enrollments(class_id, status, student_id) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS portal_enrollment_status_history (
  id BIGSERIAL PRIMARY KEY,
  enrollment_id BIGINT NOT NULL REFERENCES portal_student_enrollments(id) ON DELETE RESTRICT,
  from_status TEXT,
  to_status TEXT NOT NULL CHECK (to_status IN ('pending_onboarding','active','deferred','suspended','completed','withdrawn','graduated')),
  reason TEXT NOT NULL,
  effective_on DATE NOT NULL DEFAULT CURRENT_DATE,
  changed_by UUID REFERENCES portal_users(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS portal_student_holds (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT NOT NULL REFERENCES portal_students(id) ON DELETE RESTRICT,
  hold_type TEXT NOT NULL CHECK (hold_type IN ('finance','documents','academic','discipline','library','attachment')),
  reason TEXT NOT NULL,
  applied_by UUID REFERENCES portal_users(id),
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  released_by UUID REFERENCES portal_users(id),
  released_at TIMESTAMPTZ,
  release_reason TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','released','expired'))
);
CREATE UNIQUE INDEX IF NOT EXISTS student_active_hold_uidx ON portal_student_holds(student_id, hold_type) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS student_holds_lookup_idx ON portal_student_holds(student_id, status);

ALTER TABLE portal_invoices
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD CONSTRAINT portal_invoice_amount_positive CHECK (amount_kes > 0);
ALTER TABLE portal_payments
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'verified' CHECK (status IN ('pending','verified','failed','reversed')),
  ADD COLUMN IF NOT EXISTS reversed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reversed_by UUID REFERENCES portal_users(id),
  ADD COLUMN IF NOT EXISTS reversal_reason TEXT,
  ADD CONSTRAINT portal_payment_amount_positive CHECK (amount_kes > 0);
CREATE UNIQUE INDEX IF NOT EXISTS payment_reference_uidx ON portal_payments(lower(reference)) WHERE reference IS NOT NULL AND status <> 'reversed';

CREATE TABLE IF NOT EXISTS portal_invoice_items (
  id BIGSERIAL PRIMARY KEY,
  invoice_id BIGINT NOT NULL REFERENCES portal_invoices(id) ON DELETE RESTRICT,
  item_type TEXT NOT NULL,
  description TEXT NOT NULL,
  quantity NUMERIC(12,2) NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_amount_kes NUMERIC(14,2) NOT NULL CHECK (unit_amount_kes >= 0),
  amount_kes NUMERIC(14,2) GENERATED ALWAYS AS (quantity * unit_amount_kes) STORED
);
CREATE INDEX IF NOT EXISTS invoice_items_invoice_idx ON portal_invoice_items(invoice_id);

CREATE TABLE IF NOT EXISTS portal_payment_allocations (
  payment_id BIGINT NOT NULL REFERENCES portal_payments(id) ON DELETE RESTRICT,
  invoice_id BIGINT NOT NULL REFERENCES portal_invoices(id) ON DELETE RESTRICT,
  amount_kes NUMERIC(14,2) NOT NULL CHECK (amount_kes > 0),
  allocated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY(payment_id, invoice_id)
);
CREATE INDEX IF NOT EXISTS payment_allocations_invoice_idx ON portal_payment_allocations(invoice_id);

CREATE TABLE IF NOT EXISTS portal_grading_schemes (
  id BIGSERIAL PRIMARY KEY,
  program_id BIGINT REFERENCES portal_programs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(program_id, name)
);
CREATE TABLE IF NOT EXISTS portal_grade_bands (
  id BIGSERIAL PRIMARY KEY,
  scheme_id BIGINT NOT NULL REFERENCES portal_grading_schemes(id) ON DELETE CASCADE,
  grade TEXT NOT NULL,
  minimum_percent NUMERIC(5,2) NOT NULL CHECK (minimum_percent BETWEEN 0 AND 100),
  maximum_percent NUMERIC(5,2) NOT NULL CHECK (maximum_percent BETWEEN 0 AND 100),
  outcome TEXT NOT NULL CHECK (outcome IN ('pass','fail','supplementary')),
  CHECK (minimum_percent <= maximum_percent),
  UNIQUE(scheme_id, grade)
);
ALTER TABLE portal_marks
  ADD COLUMN IF NOT EXISTS attempt_number INTEGER NOT NULL DEFAULT 1 CHECK (attempt_number > 0),
  ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES portal_users(id),
  ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS published_by UUID REFERENCES portal_users(id),
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1,
  ADD CONSTRAINT portal_mark_nonnegative CHECK (score >= 0);

CREATE TABLE IF NOT EXISTS portal_module_results (
  id BIGSERIAL PRIMARY KEY,
  enrollment_id BIGINT NOT NULL REFERENCES portal_student_enrollments(id) ON DELETE RESTRICT,
  module_id BIGINT NOT NULL REFERENCES portal_modules(id) ON DELETE RESTRICT,
  final_percent NUMERIC(5,2) CHECK (final_percent BETWEEN 0 AND 100),
  grade TEXT,
  outcome TEXT NOT NULL DEFAULT 'pending' CHECK (outcome IN ('pending','passed','failed','supplementary')),
  credits_earned INTEGER NOT NULL DEFAULT 0,
  calculated_at TIMESTAMPTZ,
  UNIQUE(enrollment_id, module_id)
);

ALTER TABLE portal_timetable_events ADD CONSTRAINT timetable_valid_range CHECK (starts_at < ends_at);
CREATE INDEX IF NOT EXISTS timetable_trainer_range_idx ON portal_timetable_events(trainer_user_id, starts_at, ends_at);
CREATE INDEX IF NOT EXISTS timetable_room_range_idx ON portal_timetable_events(room, starts_at, ends_at);

CREATE TABLE IF NOT EXISTS portal_attachment_logbook_entries (
  id BIGSERIAL PRIMARY KEY,
  placement_id BIGINT NOT NULL REFERENCES portal_attachment_placements(id) ON DELETE RESTRICT,
  entry_date DATE NOT NULL,
  started_at TIME NOT NULL,
  ended_at TIME NOT NULL,
  activities TEXT NOT NULL,
  competencies TEXT,
  student_notes TEXT,
  supervisor_status TEXT NOT NULL DEFAULT 'pending' CHECK (supervisor_status IN ('pending','approved','rejected')),
  supervisor_comments TEXT,
  approved_at TIMESTAMPTZ,
  CHECK (started_at < ended_at),
  UNIQUE(placement_id, entry_date)
);
CREATE INDEX IF NOT EXISTS logbook_supervision_queue_idx ON portal_attachment_logbook_entries(supervisor_status, entry_date);

CREATE TABLE IF NOT EXISTS portal_attachment_evaluations (
  id BIGSERIAL PRIMARY KEY,
  placement_id BIGINT NOT NULL UNIQUE REFERENCES portal_attachment_placements(id) ON DELETE RESTRICT,
  clinical_competence SMALLINT NOT NULL CHECK (clinical_competence BETWEEN 0 AND 100),
  professional_conduct SMALLINT NOT NULL CHECK (professional_conduct BETWEEN 0 AND 100),
  communication SMALLINT NOT NULL CHECK (communication BETWEEN 0 AND 100),
  infection_prevention SMALLINT NOT NULL CHECK (infection_prevention BETWEEN 0 AND 100),
  documentation SMALLINT NOT NULL CHECK (documentation BETWEEN 0 AND 100),
  attendance SMALLINT NOT NULL CHECK (attendance BETWEEN 0 AND 100),
  recommendation TEXT NOT NULL,
  supervisor_name TEXT NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  verified_by UUID REFERENCES portal_users(id),
  verified_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS portal_clearance_decisions (
  id BIGSERIAL PRIMARY KEY,
  student_clearance_id BIGINT NOT NULL REFERENCES portal_student_clearance(id) ON DELETE RESTRICT,
  decision TEXT NOT NULL CHECK (decision IN ('approved','revoked','rejected')),
  reason TEXT NOT NULL,
  decided_by UUID NOT NULL REFERENCES portal_users(id),
  decided_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS clearance_decision_history_idx ON portal_clearance_decisions(student_clearance_id, decided_at DESC);

ALTER TABLE portal_graduation_candidates
  ADD COLUMN IF NOT EXISTS eligibility_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS eligibility_checked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;
CREATE TABLE IF NOT EXISTS portal_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id BIGINT NOT NULL REFERENCES portal_students(id) ON DELETE RESTRICT,
  batch_id BIGINT NOT NULL REFERENCES portal_graduation_batches(id) ON DELETE RESTRICT,
  credential_type TEXT NOT NULL CHECK (credential_type IN ('certificate','transcript')),
  serial_number TEXT NOT NULL UNIQUE,
  verification_code TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(18), 'hex'),
  issued_by UUID NOT NULL REFERENCES portal_users(id),
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  revocation_reason TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE(student_id, batch_id, credential_type)
);

CREATE TABLE IF NOT EXISTS portal_idempotency_keys (
  key TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES portal_users(id) ON DELETE CASCADE,
  operation TEXT NOT NULL,
  request_hash TEXT NOT NULL,
  response_status INTEGER,
  response_body JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + interval '24 hours'
);
CREATE INDEX IF NOT EXISTS idempotency_expiry_idx ON portal_idempotency_keys(expires_at);

CREATE TABLE IF NOT EXISTS portal_notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES portal_users(id) ON DELETE CASCADE,
  student_id BIGINT REFERENCES portal_students(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('in_app','email','sms','whatsapp')),
  template_key TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','sent','failed','read')),
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS notification_delivery_queue_idx ON portal_notifications(status, created_at) WHERE status IN ('queued','failed');

ALTER TABLE portal_audit_logs
  ADD COLUMN IF NOT EXISTS student_id BIGINT REFERENCES portal_students(id),
  ADD COLUMN IF NOT EXISTS before_state JSONB,
  ADD COLUMN IF NOT EXISTS after_state JSONB,
  ADD COLUMN IF NOT EXISTS ip_address INET,
  ADD COLUMN IF NOT EXISTS user_agent TEXT,
  ADD COLUMN IF NOT EXISTS correlation_id UUID;
CREATE INDEX IF NOT EXISTS audit_entity_timeline_idx ON portal_audit_logs(entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS audit_student_timeline_idx ON portal_audit_logs(student_id, created_at DESC) WHERE student_id IS NOT NULL;

CREATE OR REPLACE FUNCTION portal_prevent_audit_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'portal_audit_logs is append-only'; END $$;
DROP TRIGGER IF EXISTS portal_audit_immutable ON portal_audit_logs;
CREATE TRIGGER portal_audit_immutable BEFORE UPDATE OR DELETE ON portal_audit_logs
FOR EACH ROW EXECUTE FUNCTION portal_prevent_audit_mutation();

DROP TRIGGER IF EXISTS applications_touch ON applications;
CREATE TRIGGER applications_touch BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION portal_touch_row();
DROP TRIGGER IF EXISTS students_touch ON portal_students;
CREATE TRIGGER students_touch BEFORE UPDATE ON portal_students FOR EACH ROW EXECUTE FUNCTION portal_touch_row();
DROP TRIGGER IF EXISTS enrollments_touch ON portal_student_enrollments;
CREATE TRIGGER enrollments_touch BEFORE UPDATE ON portal_student_enrollments FOR EACH ROW EXECUTE FUNCTION portal_touch_row();
DROP TRIGGER IF EXISTS invoices_touch ON portal_invoices;
CREATE TRIGGER invoices_touch BEFORE UPDATE ON portal_invoices FOR EACH ROW EXECUTE FUNCTION portal_touch_row();

INSERT INTO portal_permissions(permission_key,label,module) VALUES
 ('applications.review','Review application decisions','admissions'),
 ('students.register','Register accepted applicants','registrar'),
 ('payments.record','Record and allocate payments','finance'),
 ('payments.reverse','Reverse verified payments','finance'),
 ('marks.record','Record assessment marks','exams'),
 ('marks.moderate','Moderate assessment marks','exams'),
 ('marks.publish','Publish approved results','exams'),
 ('attachment.evaluate','Evaluate clinical attachments','attachment'),
 ('clearance.finance','Approve finance clearance','clearance'),
 ('clearance.library','Approve library clearance','clearance'),
 ('clearance.skills_lab','Approve skills laboratory clearance','clearance'),
 ('clearance.academic','Approve academic clearance','clearance'),
 ('clearance.attachment','Approve attachment clearance','clearance'),
 ('clearance.registrar','Approve final registrar clearance','clearance'),
 ('certificate.issue','Issue graduation credentials','graduation'),
 ('reports.view','View operational reports','reports')
ON CONFLICT(permission_key) DO UPDATE SET label=excluded.label,module=excluded.module;
