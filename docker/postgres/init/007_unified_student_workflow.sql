-- Database migration to unify onboarding and enrollment workflows,
-- implement auto-billing of tuition fees, and auto-initialize clearance.

-- 1. Alter portal_student_enrollments to add onboarding columns
ALTER TABLE portal_student_enrollments
  ADD COLUMN IF NOT EXISTS onboarding_status TEXT CHECK (onboarding_status IN ('pending', 'in_progress', 'completed', 'blocked', 'cancelled')) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS documents_status TEXT CHECK (documents_status IN ('pending', 'submitted', 'verified', 'rejected')) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS orientation_status TEXT CHECK (orientation_status IN ('pending', 'scheduled', 'completed')) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS policies_status TEXT CHECK (policies_status IN ('pending', 'accepted')) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS onboarding_notes TEXT;

-- 2. Migrate existing onboarding data
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'portal_student_onboarding') THEN
    UPDATE portal_student_enrollments e
    SET onboarding_status = o.status,
        documents_status = o.documents_status,
        orientation_status = o.orientation_status,
        policies_status = o.policies_status,
        onboarding_completed_at = o.completed_at,
        onboarding_notes = o.notes
    FROM portal_student_onboarding o
    WHERE o.student_id = e.student_id;
  END IF;
END $$;

-- 3. Drop references to onboarding table and drop the table
ALTER TABLE portal_student_enrollments DROP COLUMN IF EXISTS onboarding_id;
DROP TABLE IF EXISTS portal_student_onboarding;

-- 4. Create trigger function to automate student billing and clearance checkpoints
CREATE OR REPLACE FUNCTION fn_after_student_enrollment_upsert()
RETURNS TRIGGER AS $$
DECLARE
  v_program_slug TEXT;
  v_program_title TEXT;
  v_tuition_fee INTEGER;
  v_template_id BIGINT;
  v_checkpoint_id BIGINT;
  v_invoice_num TEXT;
BEGIN
  -- Retrieve program details
  SELECT slug, title, tuition_fee_kes
  INTO v_program_slug, v_program_title, v_tuition_fee
  FROM portal_programs
  WHERE id = NEW.program_id;

  -- 1. Automate Tuition Fee Invoicing
  IF v_tuition_fee > 0 THEN
    -- Check if student already has a tuition invoice for this program
    IF NOT EXISTS (
      SELECT 1 FROM portal_invoices
      WHERE student_id = NEW.student_id
        AND (description = 'Tuition Fee' OR description LIKE '%' || v_program_title || '%')
    ) THEN
      v_invoice_num := 'INV-' || upper(v_program_slug) || '-' || to_char(now(), 'YYYY') || '-' || lpad(NEW.student_id::text, 4, '0');
      
      -- Ensure uniqueness in case ID overlaps
      IF EXISTS (SELECT 1 FROM portal_invoices WHERE invoice_number = v_invoice_num) THEN
        v_invoice_num := v_invoice_num || '-' || to_char(now(), 'HH24MISS');
      END IF;

      INSERT INTO portal_invoices (student_id, invoice_number, description, amount_kes, status, due_on, created_at)
      VALUES (
        NEW.student_id,
        v_invoice_num,
        'Tuition Fee - ' || v_program_title,
        v_tuition_fee,
        'unpaid',
        CURRENT_DATE + INTERVAL '30 days',
        NOW()
      );
    END IF;
  END IF;

  -- 2. Automate Clearance Checkpoints Initialization
  SELECT id INTO v_template_id
  FROM portal_clearance_templates
  WHERE program_id = NEW.program_id
  LIMIT 1;

  IF v_template_id IS NOT NULL THEN
    FOR v_checkpoint_id IN
      SELECT id FROM portal_clearance_checkpoints WHERE template_id = v_template_id
    LOOP
      INSERT INTO portal_student_clearance (student_id, checkpoint_id, status)
      VALUES (NEW.student_id, v_checkpoint_id, 'pending')
      ON CONFLICT (student_id, checkpoint_id) DO NOTHING;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Attach trigger to portal_student_enrollments
DROP TRIGGER IF EXISTS trg_after_student_enrollment_upsert ON portal_student_enrollments;
CREATE TRIGGER trg_after_student_enrollment_upsert
AFTER INSERT OR UPDATE ON portal_student_enrollments
FOR EACH ROW
EXECUTE FUNCTION fn_after_student_enrollment_upsert();
