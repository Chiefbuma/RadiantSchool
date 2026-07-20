import type { PortalUser } from "./auth";
import { query } from "./db";

const isoDate = (value: unknown) => value instanceof Date ? value.toISOString().slice(0, 10) : String(value ?? "").slice(0, 10);

export async function getPortalSnapshot(user: PortalUser) {
  const isAdmin = user.permissions.includes("portal.admin") || user.roles.includes("super_admin");
  const studentResult = await query<{ id: number }>("SELECT id FROM portal_students WHERE user_id=$1 AND deleted_at IS NULL", [user.id]);
  const studentId = studentResult.rows[0]?.id ?? null;
  const studentFilter = isAdmin ? "TRUE" : "s.id = $1";
  const studentParams = isAdmin ? [] : [studentId ?? -1];

  const [applicationsResult, programsResult, modulesResult, cohortsResult, classesResult, studentsResult, resourcesResult,
    timetableResult, examsResult, marksResult, invoicesResult, paymentsResult, requestsResult, attachmentsResult,
    clearancesResult, batchesResult, candidatesResult, usersResult, logsResult] = await Promise.all([
    isAdmin ? query(`SELECT a.* FROM applications a WHERE a.deleted_at IS NULL ORDER BY a.created_at DESC`) : Promise.resolve({ rows: [] }),
    query(`SELECT * FROM portal_programs WHERE status='active' ORDER BY title`),
    query(`SELECT m.*,pm.program_id FROM portal_modules m JOIN portal_program_modules pm ON pm.module_id=m.id ORDER BY pm.module_order,m.code`),
    query(`SELECT c.*,i.name intake_name FROM portal_cohorts c JOIN portal_intakes i ON i.id=c.intake_id WHERE c.status<>'archived' ORDER BY c.starts_on DESC`),
    query(`SELECT c.*,u.full_name lecturer_name FROM portal_classes c LEFT JOIN portal_users u ON u.id=c.trainer_user_id WHERE c.status<>'archived' ORDER BY c.name`),
    query(`SELECT s.*,e.program_id,e.cohort_id,e.class_id,e.status enrollment_status,
      COALESCE(array_agg(DISTINCT h.hold_type||'_hold') FILTER(WHERE h.status='active'),'{}') holds
      FROM portal_students s LEFT JOIN portal_student_enrollments e ON e.student_id=s.id AND e.deleted_at IS NULL
      LEFT JOIN portal_student_holds h ON h.student_id=s.id WHERE s.deleted_at IS NULL AND ${studentFilter}
      GROUP BY s.id,e.program_id,e.cohort_id,e.class_id,e.status ORDER BY s.created_at DESC`, studentParams),
    query(`SELECT DISTINCT ON(r.id) r.*,CASE WHEN ra.student_id IS NOT NULL THEN 'student' WHEN ra.class_id IS NOT NULL THEN 'class' WHEN ra.cohort_id IS NOT NULL THEN 'cohort' WHEN ra.program_id IS NOT NULL THEN 'program' ELSE 'all' END target_type,
      COALESCE(ra.student_id,ra.class_id,ra.cohort_id,ra.program_id)::text target_id
      FROM portal_learning_resources r LEFT JOIN portal_resource_assignments ra ON ra.resource_id=r.id ORDER BY r.id,ra.assigned_at DESC`),
    query(`SELECT t.* FROM portal_timetable_events t ORDER BY t.starts_at`),
    query(`SELECT a.* FROM portal_assessments a ORDER BY a.exam_date DESC NULLS LAST`),
    query(`SELECT m.*,a.module_id FROM portal_marks m JOIN portal_assessments a ON a.id=m.assessment_id JOIN portal_students s ON s.id=m.student_id
      WHERE ${studentFilter} AND ($${studentParams.length + 1}::boolean OR m.status='published') ORDER BY m.updated_at DESC`, [...studentParams, isAdmin]),
    query(`SELECT i.* FROM portal_invoices i JOIN portal_students s ON s.id=i.student_id WHERE i.deleted_at IS NULL AND ${studentFilter} ORDER BY i.created_at DESC`, studentParams),
    query(`SELECT p.* FROM portal_payments p JOIN portal_students s ON s.id=p.student_id WHERE ${studentFilter} AND p.status<>'reversed' ORDER BY p.paid_at DESC`, studentParams),
    query(`SELECT r.*,c.name category_name,s.full_name student_name FROM portal_student_requests r JOIN portal_students s ON s.id=r.student_id LEFT JOIN portal_request_categories c ON c.id=r.category_id WHERE ${studentFilter} ORDER BY r.created_at DESC`, studentParams),
    query(`SELECT p.*,site.name site_name FROM portal_attachment_placements p JOIN portal_students s ON s.id=p.student_id JOIN portal_attachment_sites site ON site.id=p.site_id WHERE ${studentFilter} ORDER BY p.starts_on DESC`, studentParams),
    query(`SELECT sc.student_id,jsonb_object_agg(
      CASE WHEN lower(cp.title) LIKE '%finance%' THEN 'financeApproved' WHEN lower(cp.title) LIKE '%library%' THEN 'libraryApproved' WHEN lower(cp.title) LIKE '%skills%' THEN 'skillsLabApproved' WHEN lower(cp.title) LIKE '%academic%' THEN 'academicOfficeApproved' WHEN lower(cp.title) LIKE '%attachment%' THEN 'attachmentOfficeApproved' ELSE 'registrarApproved' END,
      sc.status='approved') checkpoints,jsonb_object_agg(
      CASE WHEN lower(cp.title) LIKE '%finance%' THEN 'finance' WHEN lower(cp.title) LIKE '%library%' THEN 'library' WHEN lower(cp.title) LIKE '%skills%' THEN 'skillsLab' WHEN lower(cp.title) LIKE '%academic%' THEN 'academicOffice' WHEN lower(cp.title) LIKE '%attachment%' THEN 'attachmentOffice' ELSE 'registrar' END,
      COALESCE(sc.notes,'')) comments,jsonb_object_agg(
      CASE WHEN lower(cp.title) LIKE '%finance%' THEN 'financeApproved' WHEN lower(cp.title) LIKE '%library%' THEN 'libraryApproved' WHEN lower(cp.title) LIKE '%skills%' THEN 'skillsLabApproved' WHEN lower(cp.title) LIKE '%academic%' THEN 'academicOfficeApproved' WHEN lower(cp.title) LIKE '%attachment%' THEN 'attachmentOfficeApproved' ELSE 'registrarApproved' END,
      sc.id::text) checkpoint_ids,bool_and(sc.status='approved') cleared
      FROM portal_student_clearance sc JOIN portal_clearance_checkpoints cp ON cp.id=sc.checkpoint_id JOIN portal_students s ON s.id=sc.student_id WHERE ${studentFilter} GROUP BY sc.student_id`, studentParams),
    query(`SELECT * FROM portal_graduation_batches ORDER BY ceremony_date DESC`),
    query(`SELECT gc.* FROM portal_graduation_candidates gc JOIN portal_students s ON s.id=gc.student_id WHERE ${studentFilter}`, studentParams),
    isAdmin ? query(`SELECT u.*,COALESCE((array_agg(r.name ORDER BY r.name) FILTER(WHERE r.name IS NOT NULL))[1],'student') role FROM portal_users u LEFT JOIN portal_user_roles ur ON ur.user_id=u.id LEFT JOIN portal_roles r ON r.id=ur.role_id GROUP BY u.id ORDER BY u.created_at DESC`) : Promise.resolve({ rows: [] }),
    isAdmin ? query(`SELECT * FROM portal_audit_logs ORDER BY created_at DESC LIMIT 500`) : query(`SELECT al.* FROM portal_audit_logs al WHERE al.student_id=$1 ORDER BY al.created_at DESC LIMIT 100`, [studentId ?? -1]),
  ]);

  const programs = programsResult.rows.map((p: any) => ({ id: String(p.id), code: String(p.slug).toUpperCase(), name: p.title, durationMonths: p.duration_months, tuitionFee: p.tuition_fee_kes, entryRequirement: p.entry_requirements, minKcseGrade: p.entry_requirements.match(/\b(A-|B\+|B-|B|C\+|C-|C|D\+|D-|D|E)\b/i)?.[1]?.toUpperCase() ?? "D", description: p.overview }));
  const students = studentsResult.rows.map((s: any) => ({ id: s.student_number, databaseId: String(s.id), userId: s.user_id, applicationId: s.application_id ? String(s.application_id) : undefined, fullName: s.full_name, phone: s.phone ?? "", email: s.email ?? "", dateOfBirth: isoDate(s.date_of_birth), nationalId: s.national_id ?? "", residence: s.residence ?? "", nextOfKinName: s.next_of_kin_name ?? "", nextOfKinPhone: s.next_of_kin_phone ?? "", nextOfKinRelationship: s.next_of_kin_relationship ?? "", status: s.status, holds: s.holds ?? [], created_at: isoDate(s.created_at), programId: String(s.program_id ?? ""), cohortId: String(s.cohort_id ?? ""), classId: String(s.class_id ?? "") }));
  const studentNumberById = new Map(studentsResult.rows.map((s: any) => [Number(s.id), s.student_number]));

  return {
    source: "relational-postgresql",
    applications: applicationsResult.rows.map((a: any) => ({ id: String(a.id), fullName: a.full_name, phone: a.phone, email: a.email, dateOfBirth: isoDate(a.date_of_birth), kcseGrade: a.kcse_mean_grade ?? "", kcseYear: a.kcse_year ?? 0, preferredProgramId: String(a.program_id ?? ""), intakeTerm: String(a.intake_id ?? ""), status: a.status, reviewNotes: a.notes ?? "", assignedOfficer: a.reviewed_by ?? "Unassigned", source: a.source ?? "website", created_at: isoDate(a.created_at) })),
    students, programs,
    modules: modulesResult.rows.map((m: any) => ({ id: String(m.id), code: m.code, name: m.title, programId: String(m.program_id), credits: m.credits, prerequisites: [] })),
    cohorts: cohortsResult.rows.map((c: any) => ({ id: String(c.id), name: c.name, programId: String(c.program_id), intakeTerm: c.intake_name, startDate: isoDate(c.starts_on) })),
    classes: classesResult.rows.map((c: any) => ({ id: String(c.id), name: c.name, cohortId: String(c.cohort_id), lecturerName: c.lecturer_name ?? "Unassigned", room: c.room ?? "", status: c.status })),
    resources: resourcesResult.rows.map((r: any) => ({ id: String(r.id), title: r.title, type: r.resource_type, url: r.url ?? "", targetType: r.target_type, targetId: r.target_id ?? "all", uploadedBy: r.created_by ?? "System", created_at: isoDate(r.created_at) })),
    timetable: timetableResult.rows.map((t: any) => ({ id: String(t.id), classId: String(t.class_id), moduleId: String(t.module_id ?? ""), dayOfWeek: new Date(t.starts_at).toLocaleDateString("en-US", { weekday: "long", timeZone: "Africa/Nairobi" }), startTime: new Date(t.starts_at).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Nairobi" }), endTime: new Date(t.ends_at).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Nairobi" }), room: t.room ?? "" })),
    exams: examsResult.rows.map((e: any) => ({ id: String(e.id), classId: String(e.class_id ?? ""), moduleId: String(e.module_id), name: e.title, date: isoDate(e.exam_date), maxMarks: Number(e.max_score), weightPercent: Number(e.weight_percent) })),
    marks: marksResult.rows.map((m: any) => ({ id: `${m.assessment_id}:${m.student_id}:${m.attempt_number}`, studentId: studentNumberById.get(Number(m.student_id)) ?? String(m.student_id), examId: String(m.assessment_id), moduleId: String(m.module_id), marksObtained: Number(m.score), grade: Number(m.score) >= 80 ? "A" : Number(m.score) >= 70 ? "B" : Number(m.score) >= 60 ? "C" : Number(m.score) >= 50 ? "D" : "F", status: Number(m.score) >= 50 ? "Passed" : "Failed", isModerated: ["moderated", "approved", "published"].includes(m.status), recordedBy: m.entered_by ?? "", dateRecorded: isoDate(m.updated_at) })),
    invoices: invoicesResult.rows.map((i: any) => ({ id: String(i.id), invoiceNumber: i.invoice_number, studentId: studentNumberById.get(Number(i.student_id)) ?? String(i.student_id), title: i.description, amount: Number(i.amount_kes), dueDate: isoDate(i.due_on), status: i.status, created_at: isoDate(i.created_at) })),
    payments: paymentsResult.rows.map((p: any) => ({ id: String(p.id), receiptNumber: p.receipt_number, invoiceId: String(p.invoice_id ?? ""), studentId: studentNumberById.get(Number(p.student_id)) ?? String(p.student_id), amount: Number(p.amount_kes), paymentMethod: p.method === "MPesa" || p.method === "Bank Transfer" ? p.method : "Cash", transactionReference: p.reference ?? "", datePaid: isoDate(p.paid_at) })),
    requests: requestsResult.rows.map((r: any) => ({ id: String(r.id), studentId: studentNumberById.get(Number(r.student_id)) ?? String(r.student_id), studentName: r.student_name, category: r.category_name ?? "Document Request", subject: r.subject, description: r.details, status: r.status, priority: "medium", createdAt: isoDate(r.created_at), adminComments: "" })),
    attachments: attachmentsResult.rows.map((a: any) => ({ id: String(a.id), studentId: studentNumberById.get(Number(a.student_id)) ?? String(a.student_id), siteName: a.site_name, supervisorName: a.supervisor_name ?? "", department: a.department ?? "Clinical", startDate: isoDate(a.starts_on), endDate: isoDate(a.ends_on), completionStatus: a.status === "completed" ? "completed" : a.status === "active" ? "active" : "pending", logbooksSubmitted: 0 })),
    clearances: clearancesResult.rows.map((c: any) => ({ studentId: studentNumberById.get(Number(c.student_id)) ?? String(c.student_id), checkpointIds:c.checkpoint_ids??{}, checkpoints: { financeApproved: false, libraryApproved: false, skillsLabApproved: false, academicOfficeApproved: false, attachmentOfficeApproved: false, registrarApproved: false, ...(c.checkpoints ?? {}) }, comments: c.comments ?? {}, status: c.cleared ? "cleared" : "in_progress" })),
    graduationBatches: batchesResult.rows.map((b: any) => ({ id: String(b.id), name: b.name, ceremonyDate: isoDate(b.ceremony_date), status: b.status === "completed" ? "completed" : "upcoming" })),
    graduationCandidates: candidatesResult.rows.map((g: any) => ({ id: `${g.batch_id}:${g.student_id}`, studentId: studentNumberById.get(Number(g.student_id)) ?? String(g.student_id), batchId: String(g.batch_id), eligibilityStatus: g.status === "graduated" ? "graduated" : g.status === "eligible" ? "eligible" : "on_hold", holdReason: g.hold_reason ?? undefined, certificateIssued: g.status === "graduated", transcriptIssued: g.status === "graduated" })),
    users: usersResult.rows.map((u: any) => ({ id: u.id, email: u.email, phone: u.phone ?? "", fullName: u.full_name, role: u.role === "student" ? "student" : "super_admin", status: u.status === "active" ? "active" : "suspended", created_at: isoDate(u.created_at) })),
    logs: logsResult.rows.map((l: any) => ({ id: String(l.id), userId: l.user_id, studentId: l.student_id ? studentNumberById.get(Number(l.student_id)) : undefined, title: l.action, description: `${l.entity_type}${l.entity_id ? ` ${l.entity_id}` : ""}`, date: isoDate(l.created_at), category: l.entity_type === "payment" ? "Finance" : l.entity_type.includes("mark") ? "Exams" : l.entity_type.includes("application") ? "Admissions" : l.entity_type.includes("clearance") ? "Clearance" : "System" })),
  };
}
