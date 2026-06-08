import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { ReactNode } from "react";

async function createStudentRequest(formData: FormData) {
  "use server";
  const user = await requireUser("portal.student");
  const subject = String(formData.get("subject") || "").trim();
  const details = String(formData.get("details") || "").trim();
  const categoryId = String(formData.get("category_id") || "");

  if (!subject || !details) return;

  const student = await query<{ id: string }>(
    "SELECT id::text FROM portal_students WHERE user_id = $1 LIMIT 1",
    [user.id]
  );
  const studentId = student.rows[0]?.id;
  if (!studentId) return;

  await query(
    `INSERT INTO portal_student_requests (student_id, category_id, subject, details)
     VALUES ($1, NULLIF($2, '')::bigint, $3, $4)`,
    [studentId, categoryId, subject, details]
  );

  await query(
    "INSERT INTO portal_audit_logs (user_id, action, entity_type, details) VALUES ($1, 'student_request.created', 'portal_student_requests', $2::jsonb)",
    [user.id, JSON.stringify({ subject })]
  );

  revalidatePath("/portal/student");
}

async function getStudentData(userId: string) {
  const student = await query<{
    id: string;
    student_number: string;
    full_name: string;
    status: string;
    program: string;
    cohort: string;
    class_name: string | null;
    entry_requirements: string;
    email: string | null;
    phone: string | null;
  }>(
    `SELECT s.id::text, s.student_number, s.full_name, s.status, s.email, s.phone, p.title AS program,
      c.name AS cohort, cl.name AS class_name, p.entry_requirements
    FROM portal_students s
    JOIN portal_student_enrollments e ON e.student_id = s.id
    JOIN portal_programs p ON p.id = e.program_id
    JOIN portal_cohorts c ON c.id = e.cohort_id
    LEFT JOIN portal_classes cl ON cl.id = e.class_id
    WHERE s.user_id = $1
    LIMIT 1`,
    [userId]
  );

  const current = student.rows[0];
  if (!current) {
    return null;
  }

  const [
    invoices,
    timetable,
    resources,
    requests,
    categories,
    clearance,
    attachment,
    results,
  ] = await Promise.all([
    query<{ invoice_number: string; description: string; amount_kes: number; paid_kes: number; balance_kes: number; status: string }>(
      `SELECT i.invoice_number, i.description, i.amount_kes, COALESCE(sum(p.amount_kes), 0)::int AS paid_kes,
        (i.amount_kes - COALESCE(sum(p.amount_kes), 0))::int AS balance_kes, i.status
      FROM portal_invoices i
      LEFT JOIN portal_payments p ON p.invoice_id = i.id
      WHERE i.student_id = $1
      GROUP BY i.id
      ORDER BY i.created_at DESC`,
      [current.id]
    ),
    query<{ title: string; room: string | null; starts_at: string; ends_at: string }>(
      `SELECT t.title, t.room, t.starts_at::text, t.ends_at::text
      FROM portal_timetable_events t
      JOIN portal_student_enrollments e ON e.class_id = t.class_id
      WHERE e.student_id = $1
      ORDER BY t.starts_at
      LIMIT 8`,
      [current.id]
    ),
    query<{ title: string; resource_type: string; url: string | null; description: string | null }>(
      `SELECT DISTINCT r.title, r.resource_type, r.url, r.description
      FROM portal_learning_resources r
      JOIN portal_resource_assignments ra ON ra.resource_id = r.id
      JOIN portal_student_enrollments e ON e.student_id = $1
      WHERE ra.student_id = e.student_id
        OR ra.class_id = e.class_id
        OR ra.cohort_id = e.cohort_id
        OR ra.program_id = e.program_id
      ORDER BY r.title`,
      [current.id]
    ),
    query<{ subject: string; details: string; status: string; category: string | null; created_at: string }>(
      `SELECT r.subject, r.details, r.status, c.name AS category, r.created_at::text
      FROM portal_student_requests r
      LEFT JOIN portal_request_categories c ON c.id = r.category_id
      WHERE r.student_id = $1
      ORDER BY r.created_at DESC
      LIMIT 8`,
      [current.id]
    ),
    query<{ id: string; name: string }>("SELECT id::text, name FROM portal_request_categories ORDER BY name"),
    query<{ checkpoint: string; department: string | null; status: string }>(
      `SELECT cc.title AS checkpoint, d.name AS department, COALESCE(sc.status, 'pending') AS status
      FROM portal_clearance_checkpoints cc
      JOIN portal_clearance_templates ct ON ct.id = cc.template_id
      JOIN portal_student_enrollments e ON e.program_id = ct.program_id
      LEFT JOIN portal_departments d ON d.id = cc.department_id
      LEFT JOIN portal_student_clearance sc ON sc.checkpoint_id = cc.id AND sc.student_id = e.student_id
      WHERE e.student_id = $1
      ORDER BY cc.checkpoint_order`,
      [current.id]
    ),
    query<{ site: string; location: string; supervisor_name: string | null; starts_on: string; ends_on: string | null; status: string }>(
      `SELECT s.name AS site, s.location, p.supervisor_name, p.starts_on::text, p.ends_on::text, p.status
      FROM portal_attachment_placements p
      JOIN portal_attachment_sites s ON s.id = p.site_id
      WHERE p.student_id = $1
      ORDER BY p.starts_on DESC
      LIMIT 1`,
      [current.id]
    ),
    query<{ assessment: string; module: string; score: string; status: string }>(
      `SELECT a.title AS assessment, m.title AS module, mark.score::text, mark.status
      FROM portal_marks mark
      JOIN portal_assessments a ON a.id = mark.assessment_id
      JOIN portal_modules m ON m.id = a.module_id
      WHERE mark.student_id = $1`,
      [current.id]
    ),
  ]);

  return {
    student: current,
    invoices: invoices.rows,
    timetable: timetable.rows,
    resources: resources.rows,
    requests: requests.rows,
    categories: categories.rows,
    clearance: clearance.rows,
    attachment: attachment.rows[0] ?? null,
    results: results.rows,
  };
}

function SmisBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="border border-[#9d9d9d] bg-white px-2 pb-3 pt-2">
      <legend className="px-1 text-[13px] font-bold text-[#1c5d78]">{title}</legend>
      {children}
    </fieldset>
  );
}

function InfoRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <tr className="border-b border-[#d7d7d7]">
      <th className="w-48 bg-[#eef5f7] px-2 py-2 text-left text-[12px] font-bold text-[#333]">{label}</th>
      <td className="px-2 py-2 text-[12px] text-[#222]">{value || "-"}</td>
    </tr>
  );
}

function EmptyRow({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-2 py-4 text-center text-[12px] text-[#666]">{message}</td>
    </tr>
  );
}

export default async function StudentPortalPage() {
  const user = await requireUser("portal.student");
  const data = await getStudentData(user.id);

  if (!data) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 md:px-6">
        <h1 className="text-4xl font-black text-dark">Student Profile Not Linked</h1>
        <p className="text-dark/60">Your account is active, but no student record is linked yet. Contact the registrar.</p>
      </div>
    );
  }

  const totalBalance = data.invoices.reduce((sum, invoice) => sum + Number(invoice.balance_kes), 0);

  const primaryTabs = ["Home", "Fees", "Timetables", "Course Registration", "Course Evaluation", "Results", "Enquiries", "Book Room"];
  const secondaryTabs = ["Change Password", "My profile", "Student ID", "Inter Faculty", "Clearance Status", "Caution Refund", "Academic Tracking"];

  return (
    <div className="mx-auto max-w-[1144px] bg-white px-3 py-4 font-[Arial,sans-serif] text-[#222]">
      <header className="mb-4 flex items-start gap-4">
        <img src="/logo/rhti-logo.png" alt="RHTI" className="h-[88px] w-[88px] object-contain" />
        <div className="pt-1">
          <h1 className="m-0 text-[25px] font-bold leading-none text-black">Radiant Hospital Training Institute</h1>
          <p className="m-0 mt-2 text-[12px] text-[#777]">Educating Hearts and Minds for Health</p>
        </div>
      </header>

      <nav className="flex flex-wrap items-end gap-[6px] border-b border-[#9ec4d1]">
        {primaryTabs.map((tab, index) => (
          <a
            key={tab}
            href={tab === "Fees" ? "#fees" : tab === "Timetables" ? "#timetable" : tab === "Results" ? "#results" : tab === "Enquiries" ? "#enquiries" : "#home"}
            className={`min-w-[92px] px-5 py-[7px] text-center text-[13px] font-bold text-white ${index === 0 ? "bg-[#a9cedb] text-[#15536a]" : "bg-[#777]"}`}
          >
            {tab}
          </a>
        ))}
        <form action="/api/auth/logout" method="post">
          <button className="min-w-[92px] bg-[#777] px-5 py-[7px] text-center text-[13px] font-bold text-white">Logout</button>
        </form>
      </nav>

      <div className="mb-2 flex flex-wrap gap-x-8 gap-y-2 border-b border-[#6d9eaf] bg-[#b7d8e4] px-2 py-3 text-[13px] font-bold text-[#1c5d78]">
        {secondaryTabs.map((tab) => (
          <a key={tab} href={tab === "Clearance Status" ? "#clearance" : "#home"} className="before:mr-2 before:text-white before:content-['•'] underline">
            {tab}
          </a>
        ))}
      </div>

      <main id="home" className="space-y-4 border-t border-[#e8e8e8] bg-gradient-to-b from-white to-[#f6f6f6] px-3 py-3">
        <div>
          <p className="m-0 text-[14px] font-bold text-black">Student Management Information System</p>
          <a className="text-[14px] font-bold text-[#1c5d78] underline" href="#profile">Student Dashboard</a>
        </div>

        <SmisBox title="Student Profile">
          <table id="profile" className="w-full border-collapse">
            <tbody>
              <InfoRow label="Registration Number:" value={data.student.student_number} />
              <InfoRow label="Student Name:" value={data.student.full_name} />
              <InfoRow label="Email:" value={data.student.email} />
              <InfoRow label="Phone:" value={data.student.phone} />
              <InfoRow label="Programme:" value={data.student.program} />
              <InfoRow label="Cohort:" value={data.student.cohort} />
              <InfoRow label="Class:" value={data.student.class_name} />
              <InfoRow label="Academic Status:" value={data.student.status} />
            </tbody>
          </table>
        </SmisBox>

        <p className="m-0 text-[13px] font-bold">Note: Digits and Letters in your Registration Number.</p>
        <ul className="ml-10 list-none space-y-2 text-[13px] font-bold text-[#333]">
          <li className="before:mr-2 before:text-[#999] before:content-['»']">Use your allocated RHTI registration number for all institute services.</li>
          <li className="before:mr-2 before:text-[#999] before:content-['»']">Course resources and exams appear only after programme and class assignment.</li>
        </ul>

        <SmisBox title="Course Registration">
          <table className="w-full border-collapse text-[12px]">
            <tbody>
              <InfoRow label="Registered Programme:" value={data.student.program} />
              <InfoRow label="Entry Requirements:" value={data.student.entry_requirements} />
              <InfoRow label="Current Class:" value={data.student.class_name} />
            </tbody>
          </table>
        </SmisBox>

        <SmisBox title="Allocated Course Resources">
          <table className="w-full border-collapse text-[12px]">
            <thead className="bg-[#d7e8ee] text-left">
              <tr>
                <th className="border border-[#b7c7cc] px-2 py-2">Resource</th>
                <th className="border border-[#b7c7cc] px-2 py-2">Type</th>
                <th className="border border-[#b7c7cc] px-2 py-2">Description</th>
                <th className="border border-[#b7c7cc] px-2 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.resources.map((resource) => (
                <tr key={resource.title} className="odd:bg-white even:bg-[#f5f5f5]">
                  <td className="border border-[#ddd] px-2 py-2 font-bold">{resource.title}</td>
                  <td className="border border-[#ddd] px-2 py-2">{resource.resource_type}</td>
                  <td className="border border-[#ddd] px-2 py-2">{resource.description ?? "-"}</td>
                  <td className="border border-[#ddd] px-2 py-2">
                    {resource.url ? <a href={resource.url} target="_blank" className="font-bold text-[#1c5d78] underline">Open</a> : "-"}
                  </td>
                </tr>
              ))}
              {data.resources.length === 0 ? <EmptyRow colSpan={4} message="No resources have been assigned." /> : null}
            </tbody>
          </table>
        </SmisBox>

        <SmisBox title="Fees Statement">
          <table id="fees" className="w-full border-collapse text-[12px]">
            <thead className="bg-[#d7e8ee] text-left">
              <tr>
                <th className="border border-[#b7c7cc] px-2 py-2">Invoice No.</th>
                <th className="border border-[#b7c7cc] px-2 py-2">Description</th>
                <th className="border border-[#b7c7cc] px-2 py-2">Amount</th>
                <th className="border border-[#b7c7cc] px-2 py-2">Paid</th>
                <th className="border border-[#b7c7cc] px-2 py-2">Balance</th>
                <th className="border border-[#b7c7cc] px-2 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.invoices.map((invoice) => (
                <tr key={invoice.invoice_number} className="odd:bg-white even:bg-[#f5f5f5]">
                  <td className="border border-[#ddd] px-2 py-2 font-bold">{invoice.invoice_number}</td>
                  <td className="border border-[#ddd] px-2 py-2">{invoice.description}</td>
                  <td className="border border-[#ddd] px-2 py-2">KSh. {invoice.amount_kes.toLocaleString("en-KE")}</td>
                  <td className="border border-[#ddd] px-2 py-2">KSh. {invoice.paid_kes.toLocaleString("en-KE")}</td>
                  <td className="border border-[#ddd] px-2 py-2 font-bold">KSh. {invoice.balance_kes.toLocaleString("en-KE")}</td>
                  <td className="border border-[#ddd] px-2 py-2">{invoice.status}</td>
                </tr>
              ))}
              {data.invoices.length === 0 ? <EmptyRow colSpan={6} message="No fee invoices available." /> : null}
              <tr className="bg-[#eef5f7]">
                <td colSpan={4} className="border border-[#ddd] px-2 py-2 text-right font-bold">Total Balance</td>
                <td className="border border-[#ddd] px-2 py-2 font-bold">KSh. {totalBalance.toLocaleString("en-KE")}</td>
                <td className="border border-[#ddd] px-2 py-2" />
              </tr>
            </tbody>
          </table>
        </SmisBox>

        <SmisBox title="Timetables">
          <table id="timetable" className="w-full border-collapse text-[12px]">
            <thead className="bg-[#d7e8ee] text-left">
              <tr>
                <th className="border border-[#b7c7cc] px-2 py-2">Unit / Session</th>
                <th className="border border-[#b7c7cc] px-2 py-2">Room</th>
                <th className="border border-[#b7c7cc] px-2 py-2">Start</th>
                <th className="border border-[#b7c7cc] px-2 py-2">End</th>
              </tr>
            </thead>
            <tbody>
              {data.timetable.map((event) => (
                <tr key={`${event.title}-${event.starts_at}`} className="odd:bg-white even:bg-[#f5f5f5]">
                  <td className="border border-[#ddd] px-2 py-2 font-bold">{event.title}</td>
                  <td className="border border-[#ddd] px-2 py-2">{event.room ?? "Room TBA"}</td>
                  <td className="border border-[#ddd] px-2 py-2">{new Date(event.starts_at).toLocaleString("en-KE")}</td>
                  <td className="border border-[#ddd] px-2 py-2">{new Date(event.ends_at).toLocaleString("en-KE")}</td>
                </tr>
              ))}
              {data.timetable.length === 0 ? <EmptyRow colSpan={4} message="No timetable entries available." /> : null}
            </tbody>
          </table>
        </SmisBox>

        <SmisBox title="Results">
          <table id="results" className="w-full border-collapse text-[12px]">
            <thead className="bg-[#d7e8ee] text-left">
              <tr>
                <th className="border border-[#b7c7cc] px-2 py-2">Assessment</th>
                <th className="border border-[#b7c7cc] px-2 py-2">Module</th>
                <th className="border border-[#b7c7cc] px-2 py-2">Score</th>
                <th className="border border-[#b7c7cc] px-2 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.results.map((result) => (
                <tr key={`${result.assessment}-${result.module}`} className="odd:bg-white even:bg-[#f5f5f5]">
                  <td className="border border-[#ddd] px-2 py-2 font-bold">{result.assessment}</td>
                  <td className="border border-[#ddd] px-2 py-2">{result.module}</td>
                  <td className="border border-[#ddd] px-2 py-2">{result.score}</td>
                  <td className="border border-[#ddd] px-2 py-2">{result.status}</td>
                </tr>
              ))}
              {data.results.length === 0 ? <EmptyRow colSpan={4} message="No approved marks have been published." /> : null}
            </tbody>
          </table>
        </SmisBox>

        <SmisBox title="Attachment and Clearance Status">
          <div className="grid gap-4 lg:grid-cols-2">
            <table className="w-full border-collapse text-[12px]">
              <tbody>
                <InfoRow label="Attachment Site:" value={data.attachment?.site} />
                <InfoRow label="Location:" value={data.attachment?.location} />
                <InfoRow label="Supervisor:" value={data.attachment?.supervisor_name} />
                <InfoRow label="Status:" value={data.attachment?.status ?? "Not Assigned"} />
              </tbody>
            </table>
            <table id="clearance" className="w-full border-collapse text-[12px]">
              <tbody>
                {data.clearance.map((item) => (
                  <InfoRow key={item.checkpoint} label={`${item.checkpoint}:`} value={`${item.department ?? "Department"} - ${item.status}`} />
                ))}
                {data.clearance.length === 0 ? <EmptyRow colSpan={2} message="No clearance checklist available." /> : null}
              </tbody>
            </table>
          </div>
        </SmisBox>

        <SmisBox title="Student Enquiries">
          <form id="enquiries" action={createStudentRequest} className="mb-4 grid max-w-3xl gap-3 text-[12px]">
            <label className="font-bold">
              Category:
              <select name="category_id" className="ml-2 w-[260px] border border-[#999] px-2 py-1">
                <option value="">Select request category</option>
                {data.categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>
            <label className="font-bold">
              Subject:
              <input name="subject" className="ml-3 w-[360px] border border-[#999] px-2 py-1" />
            </label>
            <label className="grid gap-1 font-bold">
              Details:
              <textarea name="details" rows={4} className="w-full border border-[#999] px-2 py-1 font-normal" />
            </label>
            <button className="ml-[100px] w-fit border border-[#777] bg-[#efefef] px-4 py-1 text-[13px] text-black">Submit Enquiry</button>
          </form>
          <table className="w-full border-collapse text-[12px]">
            <thead className="bg-[#d7e8ee] text-left">
              <tr>
                <th className="border border-[#b7c7cc] px-2 py-2">Subject</th>
                <th className="border border-[#b7c7cc] px-2 py-2">Category</th>
                <th className="border border-[#b7c7cc] px-2 py-2">Status</th>
                <th className="border border-[#b7c7cc] px-2 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.requests.map((request) => (
                <tr key={`${request.subject}-${request.created_at}`} className="odd:bg-white even:bg-[#f5f5f5]">
                  <td className="border border-[#ddd] px-2 py-2 font-bold">{request.subject}</td>
                  <td className="border border-[#ddd] px-2 py-2">{request.category ?? "General"}</td>
                  <td className="border border-[#ddd] px-2 py-2">{request.status}</td>
                  <td className="border border-[#ddd] px-2 py-2">{new Date(request.created_at).toLocaleDateString("en-KE")}</td>
                </tr>
              ))}
              {data.requests.length === 0 ? <EmptyRow colSpan={4} message="No enquiries submitted." /> : null}
            </tbody>
          </table>
        </SmisBox>
      </main>

      <footer className="mt-8 border-t border-[#cfcfcf] py-3 text-center text-[11px] text-[#777]">
        Radiant Hospital Training Institute Student Management Information System
      </footer>
    </div>
  );
}
