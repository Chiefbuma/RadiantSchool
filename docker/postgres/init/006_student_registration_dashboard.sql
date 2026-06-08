ALTER TABLE portal_students
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS national_id TEXT,
  ADD COLUMN IF NOT EXISTS residence TEXT,
  ADD COLUMN IF NOT EXISTS next_of_kin_name TEXT,
  ADD COLUMN IF NOT EXISTS next_of_kin_phone TEXT,
  ADD COLUMN IF NOT EXISTS next_of_kin_relationship TEXT,
  ADD COLUMN IF NOT EXISTS registered_by UUID REFERENCES portal_users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE UNIQUE INDEX IF NOT EXISTS portal_students_email_unique_idx
  ON portal_students (lower(email))
  WHERE email IS NOT NULL AND email <> '';

CREATE UNIQUE INDEX IF NOT EXISTS portal_students_national_id_unique_idx
  ON portal_students (national_id)
  WHERE national_id IS NOT NULL AND national_id <> '';

UPDATE portal_students
SET gender = COALESCE(gender, 'Not Provided'),
    residence = COALESCE(residence, 'Nairobi'),
    next_of_kin_name = COALESCE(next_of_kin_name, 'To be provided'),
    next_of_kin_phone = COALESCE(next_of_kin_phone, phone),
    next_of_kin_relationship = COALESCE(next_of_kin_relationship, 'Next of Kin')
WHERE student_number = 'RHTI/CNA/2026/0001';

CREATE INDEX IF NOT EXISTS portal_students_registered_by_idx ON portal_students (registered_by);
