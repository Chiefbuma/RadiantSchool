CREATE TABLE IF NOT EXISTS rhti_profile (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  tagline TEXT NOT NULL,
  established_month TEXT,
  established_year INTEGER,
  about TEXT NOT NULL,
  vision TEXT NOT NULL,
  mission TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rhti_core_values (
  id BIGSERIAL PRIMARY KEY,
  value TEXT NOT NULL UNIQUE,
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS rhti_contacts (
  id BIGSERIAL PRIMARY KEY,
  contact_type TEXT NOT NULL,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE (contact_type, value)
);

CREATE TABLE IF NOT EXISTS rhti_social_profiles (
  id BIGSERIAL PRIMARY KEY,
  platform TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS rhti_programs (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  duration TEXT NOT NULL,
  entry_requirements TEXT NOT NULL,
  tuition_fee_kes INTEGER NOT NULL,
  overview TEXT NOT NULL,
  pdf_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rhti_intakes (
  id BIGSERIAL PRIMARY KEY,
  program_id BIGINT REFERENCES rhti_programs(id) ON DELETE CASCADE,
  intake_month TEXT NOT NULL,
  note TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE (program_id, intake_month)
);

CREATE TABLE IF NOT EXISTS rhti_study_reasons (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS rhti_documents (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL UNIQUE,
  document_type TEXT NOT NULL,
  program_id BIGINT REFERENCES rhti_programs(id) ON DELETE SET NULL,
  url TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS rhti_knowledge_base (
  id BIGSERIAL PRIMARY KEY,
  topic TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'website',
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS chat_session_id TEXT;

CREATE INDEX IF NOT EXISTS rhti_knowledge_keywords_idx ON rhti_knowledge_base USING GIN (keywords);
CREATE INDEX IF NOT EXISTS chat_messages_session_idx ON chat_messages (session_id, created_at);

DELETE FROM rhti_knowledge_base duplicate
USING rhti_knowledge_base original
WHERE duplicate.id > original.id
  AND duplicate.topic = original.topic
  AND duplicate.question = original.question;

CREATE UNIQUE INDEX IF NOT EXISTS rhti_knowledge_topic_question_idx
  ON rhti_knowledge_base (topic, question);

INSERT INTO rhti_profile (name, tagline, established_month, established_year, about, vision, mission)
VALUES (
  'Radiant Hospital Training Institute',
  'Educating Hearts and Minds for Health',
  'January',
  2023,
  'Radiant Hospital Training Institute (RHTI) is a premier healthcare training institution dedicated to equipping students with the knowledge, skills, and practical experience necessary to succeed in the healthcare industry. RHTI blends modern theoretical instruction with hands-on, consultative, and interactive training methods, supported by qualified and certified trainers, a modern library, a technology centre, and after-school support programs.',
  'To be a leading academic health center by producing highly skilled and competent graduates who will drive excellence in the healthcare industry.',
  'To cultivate a culture of learning among our students by imparting the knowledge, skills, and qualities essential for delivering quality patient care.'
)
ON CONFLICT (name) DO UPDATE SET
  tagline = EXCLUDED.tagline,
  established_month = EXCLUDED.established_month,
  established_year = EXCLUDED.established_year,
  about = EXCLUDED.about,
  vision = EXCLUDED.vision,
  mission = EXCLUDED.mission,
  updated_at = NOW();

INSERT INTO rhti_core_values (value, display_order) VALUES
  ('Communication', 1),
  ('Efficiency and Effectiveness', 2),
  ('Teamwork', 3),
  ('Professionalism', 4),
  ('Integrity', 5)
ON CONFLICT (value) DO UPDATE SET display_order = EXCLUDED.display_order;

INSERT INTO rhti_contacts (contact_type, label, value, display_order) VALUES
  ('address', 'Postal Address', 'P.O Box 63683 - 00607, Kasarani, Nairobi, Kenya', 1),
  ('location', 'Campus Location', 'Radiant Hospital - Kasarani Sportsview Branch, Kasarani, Nairobi', 2),
  ('phone', 'Admissions Mobile', '0712 588 588', 3),
  ('email', 'Admissions Email', 'radianthospitaltraininginstltd@gmail.com', 4),
  ('email', 'RHTI Email', 'rhti@radianthospitals.org', 5)
ON CONFLICT (contact_type, value) DO UPDATE SET label = EXCLUDED.label, display_order = EXCLUDED.display_order;

INSERT INTO rhti_social_profiles (platform, url, display_order) VALUES
  ('Facebook', 'https://facebook.com/radianthospitaltraininginstitute/', 1),
  ('X', 'https://x.com/rhti_college', 2),
  ('Instagram', 'https://instagram.com/rhti_college/', 3),
  ('Threads', 'https://threads.com/@rhti_college', 4),
  ('LinkedIn', 'https://linkedin.com/company/rhticollege', 5),
  ('TikTok', 'https://tiktok.com/@rhticollege', 6),
  ('YouTube', 'https://youtube.com/@rghinstitute', 7)
ON CONFLICT (platform) DO UPDATE SET url = EXCLUDED.url, display_order = EXCLUDED.display_order;

INSERT INTO rhti_programs (slug, title, duration, entry_requirements, tuition_fee_kes, overview, pdf_url, display_order) VALUES
  (
    'cna',
    'Certificate in Certified Nursing Assistant (CNA)',
    'Four (4) Months',
    'KCSE Mean Grade of D (Plain) and Above',
    58000,
    'This program equips students with foundational skills needed to provide compassionate, competent basic patient care under the supervision of registered nurses and medical professionals. Students cover essential nursing practices, patient hygiene, vital signs monitoring, safe patient handling, and effective communication through classroom and practical training.',
    '/more/NEW-CNA-FEE%20(1).pdf',
    1
  ),
  (
    'dental',
    'Certificate in Dental Assistant',
    'Nine (9) Months',
    'KCSE Mean Grade of D (Plain) and Above',
    95000,
    'This program trains students to support dental professionals in a clinical setting, including chairside assisting, dental instrument sterilization and maintenance, dental radiography, oral health education, infection control protocols, and basic dental office administration.',
    '/more/NEW-DENTAL-ASSISTANT-FEE.pdf',
    2
  ),
  (
    'hrit',
    'Certificate in Health Records and IT (HRIT)',
    'Eighteen (18) Months',
    'KCSE Mean Grade of C- and Above',
    161900,
    'This program prepares students to manage health information in modern healthcare environments, including medical coding, patient data management, electronic health records systems, healthcare information laws and ethics, and health data quality assurance.',
    '/more/NEW-HEALTH-RECORDS---FEE.pdf',
    3
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  duration = EXCLUDED.duration,
  entry_requirements = EXCLUDED.entry_requirements,
  tuition_fee_kes = EXCLUDED.tuition_fee_kes,
  overview = EXCLUDED.overview,
  pdf_url = EXCLUDED.pdf_url,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

INSERT INTO rhti_intakes (program_id, intake_month, note, display_order)
SELECT p.id, month_name, note, m.display_order
FROM rhti_programs p
CROSS JOIN (
  VALUES
    ('January', 'General RHTI intake', 1),
    ('March', 'General RHTI intake', 2),
    ('June', 'General RHTI intake', 3),
    ('September', 'General RHTI intake', 4)
) AS m(month_name, note, display_order)
WHERE p.slug IN ('dental', 'hrit')
ON CONFLICT (program_id, intake_month) DO UPDATE SET note = EXCLUDED.note, display_order = EXCLUDED.display_order;

INSERT INTO rhti_intakes (program_id, intake_month, note, display_order)
SELECT p.id, 'Monthly', 'The CNA program admits new students every month.', 1
FROM rhti_programs p
WHERE p.slug = 'cna'
ON CONFLICT (program_id, intake_month) DO UPDATE SET note = EXCLUDED.note, display_order = EXCLUDED.display_order;

INSERT INTO rhti_study_reasons (title, description, display_order) VALUES
  ('Flexible Fee Payment', 'RHTI offers flexible payment plans to make education accessible to students.', 1),
  ('Guaranteed Hospital Attachment', 'All students are guaranteed hands-on practical training through hospital attachments at the Radiant Group of Hospitals.', 2),
  ('Expert Trainers', 'Programs are delivered by qualified and certified healthcare professionals with real-world experience.', 3),
  ('Modern Facilities', 'Students learn in an environment equipped with a modern library, technology centre, and well-resourced training labs.', 4)
ON CONFLICT (title) DO UPDATE SET description = EXCLUDED.description, display_order = EXCLUDED.display_order;

INSERT INTO rhti_documents (title, document_type, program_id, url)
SELECT 'Admission Requirements', 'admissions', NULL, '/more/ADMISSION%20REQUIREMENTS.pdf'
ON CONFLICT (title) DO UPDATE SET document_type = EXCLUDED.document_type, url = EXCLUDED.url;

INSERT INTO rhti_documents (title, document_type, program_id, url)
SELECT 'CNA Fee Structure', 'fee_structure', p.id, p.pdf_url FROM rhti_programs p WHERE p.slug = 'cna'
ON CONFLICT (title) DO UPDATE SET document_type = EXCLUDED.document_type, program_id = EXCLUDED.program_id, url = EXCLUDED.url;

INSERT INTO rhti_documents (title, document_type, program_id, url)
SELECT 'Dental Assistant Fee Structure', 'fee_structure', p.id, p.pdf_url FROM rhti_programs p WHERE p.slug = 'dental'
ON CONFLICT (title) DO UPDATE SET document_type = EXCLUDED.document_type, program_id = EXCLUDED.program_id, url = EXCLUDED.url;

INSERT INTO rhti_documents (title, document_type, program_id, url)
SELECT 'Health Records and IT Fee Structure', 'fee_structure', p.id, p.pdf_url FROM rhti_programs p WHERE p.slug = 'hrit'
ON CONFLICT (title) DO UPDATE SET document_type = EXCLUDED.document_type, program_id = EXCLUDED.program_id, url = EXCLUDED.url;

INSERT INTO rhti_knowledge_base (topic, question, answer, keywords, display_order) VALUES
  ('about', 'What is RHTI?', 'Radiant Hospital Training Institute is a premier healthcare training institution established in January 2023. It equips students with healthcare knowledge, practical skills, and hands-on experience through modern instruction, certified trainers, and hospital-based exposure.', ARRAY['about','profile','rhti','radiant','institution','established'], 1),
  ('programs', 'Which programs does RHTI offer?', 'RHTI offers Certificate in Certified Nursing Assistant (CNA), Certificate in Dental Assistant, and Certificate in Health Records and IT (HRIT).', ARRAY['program','programs','course','courses','certificate','offer'], 2),
  ('fees', 'What are the tuition fees?', 'Current tuition fees are: CNA - KSh. 58,000; Dental Assistant - KSh. 95,000; Health Records and IT - KSh. 161,900.', ARRAY['fee','fees','tuition','cost','price','pay','payment'], 3),
  ('requirements', 'What are the entry requirements?', 'CNA and Dental Assistant require KCSE Mean Grade D (Plain) and above. Health Records and IT requires KCSE Mean Grade C- and above.', ARRAY['requirement','requirements','entry','kcse','grade','qualify'], 4),
  ('intakes', 'When are the intakes?', 'RHTI admits students in January, March, June, and September. The CNA program admits new students every month.', ARRAY['intake','intakes','admission','admissions','january','march','june','september','monthly'], 5),
  ('attachments', 'Does RHTI offer hospital attachment?', 'Yes. All students are guaranteed hands-on practical training through hospital attachments at the Radiant Group of Hospitals.', ARRAY['attachment','attachments','hospital','practical','training','clinical'], 6),
  ('contact', 'How can I contact RHTI?', 'You can call admissions on 0712 588 588 or email rhti@radianthospitals.org. RHTI is located at Radiant Hospital - Kasarani Sportsview Branch, Kasarani, Nairobi.', ARRAY['contact','phone','call','email','location','address','where'], 7),
  ('apply', 'How do I apply?', 'You can apply online through the website application form or submit your details in this chat. Admissions will follow up with you.', ARRAY['apply','application','submit','join','enroll','enrol','admission'], 8),
  ('socials', 'Where can I find RHTI on social media?', 'RHTI is on Facebook, X, Instagram, Threads, LinkedIn, TikTok, and YouTube using the official links listed on the website.', ARRAY['social','facebook','instagram','twitter','x','threads','linkedin','tiktok','youtube'], 9)
ON CONFLICT (topic, question) DO UPDATE SET
  answer = EXCLUDED.answer,
  keywords = EXCLUDED.keywords,
  display_order = EXCLUDED.display_order;
