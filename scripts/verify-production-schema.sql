\set ON_ERROR_STOP on
DO $$
DECLARE missing text;
BEGIN
  SELECT string_agg(name, ', ') INTO missing FROM (VALUES
    ('portal_students'),('portal_student_enrollments'),('portal_student_holds'),('portal_invoice_items'),
    ('portal_payment_allocations'),('portal_grading_schemes'),('portal_module_results'),
    ('portal_attachment_logbook_entries'),('portal_attachment_evaluations'),('portal_clearance_decisions'),
    ('portal_credentials'),('portal_idempotency_keys'),('portal_notifications'),('portal_audit_logs')
  ) required(name) WHERE to_regclass('public.'||name) IS NULL;
  IF missing IS NOT NULL THEN RAISE EXCEPTION 'Missing production tables: %',missing; END IF;

  IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE indexname='one_active_enrollment_per_student_idx') THEN RAISE EXCEPTION 'Missing active enrollment invariant'; END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE indexname='payment_reference_uidx') THEN RAISE EXCEPTION 'Missing payment reference uniqueness'; END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgname='portal_audit_immutable' AND tgenabled='O') THEN RAISE EXCEPTION 'Audit immutability trigger is disabled'; END IF;
  IF NOT EXISTS(SELECT 1 FROM portal_permissions WHERE permission_key='certificate.issue') THEN RAISE EXCEPTION 'RBAC seed incomplete'; END IF;
END $$;

BEGIN;
DO $$
BEGIN
  BEGIN
    UPDATE portal_audit_logs SET action='tampered' WHERE id=(SELECT min(id) FROM portal_audit_logs);
    IF FOUND THEN RAISE EXCEPTION 'Audit mutation unexpectedly succeeded'; END IF;
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM NOT LIKE '%append-only%' THEN RAISE; END IF;
  END;
END $$;
ROLLBACK;

SELECT 'production schema verified' AS result;
