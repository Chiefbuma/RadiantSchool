import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import {
  Banknote,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  GraduationCap,
  LibraryBig,
  UserRound,
} from "lucide-react";
import type { ReactNode } from "react";

type Option = { id: string; label: string };

async function updateStudentProfile(studentId: string, formData: FormData) {
  "use server";
  const user = await requireUser("portal.admin");

  await query(
    `UPDATE portal_students
     SET full_name = $2,
         phone = $3,
         email = $4,
         date_of_birth = NULLIF($5,'')::date,
         gender = $6,
         national_id = NULLIF($7,''),
         residence = NULLIF($8,''),
         next_of_kin_name = NULLIF($9,''),
         next_of_kin_phone = NULLIF($10,''),
         next_of_kin_relationship = NULLIF($11,''),
         status = $12,
         updated_at = NOW()
     WHERE id = $1`,
    [
      studentId,
      String(formData.get("full_name") ?? ""),
      String(formData.get("phone") ?? ""),
      String(formData.get("email") ?? ""),
      String(formData.get("date_of_birth") ?? ""),
      String(formData.get("gender") ?? "Not Provided"),
      String(formData.get("national_id") ?? ""),
      String(formData.get("residence") ?? ""),
      String(formData.get("next_of_kin_name") ?? ""),
      String(formData.get("next_of_kin_phone") ?? ""),
      String(formData.get("next_of_kin_relationship") ?? ""),
      String(formData.get("status") ?? "active"),
    ]
  );

  await query("INSERT INTO portal_audit_logs (user_id, action, entity_type, entity_id) VALUES ($1, 'student.profile_updated', 'portal_students', $2)", [user.id, studentId]);
  revalidatePath(`/portal/admin/students/${studentId}`);
}

async function assignEnrollment(studentId: string, formData: FormData) {
  "use server";
  const user = await requireUser("portal.admin");
  const enrollmentId = String(formData.get("enrollment_id") ?? "");

  if (enrollmentId) {
    await query(
      `UPDATE portal_student_enrollments
       SET program_id = NULLIF($2,'')::bigint,
           cohort_id = NULLIF($3,'')::bigint,
           class_id = NULLIF($4,'')::bigint,
           status = $5
       WHERE id = $1 AND student_id = $6`,
      [
        enrollmentId,
        String(formData.get("program_id") ?? ""),
        String(formData.get("cohort_id") ?? ""),
        String(formData.get("class_id") ?? ""),
        String(formData.get("status") ?? "active"),
        studentId,
      ]
    );
  } else {
    await query(
      `INSERT INTO portal_student_enrollments (student_id, program_id, cohort_id, class_id, status)
       VALUES ($1, NULLIF($2,'')::bigint, NULLIF($3,'')::bigint, NULLIF($4,'')::bigint, $5)`,
      [
        studentId,
        String(formData.get("program_id") ?? ""),
        String(formData.get("cohort_id") ?? ""),
        String(formData.get("class_id") ?? ""),
        String(formData.get("status") ?? "active"),
      ]
    );
  }

  await query("INSERT INTO portal_audit_logs (user_id, action, entity_type, entity_id) VALUES ($1, 'student.enrollment_assigned', 'portal_students', $2)", [user.id, studentId]);
  revalidatePath(`/portal/admin/students/${studentId}`);
}

async function updateOnboarding(studentId: string, formData: FormData) {
  "use server";
  const user = await requireUser("portal.admin");

  await query(
    `INSERT INTO portal_student_onboarding (student_id, enrollment_id, status, documents_status, orientation_status, policies_status, notes)
     VALUES ($1, NULLIF($2,'')::bigint, $3, $4, $5, $6, $7)
     ON CONFLICT (student_id) DO UPDATE SET
       enrollment_id = EXCLUDED.enrollment_id,
       status = EXCLUDED.status,
       documents_status = EXCLUDED.documents_status,
       orientation_status = EXCLUDED.orientation_status,
       policies_status = EXCLUDED.policies_status,
       notes = EXCLUDED.notes,
       completed_at = CASE WHEN EXCLUDED.status = 'completed' THEN NOW() ELSE portal_student_onboarding.completed_at END`,
    [
      studentId,
      String(formData.get("enrollment_id") ?? ""),
      String(formData.get("status") ?? "pending"),
      String(formData.get("documents_status") ?? "pending"),
      String(formData.get("orientation_status") ?? "pending"),
      String(formData.get("policies_status") ?? "pending"),
      String(formData.get("notes") ?? ""),
    ]
  );

  await query("INSERT INTO portal_audit_logs (user_id, action, entity_type, entity_id) VALUES ($1, 'student.onboarding_updated', 'portal_students', $2)", [user.id, studentId]);
  revalidatePath(`/portal/admin/students/${studentId}`);
}

