CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS portal_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  password_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portal_roles (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS portal_permissions (
  id BIGSERIAL PRIMARY KEY,
  permission_key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  module TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS portal_user_roles (
  user_id UUID NOT NULL REFERENCES portal_users(id) ON DELETE CASCADE,
  role_id BIGINT NOT NULL REFERENCES portal_roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS portal_role_permissions (
  role_id BIGINT NOT NULL REFERENCES portal_roles(id) ON DELETE CASCADE,
  permission_id BIGINT NOT NULL REFERENCES portal_permissions(id) ON DELETE CASCADE,
  allowed BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS portal_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES portal_users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portal_institutions (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  tagline TEXT NOT NULL,
  mission TEXT NOT NULL,
  vision TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT
);

CREATE TABLE IF NOT EXISTS portal_campuses (
  id BIGSERIAL PRIMARY KEY,
  institution_id BIGINT NOT NULL REFERENCES portal_institutions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  UNIQUE (institution_id, name)
);

CREATE TABLE IF NOT EXISTS portal_departments (
  id BIGSERIAL PRIMARY KEY,
  campus_id BIGINT REFERENCES portal_campuses(id) ON DELETE SET NULL,
  name TEXT NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE IF NOT EXISTS portal_academic_years (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  starts_on DATE NOT NULL,
  ends_on DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned'
);

CREATE TABLE IF NOT EXISTS portal_terms (
  id BIGSERIAL PRIMARY KEY,
  academic_year_id BIGINT NOT NULL REFERENCES portal_academic_years(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  starts_on DATE NOT NULL,
  ends_on DATE NOT NULL,
  UNIQUE (academic_year_id, name)
);

CREATE TABLE IF NOT EXISTS portal_intakes (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  intake_month TEXT NOT NULL,
  intake_year INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'open'
);

CREATE TABLE IF NOT EXISTS portal_programs (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  duration_months INTEGER NOT NULL,
  entry_requirements TEXT NOT NULL,
  tuition_fee_kes INTEGER NOT NULL,
  overview TEXT NOT NULL,
  pdf_url TEXT,
  status TEXT NOT NULL DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS portal_modules (
  id BIGSERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  credits INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS portal_program_modules (
  program_id BIGINT NOT NULL REFERENCES portal_programs(id) ON DELETE CASCADE,
  module_id BIGINT NOT NULL REFERENCES portal_modules(id) ON DELETE CASCADE,
  module_order INTEGER NOT NULL,
  PRIMARY KEY (program_id, module_id)
);

CREATE TABLE IF NOT EXISTS portal_cohorts (
  id BIGSERIAL PRIMARY KEY,
  program_id BIGINT NOT NULL REFERENCES portal_programs(id) ON DELETE CASCADE,
  intake_id BIGINT NOT NULL REFERENCES portal_intakes(id) ON DELETE CASCADE,
  name TEXT NOT NULL UNIQUE,
  starts_on DATE NOT NULL,
  expected_graduation_on DATE,
  status TEXT NOT NULL DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS portal_classes (
  id BIGSERIAL PRIMARY KEY,
  cohort_id BIGINT NOT NULL REFERENCES portal_cohorts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trainer_user_id UUID REFERENCES portal_users(id) ON DELETE SET NULL,
  room TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  UNIQUE (cohort_id, name)
);

CREATE TABLE IF NOT EXISTS portal_students (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES portal_users(id) ON DELETE SET NULL,
  application_id BIGINT REFERENCES applications(id) ON DELETE SET NULL,
  student_number TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portal_student_enrollments (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT NOT NULL REFERENCES portal_students(id) ON DELETE CASCADE,
  program_id BIGINT NOT NULL REFERENCES portal_programs(id) ON DELETE RESTRICT,
  cohort_id BIGINT NOT NULL REFERENCES portal_cohorts(id) ON DELETE RESTRICT,
  class_id BIGINT REFERENCES portal_classes(id) ON DELETE SET NULL,
  enrolled_on DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'active',
  UNIQUE (student_id, program_id, cohort_id)
);

CREATE TABLE IF NOT EXISTS portal_learning_resources (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL UNIQUE,
  resource_type TEXT NOT NULL,
  url TEXT,
  description TEXT,
  created_by UUID REFERENCES portal_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portal_resource_assignments (
  id BIGSERIAL PRIMARY KEY,
  resource_id BIGINT NOT NULL REFERENCES portal_learning_resources(id) ON DELETE CASCADE,
  student_id BIGINT REFERENCES portal_students(id) ON DELETE CASCADE,
  class_id BIGINT REFERENCES portal_classes(id) ON DELETE CASCADE,
  cohort_id BIGINT REFERENCES portal_cohorts(id) ON DELETE CASCADE,
  program_id BIGINT REFERENCES portal_programs(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (
    student_id IS NOT NULL OR class_id IS NOT NULL OR cohort_id IS NOT NULL OR program_id IS NOT NULL
  )
);

CREATE TABLE IF NOT EXISTS portal_timetable_events (
  id BIGSERIAL PRIMARY KEY,
  class_id BIGINT NOT NULL REFERENCES portal_classes(id) ON DELETE CASCADE,
  module_id BIGINT REFERENCES portal_modules(id) ON DELETE SET NULL,
  trainer_user_id UUID REFERENCES portal_users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  room TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS portal_attendance_sessions (
  id BIGSERIAL PRIMARY KEY,
  class_id BIGINT NOT NULL REFERENCES portal_classes(id) ON DELETE CASCADE,
  module_id BIGINT REFERENCES portal_modules(id) ON DELETE SET NULL,
  session_date DATE NOT NULL,
  topic TEXT,
  created_by UUID REFERENCES portal_users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS portal_attendance_records (
  session_id BIGINT NOT NULL REFERENCES portal_attendance_sessions(id) ON DELETE CASCADE,
  student_id BIGINT NOT NULL REFERENCES portal_students(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  PRIMARY KEY (session_id, student_id)
);

CREATE TABLE IF NOT EXISTS portal_fee_structures (
  id BIGSERIAL PRIMARY KEY,
  program_id BIGINT NOT NULL REFERENCES portal_programs(id) ON DELETE CASCADE,
  cohort_id BIGINT REFERENCES portal_cohorts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  total_amount_kes INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS portal_invoices (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT NOT NULL REFERENCES portal_students(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  amount_kes INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'unpaid',
  due_on DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portal_payments (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT NOT NULL REFERENCES portal_students(id) ON DELETE CASCADE,
  invoice_id BIGINT REFERENCES portal_invoices(id) ON DELETE SET NULL,
  receipt_number TEXT NOT NULL UNIQUE,
  amount_kes INTEGER NOT NULL,
  method TEXT NOT NULL DEFAULT 'manual',
  reference TEXT,
  paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recorded_by UUID REFERENCES portal_users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS portal_assessments (
  id BIGSERIAL PRIMARY KEY,
  module_id BIGINT NOT NULL REFERENCES portal_modules(id) ON DELETE CASCADE,
  cohort_id BIGINT NOT NULL REFERENCES portal_cohorts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  assessment_type TEXT NOT NULL,
  max_score NUMERIC(6,2) NOT NULL DEFAULT 100,
  weight_percent NUMERIC(5,2) NOT NULL DEFAULT 100,
  exam_date DATE,
  status TEXT NOT NULL DEFAULT 'planned'
);

CREATE TABLE IF NOT EXISTS portal_marks (
  assessment_id BIGINT NOT NULL REFERENCES portal_assessments(id) ON DELETE CASCADE,
  student_id BIGINT NOT NULL REFERENCES portal_students(id) ON DELETE CASCADE,
  score NUMERIC(6,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  entered_by UUID REFERENCES portal_users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (assessment_id, student_id)
);

CREATE TABLE IF NOT EXISTS portal_attachment_sites (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  location TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT
);

CREATE TABLE IF NOT EXISTS portal_attachment_placements (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT NOT NULL REFERENCES portal_students(id) ON DELETE CASCADE,
  site_id BIGINT NOT NULL REFERENCES portal_attachment_sites(id) ON DELETE RESTRICT,
  supervisor_name TEXT,
  starts_on DATE NOT NULL,
  ends_on DATE,
  status TEXT NOT NULL DEFAULT 'assigned'
);

CREATE TABLE IF NOT EXISTS portal_request_categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  department_id BIGINT REFERENCES portal_departments(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS portal_student_requests (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT NOT NULL REFERENCES portal_students(id) ON DELETE CASCADE,
  category_id BIGINT REFERENCES portal_request_categories(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  details TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted',
  assigned_to UUID REFERENCES portal_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portal_clearance_templates (
  id BIGSERIAL PRIMARY KEY,
  program_id BIGINT REFERENCES portal_programs(id) ON DELETE CASCADE,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS portal_clearance_checkpoints (
  id BIGSERIAL PRIMARY KEY,
  template_id BIGINT NOT NULL REFERENCES portal_clearance_templates(id) ON DELETE CASCADE,
  department_id BIGINT REFERENCES portal_departments(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  checkpoint_order INTEGER NOT NULL,
  UNIQUE (template_id, title)
);

CREATE TABLE IF NOT EXISTS portal_student_clearance (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT NOT NULL REFERENCES portal_students(id) ON DELETE CASCADE,
  checkpoint_id BIGINT NOT NULL REFERENCES portal_clearance_checkpoints(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES portal_users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  notes TEXT,
  UNIQUE (student_id, checkpoint_id)
);

CREATE TABLE IF NOT EXISTS portal_graduation_batches (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  ceremony_date DATE,
  status TEXT NOT NULL DEFAULT 'planned'
);

CREATE TABLE IF NOT EXISTS portal_graduation_candidates (
  batch_id BIGINT NOT NULL REFERENCES portal_graduation_batches(id) ON DELETE CASCADE,
  student_id BIGINT NOT NULL REFERENCES portal_students(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  PRIMARY KEY (batch_id, student_id)
);

CREATE TABLE IF NOT EXISTS portal_audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES portal_users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS portal_students_status_idx ON portal_students (status);
CREATE INDEX IF NOT EXISTS portal_requests_status_idx ON portal_student_requests (status, created_at DESC);
CREATE INDEX IF NOT EXISTS portal_invoices_student_idx ON portal_invoices (student_id, status);
CREATE INDEX IF NOT EXISTS portal_timetable_class_idx ON portal_timetable_events (class_id, starts_at);

INSERT INTO portal_roles (name, description) VALUES
  ('super_admin', 'Full institute system access'),
  ('admissions', 'Admissions and application management'),
  ('registrar', 'Student records, cohorts, clearance, graduation'),
  ('finance', 'Fees, invoices, payments, receipts'),
  ('academic_admin', 'Programs, modules, classes, exams, timetables'),
  ('trainer', 'Assigned classes, attendance, resources, marks'),
  ('student', 'Student self-service portal access')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

INSERT INTO portal_permissions (permission_key, label, module) VALUES
  ('portal.admin', 'Access admin portal', 'core'),
  ('applications.manage', 'Manage applications', 'admissions'),
  ('students.manage', 'Manage students', 'registrar'),
  ('academics.manage', 'Manage academics', 'academics'),
  ('finance.manage', 'Manage fees and payments', 'finance'),
  ('exams.manage', 'Manage exams and results', 'exams'),
  ('resources.assign', 'Assign learning resources', 'resources'),
  ('requests.manage', 'Manage student requests', 'requests'),
  ('clearance.manage', 'Manage clearance', 'clearance'),
  ('graduation.manage', 'Manage graduation', 'graduation'),
  ('portal.student', 'Access student portal', 'core'),
  ('audit.view', 'View audit logs', 'security')
ON CONFLICT (permission_key) DO UPDATE SET label = EXCLUDED.label, module = EXCLUDED.module;

INSERT INTO portal_role_permissions (role_id, permission_id, allowed)
SELECT r.id, p.id, true
FROM portal_roles r
CROSS JOIN portal_permissions p
WHERE r.name = 'super_admin'
ON CONFLICT (role_id, permission_id) DO UPDATE SET allowed = EXCLUDED.allowed;

INSERT INTO portal_role_permissions (role_id, permission_id, allowed)
SELECT r.id, p.id, p.permission_key IN ('portal.student')
FROM portal_roles r
CROSS JOIN portal_permissions p
WHERE r.name = 'student'
ON CONFLICT (role_id, permission_id) DO UPDATE SET allowed = EXCLUDED.allowed;

INSERT INTO portal_users (full_name, email, phone, password_hash, status) VALUES
  ('RHTI Super Admin', 'admin@rhti.local', '0712588588', 'scrypt:3ef850d5759bf2b23bb06ece01d7f430:a3c26f79a9c8923dcf90ee95342860bdae8bb2acc509bc3f29530ca2dd65dfb4229c9b325f985a0a4b8b6a0fe05b4f3ef5a00317f42706b9655de2a4dd5287a2', 'active'),
  ('RHTI Demo Student', 'student@rhti.local', '0700000001', 'scrypt:94e53b9bb2c4edc53ab21e66cc475f05:5ef61dfcb4a4564444710d9d2c1d6855646bc9ff92f3e0998a102da805ddc660257f861a4d20d0cf77c664b0eea3c0bb4969d0dc62bf20c250e19d3252ed73e5', 'active')
ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, password_hash = EXCLUDED.password_hash, status = EXCLUDED.status;

INSERT INTO portal_user_roles (user_id, role_id)
SELECT u.id, r.id FROM portal_users u JOIN portal_roles r ON r.name = 'super_admin' WHERE u.email = 'admin@rhti.local'
ON CONFLICT DO NOTHING;

INSERT INTO portal_user_roles (user_id, role_id)
SELECT u.id, r.id FROM portal_users u JOIN portal_roles r ON r.name = 'student' WHERE u.email = 'student@rhti.local'
ON CONFLICT DO NOTHING;

INSERT INTO portal_institutions (name, tagline, mission, vision, address, phone, email)
VALUES (
  'Radiant Hospital Training Institute',
  'Educating Hearts and Minds for Health',
  'To cultivate a culture of learning among our students by imparting the knowledge, skills, and qualities essential for delivering quality patient care.',
  'To be a leading academic health center by producing highly skilled and competent graduates who will drive excellence in the healthcare industry.',
  'P.O Box 63683 - 00607, Kasarani, Nairobi, Kenya',
  '0712 588 588',
  'rhti@radianthospitals.org'
)
ON CONFLICT (name) DO UPDATE SET tagline = EXCLUDED.tagline, mission = EXCLUDED.mission, vision = EXCLUDED.vision, address = EXCLUDED.address, phone = EXCLUDED.phone, email = EXCLUDED.email;

INSERT INTO portal_campuses (institution_id, name, location)
SELECT id, 'Kasarani Sportsview Campus', 'Radiant Hospital - Kasarani Sportsview Branch, Kasarani, Nairobi'
FROM portal_institutions WHERE name = 'Radiant Hospital Training Institute'
ON CONFLICT (institution_id, name) DO UPDATE SET location = EXCLUDED.location;

INSERT INTO portal_departments (campus_id, name, description)
SELECT c.id, x.name, x.description
FROM portal_campuses c
CROSS JOIN (
  VALUES
    ('Admissions', 'Application review and applicant conversion'),
    ('Registrar', 'Student records, clearance, graduation'),
    ('Finance', 'Fees, invoices, payments and statements'),
    ('Academics', 'Programs, classes, timetables, exams and results'),
    ('Library', 'Library resources and clearance'),
    ('Skills Lab', 'Practical lab resources and clearance'),
    ('Attachment Office', 'Hospital attachments and clinical placements')
) AS x(name, description)
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

INSERT INTO portal_academic_years (name, starts_on, ends_on, status)
VALUES ('2026 Academic Year', '2026-01-01', '2026-12-31', 'active')
ON CONFLICT (name) DO UPDATE SET starts_on = EXCLUDED.starts_on, ends_on = EXCLUDED.ends_on, status = EXCLUDED.status;

INSERT INTO portal_terms (academic_year_id, name, starts_on, ends_on)
SELECT id, 'Term 1', '2026-01-05', '2026-04-30' FROM portal_academic_years WHERE name = '2026 Academic Year'
ON CONFLICT (academic_year_id, name) DO UPDATE SET starts_on = EXCLUDED.starts_on, ends_on = EXCLUDED.ends_on;

INSERT INTO portal_intakes (name, intake_month, intake_year, status) VALUES
  ('January 2026 Intake', 'January', 2026, 'open'),
  ('March 2026 Intake', 'March', 2026, 'open'),
  ('June 2026 Intake', 'June', 2026, 'open'),
  ('September 2026 Intake', 'September', 2026, 'open'),
  ('CNA Monthly Intake', 'Monthly', 2026, 'open')
ON CONFLICT (name) DO UPDATE SET status = EXCLUDED.status;

INSERT INTO portal_programs (slug, title, duration_months, entry_requirements, tuition_fee_kes, overview, pdf_url) VALUES
  ('cna', 'Certificate in Certified Nursing Assistant (CNA)', 4, 'KCSE Mean Grade of D (Plain) and Above', 58000, 'Foundational patient care, hygiene, vital signs, safe patient handling, communication, and practical clinical training.', '/more/NEW-CNA-FEE%20(1).pdf'),
  ('dental', 'Certificate in Dental Assistant', 9, 'KCSE Mean Grade of D (Plain) and Above', 95000, 'Chairside assisting, sterilization, dental radiography, oral health education, infection control, and dental office administration.', '/more/NEW-DENTAL-ASSISTANT-FEE.pdf'),
  ('hrit', 'Certificate in Health Records and IT (HRIT)', 18, 'KCSE Mean Grade of C- and Above', 161900, 'Medical coding, patient data management, EHR systems, health information laws and ethics, and data quality assurance.', '/more/NEW-HEALTH-RECORDS---FEE.pdf')
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, duration_months = EXCLUDED.duration_months, entry_requirements = EXCLUDED.entry_requirements, tuition_fee_kes = EXCLUDED.tuition_fee_kes, overview = EXCLUDED.overview, pdf_url = EXCLUDED.pdf_url;

INSERT INTO portal_modules (code, title, description, credits) VALUES
  ('CNA101', 'Basic Patient Care', 'Patient hygiene, comfort and basic care routines.', 3),
  ('CNA102', 'Vital Signs and Communication', 'Monitoring, recording and communicating patient status.', 3),
  ('DA101', 'Chairside Dental Assisting', 'Dental assisting workflow and chairside support.', 3),
  ('DA102', 'Sterilization and Infection Control', 'Dental instrument care and infection prevention.', 3),
  ('HRIT101', 'Health Records Management', 'Patient records, filing systems and data quality.', 3),
  ('HRIT102', 'Electronic Health Records', 'Digital health information systems and ethics.', 3)
ON CONFLICT (code) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, credits = EXCLUDED.credits;

INSERT INTO portal_program_modules (program_id, module_id, module_order)
SELECT p.id, m.id, x.module_order
FROM (VALUES
  ('cna', 'CNA101', 1), ('cna', 'CNA102', 2),
  ('dental', 'DA101', 1), ('dental', 'DA102', 2),
  ('hrit', 'HRIT101', 1), ('hrit', 'HRIT102', 2)
) AS x(slug, code, module_order)
JOIN portal_programs p ON p.slug = x.slug
JOIN portal_modules m ON m.code = x.code
ON CONFLICT (program_id, module_id) DO UPDATE SET module_order = EXCLUDED.module_order;

INSERT INTO portal_cohorts (program_id, intake_id, name, starts_on, expected_graduation_on, status)
SELECT p.id, i.id, 'CNA Monthly Cohort 2026', '2026-06-10', '2026-10-10', 'active'
FROM portal_programs p JOIN portal_intakes i ON i.name = 'CNA Monthly Intake'
WHERE p.slug = 'cna'
ON CONFLICT (name) DO UPDATE SET starts_on = EXCLUDED.starts_on, expected_graduation_on = EXCLUDED.expected_graduation_on, status = EXCLUDED.status;

INSERT INTO portal_classes (cohort_id, name, trainer_user_id, room)
SELECT c.id, 'CNA Class A', u.id, 'Skills Lab 1'
FROM portal_cohorts c CROSS JOIN portal_users u
WHERE c.name = 'CNA Monthly Cohort 2026' AND u.email = 'admin@rhti.local'
ON CONFLICT (cohort_id, name) DO UPDATE SET trainer_user_id = EXCLUDED.trainer_user_id, room = EXCLUDED.room;

INSERT INTO portal_students (user_id, student_number, full_name, email, phone, status)
SELECT u.id, 'RHTI/CNA/2026/0001', u.full_name, u.email, u.phone, 'active'
FROM portal_users u WHERE u.email = 'student@rhti.local'
ON CONFLICT (student_number) DO UPDATE SET user_id = EXCLUDED.user_id, full_name = EXCLUDED.full_name, email = EXCLUDED.email, phone = EXCLUDED.phone, status = EXCLUDED.status;

INSERT INTO portal_student_enrollments (student_id, program_id, cohort_id, class_id, status)
SELECT s.id, p.id, c.id, cl.id, 'active'
FROM portal_students s
JOIN portal_programs p ON p.slug = 'cna'
JOIN portal_cohorts c ON c.name = 'CNA Monthly Cohort 2026'
JOIN portal_classes cl ON cl.cohort_id = c.id AND cl.name = 'CNA Class A'
WHERE s.student_number = 'RHTI/CNA/2026/0001'
ON CONFLICT (student_id, program_id, cohort_id) DO UPDATE SET class_id = EXCLUDED.class_id, status = EXCLUDED.status;

INSERT INTO portal_learning_resources (title, resource_type, url, description)
VALUES
  ('Admission Requirements', 'pdf', '/more/ADMISSION%20REQUIREMENTS.pdf', 'Official admission requirements PDF.'),
  ('CNA Fee Structure', 'pdf', '/more/NEW-CNA-FEE%20(1).pdf', 'CNA fee structure and program details.'),
  ('Student Orientation Checklist', 'policy', NULL, 'Onboarding checklist for newly admitted students.')
ON CONFLICT DO NOTHING;

INSERT INTO portal_resource_assignments (resource_id, program_id)
SELECT r.id, p.id
FROM portal_learning_resources r CROSS JOIN portal_programs p
WHERE r.title IN ('Admission Requirements', 'CNA Fee Structure') AND p.slug = 'cna'
ON CONFLICT DO NOTHING;

INSERT INTO portal_fee_structures (program_id, name, total_amount_kes)
SELECT id, 'CNA 2026 Fee Structure', 58000 FROM portal_programs WHERE slug = 'cna'
ON CONFLICT DO NOTHING;

INSERT INTO portal_invoices (student_id, invoice_number, description, amount_kes, status, due_on)
SELECT s.id, 'INV-CNA-2026-0001', 'CNA Tuition Fee', 58000, 'partially_paid', '2026-07-10'
FROM portal_students s WHERE s.student_number = 'RHTI/CNA/2026/0001'
ON CONFLICT (invoice_number) DO UPDATE SET amount_kes = EXCLUDED.amount_kes, status = EXCLUDED.status, due_on = EXCLUDED.due_on;

INSERT INTO portal_payments (student_id, invoice_id, receipt_number, amount_kes, method, reference)
SELECT s.id, i.id, 'RCT-CNA-2026-0001', 15000, 'manual', 'SEED-PAYMENT'
FROM portal_students s JOIN portal_invoices i ON i.student_id = s.id
WHERE s.student_number = 'RHTI/CNA/2026/0001'
ON CONFLICT (receipt_number) DO UPDATE SET amount_kes = EXCLUDED.amount_kes;

INSERT INTO portal_timetable_events (class_id, module_id, trainer_user_id, title, room, starts_at, ends_at)
SELECT cl.id, m.id, u.id, 'Basic Patient Care', 'Skills Lab 1', '2026-06-08 09:00+03', '2026-06-08 12:00+03'
FROM portal_classes cl
JOIN portal_modules m ON m.code = 'CNA101'
JOIN portal_users u ON u.email = 'admin@rhti.local'
WHERE cl.name = 'CNA Class A'
ON CONFLICT DO NOTHING;

INSERT INTO portal_assessments (module_id, cohort_id, title, assessment_type, max_score, weight_percent, exam_date, status)
SELECT m.id, c.id, 'CNA101 Continuous Assessment', 'CAT', 100, 40, '2026-07-15', 'published'
FROM portal_modules m CROSS JOIN portal_cohorts c
WHERE m.code = 'CNA101' AND c.name = 'CNA Monthly Cohort 2026'
ON CONFLICT DO NOTHING;

INSERT INTO portal_attachment_sites (name, location, contact_person, phone)
VALUES ('Radiant Group of Hospitals', 'Kasarani, Nairobi', 'Attachment Coordinator', '0712 588 588')
ON CONFLICT (name) DO UPDATE SET location = EXCLUDED.location, contact_person = EXCLUDED.contact_person, phone = EXCLUDED.phone;

INSERT INTO portal_request_categories (name, department_id)
SELECT x.name, d.id
FROM (VALUES ('Fee Payment Plan', 'Finance'), ('Document Request', 'Registrar'), ('Attachment Support', 'Attachment Office'), ('Result Query', 'Academics')) AS x(name, dept)
LEFT JOIN portal_departments d ON d.name = x.dept
ON CONFLICT (name) DO UPDATE SET department_id = EXCLUDED.department_id;

INSERT INTO portal_clearance_templates (program_id, name)
SELECT id, 'Standard CNA Clearance' FROM portal_programs WHERE slug = 'cna'
ON CONFLICT DO NOTHING;

INSERT INTO portal_clearance_checkpoints (template_id, department_id, title, checkpoint_order)
SELECT t.id, d.id, x.title, x.checkpoint_order
FROM portal_clearance_templates t
CROSS JOIN (VALUES ('Finance Clearance', 'Finance', 1), ('Library Clearance', 'Library', 2), ('Skills Lab Clearance', 'Skills Lab', 3), ('Registrar Final Clearance', 'Registrar', 4)) AS x(title, dept, checkpoint_order)
LEFT JOIN portal_departments d ON d.name = x.dept
WHERE t.name = 'Standard CNA Clearance'
ON CONFLICT DO NOTHING;

INSERT INTO portal_graduation_batches (name, ceremony_date, status)
VALUES ('RHTI Graduation 2026', '2026-12-12', 'planned')
ON CONFLICT (name) DO UPDATE SET ceremony_date = EXCLUDED.ceremony_date, status = EXCLUDED.status;
