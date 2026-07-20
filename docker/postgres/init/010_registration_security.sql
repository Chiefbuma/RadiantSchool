CREATE TABLE IF NOT EXISTS portal_admission_counters (
  program_id BIGINT NOT NULL REFERENCES portal_programs(id) ON DELETE RESTRICT,
  intake_year INTEGER NOT NULL CHECK (intake_year BETWEEN 2020 AND 2200),
  next_value INTEGER NOT NULL DEFAULT 1 CHECK (next_value > 0),
  PRIMARY KEY(program_id, intake_year)
);

CREATE TABLE IF NOT EXISTS portal_account_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES portal_users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_by UUID REFERENCES portal_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS account_invitation_expiry_idx ON portal_account_invitations(expires_at) WHERE accepted_at IS NULL;

INSERT INTO portal_role_permissions(role_id, permission_id, allowed)
SELECT r.id,p.id,true FROM portal_roles r CROSS JOIN portal_permissions p WHERE r.name='super_admin'
ON CONFLICT(role_id,permission_id) DO UPDATE SET allowed=true;

INSERT INTO portal_role_permissions(role_id, permission_id, allowed)
SELECT r.id,p.id,true FROM portal_roles r JOIN portal_permissions p ON p.permission_key IN ('portal.admin','applications.manage','applications.review')
WHERE r.name='admissions'
ON CONFLICT(role_id,permission_id) DO UPDATE SET allowed=true;

INSERT INTO portal_role_permissions(role_id, permission_id, allowed)
SELECT r.id,p.id,true FROM portal_roles r JOIN portal_permissions p ON p.permission_key IN ('portal.admin','students.manage','students.register','clearance.registrar','graduation.manage','certificate.issue')
WHERE r.name='registrar'
ON CONFLICT(role_id,permission_id) DO UPDATE SET allowed=true;

INSERT INTO portal_role_permissions(role_id, permission_id, allowed)
SELECT r.id,p.id,true FROM portal_roles r JOIN portal_permissions p ON p.permission_key IN ('portal.admin','finance.manage','payments.record','payments.reverse','clearance.finance')
WHERE r.name='finance'
ON CONFLICT(role_id,permission_id) DO UPDATE SET allowed=true;
