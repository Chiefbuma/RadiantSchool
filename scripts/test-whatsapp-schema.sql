\set ON_ERROR_STOP on
BEGIN;
DO $$
DECLARE app_id bigint; jobs integer;
BEGIN
  INSERT INTO applications(full_name,email,phone,program,program_id,kcse_mean_grade,kcse_year,status,source)
  SELECT 'WhatsApp Workflow Test','whatsapp-workflow-test@rhti.invalid','254700999999',p.slug,p.id,'D',2025,'new','whatsapp' FROM portal_programs p WHERE p.slug='cna' RETURNING id INTO app_id;
  UPDATE applications SET status='under_review' WHERE id=app_id;
  SELECT count(*) INTO jobs FROM portal_whatsapp_outbox WHERE application_id=app_id AND message_kind='status_update';
  IF jobs<>1 THEN RAISE EXCEPTION 'Expected one idempotent WhatsApp status job, got %',jobs; END IF;
  UPDATE applications SET notes='Unrelated update' WHERE id=app_id;
  SELECT count(*) INTO jobs FROM portal_whatsapp_outbox WHERE application_id=app_id;
  IF jobs<>1 THEN RAISE EXCEPTION 'Unrelated update duplicated WhatsApp outbox event'; END IF;
END $$;
ROLLBACK;
SELECT 'school WhatsApp schema and outbox verified' result;
