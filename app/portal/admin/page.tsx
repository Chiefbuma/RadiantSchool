import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import type { ReactNode } from "react";
import {
  Banknote,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  GraduationCap,
  LibraryBig,
  Users,
} from "lucide-react";

type CountRow = { label: string; value: string };

async function getAdminData() {
  const [
    counts,
    applications,
    students,
    programs,
    cohorts,
    invoices,
    requests,
    timetable,
    resources,
    clearance,
  ] = await Promise.all([
    query<CountRow>(`
      SELECT 'Applications' AS label, count(*)::text AS value FROM applications
      UNION ALL SELECT 'Students', count(*)::text FROM portal_students
      UNION ALL SELECT 'Programs', count(*)::text FROM portal_programs
      UNION ALL SELECT 'Cohorts', count(*)::text FROM portal_cohorts
      UNION ALL SELECT 'Open Requests', count(*)::text FROM portal_student_requests WHERE status NOT IN ('closed', 'approved', 'rejected')
      UNION ALL SELECT 'Outstanding Fees', COALESCE(sum(i.amount_kes - COALESCE(p.paid, 0)), 0)::text
        FROM portal_invoices i
        LEFT JOIN (
          SELECT invoice_id, sum(amount_kes) paid FROM portal_payments GROUP BY invoice_id
        ) p ON p.invoice_id = i.id
    `),
    query<{ id: string; full_name: string; email: string; phone: string; program: string; status: string; created_at: string }>(
      "SELECT id::text, full_name, email, phone, program, status, created_at::text FROM applications ORDER BY created_at DESC LIMIT 8"
    ),
    query<{ student_number: string; full_name: string; status: string; program: string; cohort: string; class_name: string }>(`
      SELECT s.student_number, s.full_name, s.status, p.title AS program, c.name AS cohort, cl.name AS class_name
      FROM portal_students s
      JOIN portal_student_enrollments e ON e.student_id = s.id
      JOIN portal_programs p ON p.id = e.program_id
      JOIN portal_cohorts c ON c.id = e.cohort_id
      LEFT JOIN portal_classes cl ON cl.id = e.class_id
      ORDER BY s.created_at DESC
      LIMIT 8
    `),
    query<{ title: string; duration_months: number; entry_requirements: string; tuition_fee_kes: number }>(
      "SELECT title, duration_months, entry_requirements, tuition_fee_kes FROM portal_programs ORDER BY id"
    ),
    query<{ cohort: string; program: string; class_name: string; trainer: string | null; room: string | null; status: string }>(`
      SELECT c.name AS cohort, p.title AS program, cl.name AS class_name, u.full_name AS trainer, cl.room, c.status
      FROM portal_cohorts c
      JOIN portal_programs p ON p.id = c.program_id
      LEFT JOIN portal_classes cl ON cl.cohort_id = c.id
      LEFT JOIN portal_users u ON u.id = cl.trainer_user_id
      ORDER BY c.starts_on DESC
      LIMIT 8
    `),
    query<{ student: string; invoice_number: string; amount_kes: number; paid_kes: number; balance_kes: number; status: string }>(`
      SELECT s.full_name AS student, i.invoice_number, i.amount_kes, COALESCE(sum(p.amount_kes), 0)::int AS paid_kes,
        (i.amount_kes - COALESCE(sum(p.amount_kes), 0))::int AS balance_kes, i.status
      FROM portal_invoices i
      JOIN portal_students s ON s.id = i.student_id
      LEFT JOIN portal_payments p ON p.invoice_id = i.id
      GROUP BY s.full_name, i.id
      ORDER BY i.created_at DESC
      LIMIT 8
    `),
    query<{ student: string; category: string | null; subject: string; status: string; created_at: string }>(`
      SELECT s.full_name AS student, c.name AS category, r.subject, r.status, r.created_at::text
      FROM portal_student_requests r
      JOIN portal_students s ON s.id = r.student_id
      LEFT JOIN portal_request_categories c ON c.id = r.category_id
      ORDER BY r.created_at DESC
      LIMIT 8
    `),
    query<{ title: string; class_name: string; room: string | null; starts_at: string; ends_at: string }>(`
      SELECT t.title, cl.name AS class_name, t.room, t.starts_at::text, t.ends_at::text
      FROM portal_timetable_events t
      JOIN portal_classes cl ON cl.id = t.class_id
      ORDER BY t.starts_at
      LIMIT 8
    `),
    query<{ title: string; resource_type: string; assigned_scope: string }>(`
      SELECT r.title, r.resource_type,
        CASE
          WHEN ra.student_id IS NOT NULL THEN 'Student'
          WHEN ra.class_id IS NOT NULL THEN 'Class'
          WHEN ra.cohort_id IS NOT NULL THEN 'Cohort'
          WHEN ra.program_id IS NOT NULL THEN 'Program'
          ELSE 'Unassigned'
        END AS assigned_scope
      FROM portal_learning_resources r
      LEFT JOIN portal_resource_assignments ra ON ra.resource_id = r.id
      ORDER BY r.created_at DESC
      LIMIT 8
    `),
    query<{ checkpoint: string; department: string | null }>(`
      SELECT cc.title AS checkpoint, d.name AS department
      FROM portal_clearance_checkpoints cc
      LEFT JOIN portal_departments d ON d.id = cc.department_id
      ORDER BY cc.checkpoint_order
      LIMIT 8
    `),
  ]);

  return {
    counts: counts.rows,
    applications: applications.rows,
    students: students.rows,
    programs: programs.rows,
    cohorts: cohorts.rows,
    invoices: invoices.rows,
    requests: requests.rows,
    timetable: timetable.rows,
    resources: resources.rows,
    clearance: clearance.rows,
  };
}

