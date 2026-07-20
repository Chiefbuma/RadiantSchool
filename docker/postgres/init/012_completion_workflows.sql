INSERT INTO portal_roles(name,description) VALUES
 ('library_officer','Library clearance authority'),('skills_lab_officer','Skills laboratory clearance authority'),('attachment_officer','Clinical placement and attachment clearance authority')
ON CONFLICT(name) DO UPDATE SET description=excluded.description;

INSERT INTO portal_role_permissions(role_id,permission_id,allowed)
SELECT r.id,p.id,true FROM portal_roles r JOIN portal_permissions p ON
 (r.name='library_officer' AND p.permission_key IN ('portal.admin','clearance.library')) OR
 (r.name='skills_lab_officer' AND p.permission_key IN ('portal.admin','clearance.skills_lab')) OR
 (r.name='attachment_officer' AND p.permission_key IN ('portal.admin','attachment.evaluate','clearance.attachment'))
ON CONFLICT(role_id,permission_id) DO UPDATE SET allowed=true;

ALTER TABLE portal_attachment_placements
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS required_hours NUMERIC(8,2) NOT NULL DEFAULT 240 CHECK(required_hours>0),
  ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES portal_users(id),
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;

ALTER TABLE portal_graduation_candidates
  ADD COLUMN IF NOT EXISTS hold_reason TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS graduation_candidate_status_idx ON portal_graduation_candidates(status,batch_id);
CREATE INDEX IF NOT EXISTS attachment_student_status_idx ON portal_attachment_placements(student_id,status);

INSERT INTO portal_role_permissions(role_id, permission_id, allowed)
SELECT r.id,p.id,true FROM portal_roles r CROSS JOIN portal_permissions p WHERE r.name='super_admin'
ON CONFLICT(role_id,permission_id) DO UPDATE SET allowed=true;