async function assignResource(studentId: string, formData: FormData) {
  "use server";
  const user = await requireUser("portal.admin");

  await query(
    `INSERT INTO portal_resource_assignments (resource_id, student_id)
     VALUES (NULLIF($1,'')::bigint, $2)`,
    [String(formData.get("resource_id") ?? ""), studentId]
  );

  await query("INSERT INTO portal_audit_logs (user_id, action, entity_type, entity_id) VALUES ($1, 'student.resource_assigned', 'portal_students', $2)", [user.id, studentId]);
  revalidatePath(`/portal/admin/students/${studentId}`);
}

async function createInvoice(studentId: string, formData: FormData) {
  "use server";
  const user = await requireUser("portal.admin");

  await query(
    `INSERT INTO portal_invoices (student_id, invoice_number, description, amount_kes, status, due_on)
     VALUES ($1, $2, $3, NULLIF($4,'')::int, $5, NULLIF($6,'')::date)`,
    [
      studentId,
      String(formData.get("invoice_number") ?? ""),
      String(formData.get("description") ?? ""),
      String(formData.get("amount_kes") ?? ""),
      String(formData.get("status") ?? "unpaid"),
      String(formData.get("due_on") ?? ""),
    ]
  );

  await query("INSERT INTO portal_audit_logs (user_id, action, entity_type, entity_id) VALUES ($1, 'student.invoice_created', 'portal_students', $2)", [user.id, studentId]);
  revalidatePath(`/portal/admin/students/${studentId}`);
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-dark/50">{label}</span>
      {children}
    </label>
  );
}

function inputClass() {
  return "portal-field";
}

function Panel({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="portal-card p-5">
      <div className="mb-4 flex items-center gap-3 border-b border-dark/5 pb-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">{icon}</div>
        <h2 className="m-0 text-base font-bold text-dark">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function SelectField({ name, defaultValue, options }: { name: string; defaultValue?: string | null; options: Option[] }) {
  return (
    <select name={name} defaultValue={defaultValue ?? ""} className={inputClass()}>
      <option value="">Select</option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>{option.label}</option>
      ))}
    </select>
  );
}

