CREATE TABLE IF NOT EXISTS portal_admission_offers (
  id BIGSERIAL PRIMARY KEY,
  application_id BIGINT NOT NULL UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
  program_id BIGINT NOT NULL REFERENCES portal_programs(id) ON DELETE RESTRICT,
  intake_id BIGINT REFERENCES portal_intakes(id) ON DELETE SET NULL,
  offer_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'issued' CHECK (status IN ('issued', 'accepted', 'declined', 'expired', 'withdrawn')),
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS portal_student_onboarding (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT NOT NULL UNIQUE REFERENCES portal_students(id) ON DELETE CASCADE,
  application_id BIGINT REFERENCES applications(id) ON DELETE SET NULL,
  offer_id BIGINT REFERENCES portal_admission_offers(id) ON DELETE SET NULL,
  enrollment_id BIGINT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked', 'cancelled')),
  documents_status TEXT NOT NULL DEFAULT 'pending' CHECK (documents_status IN ('pending', 'submitted', 'verified', 'rejected')),
  orientation_status TEXT NOT NULL DEFAULT 'pending' CHECK (orientation_status IN ('pending', 'scheduled', 'completed')),
  policies_status TEXT NOT NULL DEFAULT 'pending' CHECK (policies_status IN ('pending', 'accepted')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  notes TEXT
);

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS program_id BIGINT REFERENCES portal_programs(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS intake_id BIGINT REFERENCES portal_intakes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS offer_status TEXT NOT NULL DEFAULT 'not_issued',
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES portal_users(id) ON DELETE SET NULL;

ALTER TABLE portal_student_enrollments
  ADD COLUMN IF NOT EXISTS application_id BIGINT REFERENCES applications(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS offer_id BIGINT REFERENCES portal_admission_offers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS onboarding_id BIGINT REFERENCES portal_student_onboarding(id) ON DELETE SET NULL;

ALTER TABLE portal_assessments
  ADD COLUMN IF NOT EXISTS class_id BIGINT REFERENCES portal_classes(id) ON DELETE CASCADE;

ALTER TABLE portal_resource_assignments
  ADD COLUMN IF NOT EXISTS module_id BIGINT REFERENCES portal_modules(id) ON DELETE CASCADE;

ALTER TABLE portal_graduation_candidates
  ADD COLUMN IF NOT EXISTS clearance_completed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS registrar_approved_by UUID REFERENCES portal_users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS registrar_approved_at TIMESTAMPTZ;

ALTER TABLE portal_student_onboarding
  DROP CONSTRAINT IF EXISTS portal_student_onboarding_enrollment_fk;

ALTER TABLE portal_student_onboarding
  ADD CONSTRAINT portal_student_onboarding_enrollment_fk
  FOREIGN KEY (enrollment_id) REFERENCES portal_student_enrollments(id) ON DELETE SET NULL;

INSERT INTO applications (
  full_name,
  email,
  phone,
  program,
  program_id,
  intake_id,
  kcse_mean_grade,
  kcse_year,
  status,
  offer_status,
  source,
  notes
)
SELECT
  'RHTI Demo Student',
  'student@rhti.local',
  '0700000001',
  'cna',
  p.id,
  i.id,
  'D',
  2025,
  'accepted',
  'accepted',
  'seed',
  'Seeded accepted application used to demonstrate the application-to-student lifecycle.'
FROM portal_programs p
LEFT JOIN portal_intakes i ON i.name = 'CNA Monthly Intake'
WHERE p.slug = 'cna'
  AND NOT EXISTS (
    SELECT 1 FROM applications a WHERE lower(a.email) = 'student@rhti.local'
  );

UPDATE applications a
SET program_id = p.id
FROM portal_programs p
WHERE a.program_id IS NULL
  AND lower(a.program) IN (p.slug, lower(p.title));

UPDATE applications a
SET intake_id = i.id
FROM portal_intakes i
WHERE a.intake_id IS NULL
  AND (
    lower(i.name) LIKE '%' || lower(coalesce(a.notes, '')) || '%'
    OR i.name = 'CNA Monthly Intake'
  )
  AND a.program_id IS NOT NULL;

INSERT INTO portal_admission_offers (application_id, program_id, intake_id, offer_number, status, issued_at, accepted_at, notes)
SELECT a.id, COALESCE(a.program_id, p.id), COALESCE(a.intake_id, i.id), 'OFFER-' || a.id::text, 'accepted', NOW(), NOW(), 'Seeded accepted offer for linked demo student lifecycle.'
FROM applications a
JOIN portal_programs p ON p.slug = 'cna'
LEFT JOIN portal_intakes i ON i.name = 'CNA Monthly Intake'
WHERE lower(a.status) IN ('accepted', 'approved')
  AND (a.program_id = p.id OR lower(a.program) = p.slug)
ON CONFLICT (application_id) DO UPDATE SET
  program_id = EXCLUDED.program_id,
  intake_id = EXCLUDED.intake_id,
  status = EXCLUDED.status,
  accepted_at = COALESCE(portal_admission_offers.accepted_at, EXCLUDED.accepted_at);

UPDATE portal_students s
SET application_id = a.id
FROM applications a
WHERE s.application_id IS NULL
  AND lower(s.email) = lower(a.email);

UPDATE portal_student_enrollments e
SET application_id = s.application_id,
    offer_id = o.id
FROM portal_students s
LEFT JOIN portal_admission_offers o ON o.application_id = s.application_id
WHERE e.student_id = s.id
  AND (e.application_id IS NULL OR e.offer_id IS NULL);

INSERT INTO portal_student_onboarding (
  student_id,
  application_id,
  offer_id,
  enrollment_id,
  status,
  documents_status,
  orientation_status,
  policies_status,
  completed_at,
  notes
)
SELECT
  s.id,
  s.application_id,
  e.offer_id,
  e.id,
  'in_progress',
  'submitted',
  'scheduled',
  'accepted',
  NULL,
  'Onboarding was created after the accepted offer was converted into a student record.'
FROM portal_students s
JOIN portal_student_enrollments e ON e.student_id = s.id
ON CONFLICT (student_id) DO UPDATE SET
  application_id = EXCLUDED.application_id,
  offer_id = EXCLUDED.offer_id,
  enrollment_id = EXCLUDED.enrollment_id,
  status = EXCLUDED.status,
  documents_status = EXCLUDED.documents_status,
  orientation_status = EXCLUDED.orientation_status,
  policies_status = EXCLUDED.policies_status;

UPDATE portal_student_enrollments e
SET onboarding_id = o.id
FROM portal_student_onboarding o
WHERE o.enrollment_id = e.id
  AND e.onboarding_id IS NULL;

UPDATE portal_assessments a
SET class_id = cl.id
FROM portal_classes cl
WHERE a.class_id IS NULL
  AND cl.cohort_id = a.cohort_id;

CREATE INDEX IF NOT EXISTS applications_program_intake_idx ON applications (program_id, intake_id, status);
CREATE INDEX IF NOT EXISTS portal_offers_status_idx ON portal_admission_offers (status, issued_at DESC);
CREATE INDEX IF NOT EXISTS portal_onboarding_status_idx ON portal_student_onboarding (status, started_at DESC);
CREATE INDEX IF NOT EXISTS portal_enrollments_student_idx ON portal_student_enrollments (student_id, status);
CREATE INDEX IF NOT EXISTS portal_assessments_class_idx ON portal_assessments (class_id, module_id);
CREATE INDEX IF NOT EXISTS portal_resource_assignments_module_idx ON portal_resource_assignments (module_id);
