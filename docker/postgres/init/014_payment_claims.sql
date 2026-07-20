BEGIN;

CREATE TABLE IF NOT EXISTS portal_payment_claims (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT NOT NULL REFERENCES portal_students(id) ON DELETE RESTRICT,
  invoice_id BIGINT NOT NULL REFERENCES portal_invoices(id) ON DELETE RESTRICT,
  amount_kes BIGINT NOT NULL CHECK (amount_kes > 0),
  method TEXT NOT NULL CHECK (method IN ('MPesa','Bank Transfer','Cash')),
  reference TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','verified','rejected')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_by UUID REFERENCES portal_users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  UNIQUE (student_id, method, reference)
);
CREATE INDEX IF NOT EXISTS idx_payment_claims_review_queue ON portal_payment_claims(status,submitted_at);
CREATE INDEX IF NOT EXISTS idx_payment_claims_student ON portal_payment_claims(student_id,submitted_at DESC);

INSERT INTO portal_permissions(permission_key,label,module) VALUES
 ('payments.claim.review','Review student-submitted payment evidence','finance')
ON CONFLICT(permission_key) DO NOTHING;
INSERT INTO portal_role_permissions(role_id,permission_id)
SELECT r.id,p.id FROM portal_roles r CROSS JOIN portal_permissions p
WHERE r.name IN ('super_admin','finance_officer') AND p.permission_key='payments.claim.review'
ON CONFLICT DO NOTHING;

COMMIT;