export default async function AdminStudentDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser("portal.admin");
  const { id } = await params;

  const studentResult = await query<{
    id: string;
    user_id: string | null;
    student_number: string;
    full_name: string;
    email: string | null;
    phone: string | null;
    date_of_birth: string | null;
    gender: string | null;
    national_id: string | null;
    residence: string | null;
    next_of_kin_name: string | null;
    next_of_kin_phone: string | null;
    next_of_kin_relationship: string | null;
    status: string;
  }>(
    `SELECT id::text, user_id::text, student_number, full_name, email, phone, date_of_birth::text, gender,
      national_id, residence, next_of_kin_name, next_of_kin_phone, next_of_kin_relationship, status
     FROM portal_students
     WHERE id = $1`,
    [id]
  );

  const student = studentResult.rows[0];
  if (!student) notFound();

  const enrollmentResult = await query<{
    id: string;
    program_id: string;
    cohort_id: string;
    class_id: string | null;
    program: string;
    cohort: string;
    class: string | null;
    status: string;
  }>(
    `SELECT e.id::text, e.program_id::text, e.cohort_id::text, e.class_id::text, p.title AS program,
      c.name AS cohort, cl.name AS class, e.status
     FROM portal_student_enrollments e
     JOIN portal_programs p ON p.id = e.program_id
     JOIN portal_cohorts c ON c.id = e.cohort_id
     LEFT JOIN portal_classes cl ON cl.id = e.class_id
     WHERE e.student_id = $1
     ORDER BY e.enrolled_on DESC, e.id DESC
     LIMIT 1`,
    [id]
  );

  const enrollment = enrollmentResult.rows[0] ?? null;
  const programId = enrollment?.program_id ?? null;
  const cohortId = enrollment?.cohort_id ?? null;
  const classId = enrollment?.class_id ?? null;

  const [
    programs,
    cohorts,
    classes,
    modules,
    resources,
    assignedResources,
    timetable,
    exams,
    results,
    invoices,
    onboardingResult,
    clearance,
    graduation,
  ] = await Promise.all([
    query<Option>("SELECT id::text, title AS label FROM portal_programs WHERE status <> 'archived' ORDER BY title"),
    query<Option>(
      `SELECT c.id::text, c.name || ' - ' || p.title AS label
       FROM portal_cohorts c
       JOIN portal_programs p ON p.id = c.program_id
       WHERE ($1::bigint IS NULL OR c.program_id = $1::bigint)
       ORDER BY c.starts_on DESC`,
      [programId]
    ),
    query<Option>(
      `SELECT cl.id::text, cl.name || ' - ' || c.name AS label
       FROM portal_classes cl
       JOIN portal_cohorts c ON c.id = cl.cohort_id
       WHERE ($1::bigint IS NULL OR c.program_id = $1::bigint)
       ORDER BY cl.name`,
      [programId]
    ),
    query<{ code: string; title: string; description: string | null }>(
      `SELECT m.code, m.title, m.description
       FROM portal_modules m
       JOIN portal_program_modules pm ON pm.module_id = m.id
       WHERE pm.program_id = $1
       ORDER BY pm.module_order`,
      [programId]
    ),
    query<Option>(
      `SELECT DISTINCT r.id::text, r.title || ' (' || r.resource_type || ')' AS label
       FROM portal_learning_resources r
       LEFT JOIN portal_resource_assignments ra ON ra.resource_id = r.id
       WHERE $1::bigint IS NULL
          OR ra.program_id = $1::bigint
          OR ra.cohort_id = $2::bigint
          OR ra.class_id = $3::bigint
          OR ra.module_id IN (SELECT module_id FROM portal_program_modules WHERE program_id = $1::bigint)
          OR ra.resource_id IS NULL
       ORDER BY label`,
      [programId, cohortId, classId]
    ),
    query<{ title: string; resource_type: string; url: string | null; source: string }>(
      `SELECT DISTINCT r.title, r.resource_type, r.url,
        CASE
          WHEN ra.student_id = $1 THEN 'Student'
          WHEN ra.class_id IS NOT NULL THEN 'Class'
          WHEN ra.cohort_id IS NOT NULL THEN 'Cohort'
          WHEN ra.program_id IS NOT NULL THEN 'Program'
          WHEN ra.module_id IS NOT NULL THEN 'Module'
          ELSE 'General'
        END AS source
       FROM portal_learning_resources r
       JOIN portal_resource_assignments ra ON ra.resource_id = r.id
       WHERE ra.student_id = $1
          OR ra.class_id = $2
          OR ra.cohort_id = $3
          OR ra.program_id = $4
          OR ra.module_id IN (SELECT module_id FROM portal_program_modules WHERE program_id = $4)
       ORDER BY r.title`,
      [id, classId, cohortId, programId]
    ),
    query<{ title: string; room: string | null; starts_at: string; ends_at: string }>(
      "SELECT title, room, starts_at::text, ends_at::text FROM portal_timetable_events WHERE class_id = $1 ORDER BY starts_at LIMIT 10",
      [classId]
    ),
    query<{ id: string; title: string; module: string; assessment_type: string; exam_date: string | null; status: string }>(
      `SELECT a.id::text, a.title, m.title AS module, a.assessment_type, a.exam_date::text, a.status
       FROM portal_assessments a
       JOIN portal_modules m ON m.id = a.module_id
       WHERE ($1::bigint IS NOT NULL AND a.class_id = $1::bigint)
          OR ($2::bigint IS NOT NULL AND a.cohort_id = $2::bigint)
       ORDER BY a.exam_date DESC NULLS LAST`,
      [classId, cohortId]
    ),
    query<{ assessment: string; module: string; score: string; status: string }>(
      `SELECT a.title AS assessment, m.title AS module, mark.score::text, mark.status
       FROM portal_marks mark
       JOIN portal_assessments a ON a.id = mark.assessment_id
       JOIN portal_modules m ON m.id = a.module_id
       WHERE mark.student_id = $1
       ORDER BY mark.updated_at DESC`,
      [id]
    ),
    query<{ invoice_number: string; description: string; amount_kes: number; paid_kes: number; balance_kes: number; status: string }>(
      `SELECT i.invoice_number, i.description, i.amount_kes, COALESCE(sum(p.amount_kes), 0)::int AS paid_kes,
        (i.amount_kes - COALESCE(sum(p.amount_kes), 0))::int AS balance_kes, i.status
       FROM portal_invoices i
       LEFT JOIN portal_payments p ON p.invoice_id = i.id
       WHERE i.student_id = $1
       GROUP BY i.id
       ORDER BY i.created_at DESC`,
      [id]
    ),
    query<{ status: string; documents_status: string; orientation_status: string; policies_status: string; notes: string | null }>(
      "SELECT status, documents_status, orientation_status, policies_status, notes FROM portal_student_onboarding WHERE student_id = $1 LIMIT 1",
      [id]
    ),
    query<{ checkpoint: string; department: string | null; status: string }>(
      `SELECT cc.title AS checkpoint, d.name AS department, COALESCE(sc.status, 'pending') AS status
       FROM portal_clearance_checkpoints cc
       JOIN portal_clearance_templates ct ON ct.id = cc.template_id
       LEFT JOIN portal_departments d ON d.id = cc.department_id
       LEFT JOIN portal_student_clearance sc ON sc.checkpoint_id = cc.id AND sc.student_id = $1
       WHERE $2::bigint IS NOT NULL AND ct.program_id = $2::bigint
       ORDER BY cc.checkpoint_order`,
      [id, programId]
    ),
    query<{ batch: string; status: string }>(
      `SELECT b.name AS batch, gc.status
       FROM portal_graduation_candidates gc
       JOIN portal_graduation_batches b ON b.id = gc.batch_id
       WHERE gc.student_id = $1
       ORDER BY b.ceremony_date DESC NULLS LAST`,
      [id]
    ),
  ]);

  const onboarding = onboardingResult.rows[0] ?? {
    status: "pending",
    documents_status: "pending",
    orientation_status: "pending",
    policies_status: "pending",
    notes: "",
  };
  const profileAction = updateStudentProfile.bind(null, id);
  const enrollmentAction = assignEnrollment.bind(null, id);
  const onboardingAction = updateOnboarding.bind(null, id);
  const resourceAction = assignResource.bind(null, id);
  const invoiceAction = createInvoice.bind(null, id);
  const totalBalance = invoices.rows.reduce((sum, invoice) => sum + Number(invoice.balance_kes), 0);

  return (
    <div className="portal-page space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-dark/10 pb-5 lg:flex-row lg:items-end">
        <div>
          <a href="/portal/admin/students" className="text-xs font-black uppercase tracking-widest text-primary">Back to Students</a>
          <h1 className="mt-2 text-2xl font-bold text-dark md:text-3xl">{student.full_name}</h1>
          <p className="mt-2 text-sm text-dark/60">{student.student_number} · {enrollment?.program ?? "No program assigned"} · {student.status}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-right">
          <div className="bg-dark px-5 py-4 text-white">
            <p className="m-0 text-[10px] font-black uppercase tracking-widest text-white/50">Onboarding</p>
            <p className="m-0 text-xl font-black">{onboarding.status}</p>
          </div>
          <div className="bg-primary px-5 py-4 text-white">
            <p className="m-0 text-[10px] font-black uppercase tracking-widest text-white/70">Balance</p>
            <p className="m-0 text-xl font-black">KSh. {totalBalance.toLocaleString("en-KE")}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div className="space-y-6">
          <Panel title="Registration Profile" icon={<UserRound size={20} />}>
            <form action={profileAction} className="grid gap-4">
              <Field label="Full Name"><input name="full_name" defaultValue={student.full_name} className={inputClass()} required /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Email"><input name="email" defaultValue={student.email ?? ""} className={inputClass()} required /></Field>
                <Field label="Phone"><input name="phone" defaultValue={student.phone ?? ""} className={inputClass()} required /></Field>
                <Field label="Date of Birth"><input type="date" name="date_of_birth" defaultValue={student.date_of_birth ?? ""} className={inputClass()} /></Field>
                <Field label="Gender">
                  <select name="gender" defaultValue={student.gender ?? "Not Provided"} className={inputClass()}>
                    <option>Female</option>
                    <option>Male</option>
                    <option>Not Provided</option>
                  </select>
                </Field>
                <Field label="National ID"><input name="national_id" defaultValue={student.national_id ?? ""} className={inputClass()} /></Field>
                <Field label="Residence"><input name="residence" defaultValue={student.residence ?? ""} className={inputClass()} /></Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Next of Kin"><input name="next_of_kin_name" defaultValue={student.next_of_kin_name ?? ""} className={inputClass()} /></Field>
                <Field label="Kin Phone"><input name="next_of_kin_phone" defaultValue={student.next_of_kin_phone ?? ""} className={inputClass()} /></Field>
              </div>
              <Field label="Kin Relationship"><input name="next_of_kin_relationship" defaultValue={student.next_of_kin_relationship ?? ""} className={inputClass()} /></Field>
              <Field label="Status">
                <select name="status" defaultValue={student.status} className={inputClass()}>
                  <option value="active">Active</option>
                  <option value="deferred">Deferred</option>
                  <option value="suspended">Suspended</option>
                  <option value="completed">Completed</option>
                  <option value="graduated">Graduated</option>
                  <option value="archived">Archived</option>
                </select>
              </Field>
              <button className="bg-primary px-4 py-3 text-sm font-black uppercase tracking-widest text-white hover:bg-dark">Update Profile</button>
            </form>
          </Panel>

          <Panel title="Program Assignment" icon={<GraduationCap size={20} />}>
            <form action={enrollmentAction} className="grid gap-4">
              <input type="hidden" name="enrollment_id" value={enrollment?.id ?? ""} />
              <Field label="Program"><SelectField name="program_id" defaultValue={programId} options={programs.rows} /></Field>
              <Field label="Cohort"><SelectField name="cohort_id" defaultValue={cohortId} options={cohorts.rows} /></Field>
              <Field label="Class"><SelectField name="class_id" defaultValue={classId} options={classes.rows} /></Field>
              <Field label="Status">
                <select name="status" defaultValue={enrollment?.status ?? "active"} className={inputClass()}>
                  <option value="active">Active</option>
                  <option value="deferred">Deferred</option>
                  <option value="completed">Completed</option>
                  <option value="withdrawn">Withdrawn</option>
                  <option value="archived">Archived</option>
                </select>
              </Field>
              <button className="bg-primary px-4 py-3 text-sm font-black uppercase tracking-widest text-white hover:bg-dark">Save Assignment</button>
            </form>
          </Panel>

          <Panel title="Onboarding" icon={<CheckCircle2 size={20} />}>
            <form action={onboardingAction} className="grid gap-4">
              <input type="hidden" name="enrollment_id" value={enrollment?.id ?? ""} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Status">
                  <select name="status" defaultValue={onboarding.status} className={inputClass()}>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </Field>
                <Field label="Documents">
                  <select name="documents_status" defaultValue={onboarding.documents_status} className={inputClass()}>
                    <option value="pending">Pending</option>
                    <option value="submitted">Submitted</option>
                    <option value="verified">Verified</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </Field>
                <Field label="Orientation">
                  <select name="orientation_status" defaultValue={onboarding.orientation_status} className={inputClass()}>
                    <option value="pending">Pending</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                  </select>
                </Field>
                <Field label="Policies">
                  <select name="policies_status" defaultValue={onboarding.policies_status} className={inputClass()}>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                  </select>
                </Field>
              </div>
              <Field label="Notes"><textarea name="notes" defaultValue={onboarding.notes ?? ""} className={inputClass()} rows={3} /></Field>
              <button className="bg-primary px-4 py-3 text-sm font-black uppercase tracking-widest text-white hover:bg-dark">Update Onboarding</button>
            </form>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Program Modules" icon={<BookOpen size={20} />}>
            <div className="grid gap-3 md:grid-cols-2">
              {modules.rows.map((module) => (
                <div key={module.code} className="border border-dark/10 p-4">
                  <p className="m-0 text-xs font-black uppercase tracking-widest text-primary">{module.code}</p>
                  <p className="m-0 mt-1 font-black text-dark">{module.title}</p>
                  <p className="m-0 mt-2 text-sm text-dark/50">{module.description ?? "No description"}</p>
                </div>
              ))}
              {modules.rows.length === 0 ? <p className="text-sm text-dark/50">Assign a program to load its modules.</p> : null}
            </div>
          </Panel>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Timetable" icon={<CalendarDays size={20} />}>
              <div className="space-y-3">
                {timetable.rows.map((event) => (
                  <div key={`${event.title}-${event.starts_at}`} className="border-b border-dark/5 pb-3">
                    <p className="m-0 font-bold text-dark">{event.title}</p>
                    <p className="m-0 text-xs text-dark/50">{event.room ?? "Room TBA"} · {new Date(event.starts_at).toLocaleString("en-KE")}</p>
                  </div>
                ))}
                {timetable.rows.length === 0 ? <p className="text-sm text-dark/50">Assign a class to load timetable events.</p> : null}
              </div>
            </Panel>

            <Panel title="Exams and Results" icon={<ClipboardList size={20} />}>
              <div className="space-y-4">
                {exams.rows.map((exam) => (
                  <div key={exam.id} className="border-b border-dark/5 pb-3">
                    <p className="m-0 font-bold text-dark">{exam.title}</p>
                    <p className="m-0 text-xs text-dark/50">{exam.module} · {exam.assessment_type} · {exam.status}</p>
                  </div>
                ))}
                {results.rows.map((result) => (
                  <div key={`${result.assessment}-${result.module}`} className="flex justify-between bg-primary/5 p-3">
                    <span className="text-sm font-bold text-dark">{result.assessment}</span>
                    <span className="text-sm font-black text-primary">{result.score} · {result.status}</span>
                  </div>
                ))}
                {exams.rows.length === 0 && results.rows.length === 0 ? <p className="text-sm text-dark/50">No exams or results are linked yet.</p> : null}
              </div>
            </Panel>
          </div>

          <Panel title="Resources" icon={<LibraryBig size={20} />}>
            <form action={resourceAction} className="mb-4 grid gap-3 md:grid-cols-[1fr_auto]">
              <SelectField name="resource_id" options={resources.rows} />
              <button className="bg-primary px-4 py-3 text-sm font-black uppercase tracking-widest text-white hover:bg-dark">Assign</button>
            </form>
            <div className="grid gap-3 md:grid-cols-2">
              {assignedResources.rows.map((resource) => (
                <div key={`${resource.title}-${resource.source}`} className="border border-dark/10 p-4">
                  <p className="m-0 text-xs font-black uppercase tracking-widest text-primary">{resource.source}</p>
                  <p className="m-0 mt-1 font-black text-dark">{resource.title}</p>
                  {resource.url ? <a href={resource.url} target="_blank" className="mt-2 block text-xs font-bold text-primary">Open Resource</a> : null}
                </div>
              ))}
              {assignedResources.rows.length === 0 ? <p className="text-sm text-dark/50">No resources assigned yet.</p> : null}
            </div>
          </Panel>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Fees" icon={<Banknote size={20} />}>
              <form action={invoiceAction} className="mb-4 grid gap-3">
                <Field label="Invoice Number"><input name="invoice_number" className={inputClass()} required /></Field>
                <Field label="Description"><input name="description" className={inputClass()} required /></Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Amount"><input name="amount_kes" type="number" className={inputClass()} required /></Field>
                  <Field label="Due On"><input name="due_on" type="date" className={inputClass()} /></Field>
                </div>
                <input type="hidden" name="status" value="unpaid" />
                <button className="bg-primary px-4 py-3 text-sm font-black uppercase tracking-widest text-white hover:bg-dark">Create Invoice</button>
              </form>
              {invoices.rows.map((invoice) => (
                <div key={invoice.invoice_number} className="border-b border-dark/5 py-3">
                  <p className="m-0 font-bold text-dark">{invoice.description}</p>
                  <p className="m-0 text-xs text-dark/50">{invoice.invoice_number} · Balance KSh. {invoice.balance_kes.toLocaleString("en-KE")}</p>
                </div>
              ))}
            </Panel>

            <Panel title="Clearance & Graduation" icon={<GraduationCap size={20} />}>
              <div className="space-y-3">
                {clearance.rows.map((item) => (
                  <div key={item.checkpoint} className="flex justify-between border-b border-dark/5 pb-3">
                    <span className="text-sm font-bold text-dark">{item.checkpoint}</span>
                    <span className="text-xs font-black uppercase tracking-widest text-primary">{item.status}</span>
                  </div>
                ))}
                {graduation.rows.map((item) => (
                  <div key={item.batch} className="bg-dark p-3 text-white">
                    <p className="m-0 font-bold">{item.batch}</p>
                    <p className="m-0 text-xs uppercase tracking-widest text-white/60">{item.status}</p>
                  </div>
                ))}
                {clearance.rows.length === 0 && graduation.rows.length === 0 ? <p className="text-sm text-dark/50">No clearance or graduation records are linked yet.</p> : null}
              </div>
            </Panel>
          </div>

          <Panel title="Student Portal View" icon={<FileText size={20} />}>
            <p className="m-0 text-sm text-dark/60">
              The student sees the same assigned program, class timetable, resources, fee balance, requests, results, attachment, clearance, and graduation status from their own portal login.
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
