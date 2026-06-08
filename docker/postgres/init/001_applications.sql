CREATE TABLE IF NOT EXISTS applications (
  id BIGSERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  date_of_birth DATE,
  program TEXT NOT NULL,
  kcse_mean_grade TEXT,
  kcse_year INTEGER,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS applications_status_idx ON applications (status);
CREATE INDEX IF NOT EXISTS applications_created_at_idx ON applications (created_at DESC);