function Card({ title, children, icon }: { title: string; children: ReactNode; icon: ReactNode }) {
  return (
    <section className="border border-dark/10 bg-white p-5 shadow-[0_16px_40px_rgba(24,40,72,0.08)]">
      <div className="mb-4 flex items-center gap-3 border-b border-dark/5 pb-3">
        <div className="flex h-10 w-10 items-center justify-center bg-primary/10 text-primary">{icon}</div>
        <h2 className="m-0 text-2xl font-black leading-none text-dark">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default async function AdminPortalPage() {
  await requireUser("portal.admin");
  const data = await getAdminData();

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-6">
      <div>
        <p className="mb-2 text-xs font-black uppercase tracking-[0.3em] text-primary">Admin Portal</p>
        <h1 className="text-4xl font-black leading-none text-dark md:text-6xl">Institution Management System</h1>
        <p className="mt-4 max-w-3xl text-dark/60">
          Operational dashboard for admissions, onboarding, academics, finance, exams, resources,
          requests, clearance, graduation, and institutional setup.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {data.counts.map((item) => (
          <div key={item.label} className="border-l-4 border-primary bg-white p-4 shadow-sm">
            <p className="m-0 text-[10px] font-black uppercase tracking-widest text-dark/40">{item.label}</p>
            <p className="m-0 mt-2 text-3xl font-black text-dark">{Number(item.value).toLocaleString("en-KE")}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Admissions Pipeline" icon={<ClipboardList size={20} />}>
          <div className="space-y-3">
            {data.applications.length === 0 ? <p className="text-sm text-dark/50">No applications yet.</p> : null}
            {data.applications.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 border-b border-dark/5 pb-3">
                <div>
                  <p className="m-0 font-bold text-dark">{item.full_name}</p>
                  <p className="m-0 text-xs text-dark/50">{item.program} · {item.email}</p>
                </div>
                <span className="bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-primary">{item.status}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Students and Enrollments" icon={<Users size={20} />}>
          <div className="space-y-3">
            {data.students.map((item) => (
              <div key={item.student_number} className="border-b border-dark/5 pb-3">
                <p className="m-0 font-bold text-dark">{item.full_name}</p>
                <p className="m-0 text-xs text-dark/50">{item.student_number} · {item.program}</p>
                <p className="m-0 text-xs text-primary">{item.cohort} · {item.class_name}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Programs and Courses" icon={<BookOpen size={20} />}>
          <div className="space-y-3">
            {data.programs.map((item) => (
              <div key={item.title} className="border-b border-dark/5 pb-3">
                <p className="m-0 font-bold text-dark">{item.title}</p>
                <p className="m-0 text-xs text-dark/50">{item.duration_months} months · {item.entry_requirements}</p>
                <p className="m-0 text-xs font-black text-primary">KSh. {item.tuition_fee_kes.toLocaleString("en-KE")}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Cohorts, Classes and Timetable" icon={<CalendarDays size={20} />}>
          <div className="space-y-3">
            {data.cohorts.map((item) => (
              <div key={`${item.cohort}-${item.class_name}`} className="border-b border-dark/5 pb-3">
                <p className="m-0 font-bold text-dark">{item.cohort}</p>
                <p className="m-0 text-xs text-dark/50">{item.class_name} · {item.room ?? "Room TBA"} · {item.trainer ?? "Trainer TBA"}</p>
              </div>
            ))}
            {data.timetable.map((item) => (
              <div key={`${item.title}-${item.starts_at}`} className="bg-accent/30 p-3">
                <p className="m-0 text-sm font-bold text-dark">{item.title}</p>
                <p className="m-0 text-xs text-dark/50">{item.class_name} · {item.room}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Fees and Payments" icon={<Banknote size={20} />}>
          <div className="space-y-3">
            {data.invoices.map((item) => (
              <div key={item.invoice_number} className="grid grid-cols-[1fr_auto] gap-3 border-b border-dark/5 pb-3">
                <div>
                  <p className="m-0 font-bold text-dark">{item.student}</p>
                  <p className="m-0 text-xs text-dark/50">{item.invoice_number} · {item.status}</p>
                </div>
                <p className="m-0 text-right text-sm font-black text-primary">Bal: {item.balance_kes.toLocaleString("en-KE")}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Resources and Student Requests" icon={<LibraryBig size={20} />}>
          <div className="space-y-3">
            {data.resources.map((item) => (
              <div key={`${item.title}-${item.assigned_scope}`} className="border-b border-dark/5 pb-3">
                <p className="m-0 font-bold text-dark">{item.title}</p>
                <p className="m-0 text-xs text-dark/50">{item.resource_type} · Assigned to {item.assigned_scope}</p>
              </div>
            ))}
            {data.requests.map((item) => (
              <div key={`${item.subject}-${item.created_at}`} className="bg-accent/30 p-3">
                <p className="m-0 text-sm font-bold text-dark">{item.subject}</p>
                <p className="m-0 text-xs text-dark/50">{item.student} · {item.status}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Exams, Clearance and Graduation" icon={<GraduationCap size={20} />}>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.clearance.map((item) => (
              <div key={item.checkpoint} className="flex items-start gap-3 bg-accent/30 p-3">
                <CheckCircle2 size={18} className="mt-0.5 text-primary" />
                <div>
                  <p className="m-0 text-sm font-bold text-dark">{item.checkpoint}</p>
                  <p className="m-0 text-xs text-dark/50">{item.department ?? "Department"}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Security and Audit Model" icon={<FileText size={20} />}>
          <ul className="m-0 space-y-2 pl-4 text-sm text-dark/70">
            <li>HTTP-only cookie sessions backed by `portal_sessions`.</li>
            <li>Role and permission matrix seeded from Postgres.</li>
            <li>Operational tables use foreign keys and indexed status lookups.</li>
            <li>`portal_audit_logs` is ready for module-level audit events.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
