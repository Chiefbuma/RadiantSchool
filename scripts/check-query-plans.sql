\set ON_ERROR_STOP on
BEGIN;
SET LOCAL statement_timeout='3s';

-- Exercise the principal queue and student-ledger access paths. PostgreSQL may
-- choose a sequential scan for tiny seed tables; these checks enforce bounded
-- execution and verify the production indexes exist for realistic volumes.
DO $$
DECLARE missing text;
BEGIN
  SELECT string_agg(required.name,', ') INTO missing
  FROM (VALUES
    ('applications_review_queue_idx'),
    ('enrollment_roster_idx'),
    ('portal_invoices_student_idx'),
    ('payments_reconciliation_idx'),
    ('audit_student_timeline_idx'),
    ('idx_payment_claims_review_queue'),
    ('idx_payment_claims_student')
  ) required(name)
  LEFT JOIN pg_indexes i ON i.schemaname='public' AND i.indexname=required.name
  WHERE i.indexname IS NULL;
  IF missing IS NOT NULL THEN RAISE EXCEPTION 'Missing performance indexes: %',missing; END IF;
END $$;

EXPLAIN (ANALYZE,BUFFERS,TIMING OFF) SELECT * FROM applications WHERE deleted_at IS NULL AND status='new' ORDER BY created_at DESC LIMIT 25;
EXPLAIN (ANALYZE,BUFFERS,TIMING OFF) SELECT * FROM portal_invoices WHERE student_id=1 AND deleted_at IS NULL ORDER BY created_at DESC;
EXPLAIN (ANALYZE,BUFFERS,TIMING OFF) SELECT * FROM portal_payment_claims WHERE status='submitted' ORDER BY submitted_at LIMIT 25;
ROLLBACK;
