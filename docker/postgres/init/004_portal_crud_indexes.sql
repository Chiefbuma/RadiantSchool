CREATE UNIQUE INDEX IF NOT EXISTS portal_fee_structures_program_name_idx
  ON portal_fee_structures (program_id, name);

CREATE UNIQUE INDEX IF NOT EXISTS portal_timetable_unique_event_idx
  ON portal_timetable_events (class_id, title, starts_at);

CREATE UNIQUE INDEX IF NOT EXISTS portal_assessments_unique_idx
  ON portal_assessments (module_id, cohort_id, title);

CREATE UNIQUE INDEX IF NOT EXISTS portal_clearance_templates_program_name_idx
  ON portal_clearance_templates (program_id, name);
