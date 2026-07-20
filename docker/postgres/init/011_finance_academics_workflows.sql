-- Support multiple assessment attempts and reliable finance/academic workflows.
ALTER TABLE portal_marks DROP CONSTRAINT IF EXISTS portal_marks_pkey;
ALTER TABLE portal_marks ADD CONSTRAINT portal_marks_pkey PRIMARY KEY (assessment_id, student_id, attempt_number);
CREATE INDEX IF NOT EXISTS marks_publication_queue_idx ON portal_marks(status, updated_at DESC);
CREATE INDEX IF NOT EXISTS marks_student_history_idx ON portal_marks(student_id, assessment_id, attempt_number DESC);

ALTER TABLE portal_payments ADD COLUMN IF NOT EXISTS idempotency_key TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS payments_idempotency_uidx ON portal_payments(idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS payments_reconciliation_idx ON portal_payments(status, paid_at DESC);

ALTER TABLE portal_student_clearance
  ADD CONSTRAINT portal_student_clearance_status_check CHECK (status IN ('pending','approved','rejected','revoked')) NOT VALID;

INSERT INTO portal_role_permissions(role_id, permission_id, allowed)
SELECT r.id,p.id,true FROM portal_roles r CROSS JOIN portal_permissions p WHERE r.name='super_admin'
ON CONFLICT(role_id,permission_id) DO UPDATE SET allowed=true;

INSERT INTO portal_role_permissions(role_id,permission_id,allowed)
SELECT r.id,p.id,true FROM portal_roles r JOIN portal_permissions p ON p.permission_key IN ('portal.admin','academics.manage','exams.manage','marks.record','marks.moderate','marks.publish')
WHERE r.name='academic_admin'
ON CONFLICT(role_id,permission_id) DO UPDATE SET allowed=true;
