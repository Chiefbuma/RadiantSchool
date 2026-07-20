CREATE TABLE IF NOT EXISTS school_portal_collections (
  name text PRIMARY KEY,
  data jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS school_portal_collections_updated_at_idx
  ON school_portal_collections (updated_at DESC);
