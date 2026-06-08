import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { hashPassword, requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { Eye, Plus, Save, Trash2 } from "lucide-react";

type Field = {
  name: string;
  label: string;
  type?: "text" | "number" | "date" | "datetime-local" | "textarea" | "select";
  required?: boolean;
  optionsQuery?: string;
  placeholder?: string;
};

type CrudConfig = {
  title: string;
  description: string;
  table: string;
  idColumn: string;
  listSql: string;
  insertSql?: string;
  updateSql?: string;
  deleteSql?: string;
  fields: Field[];
  columns: { key: string; label: string }[];
  badgeKey?: string;
};

const configs: Record<string, CrudConfig> = {
  applications: {
    title: "Applications",
    description: "Review applications and link each applicant to the accepted program and intake.",
    table: "applications",
    idColumn: "id",
    listSql: "SELECT a.id, a.full_name, a.email, a.phone, COALESCE(p.title, a.program) AS program, i.name AS intake, a.status, a.offer_status, a.created_at::date AS created_at FROM applications a LEFT JOIN portal_programs p ON p.id = a.program_id LEFT JOIN portal_intakes i ON i.id = a.intake_id ORDER BY a.created_at DESC",
    insertSql:
      "INSERT INTO applications (full_name, email, phone, program, program_id, intake_id, kcse_mean_grade, kcse_year, status, source) VALUES ($1,$2,$3,(SELECT slug FROM portal_programs WHERE id = NULLIF($4,'')::bigint),NULLIF($4,'')::bigint,NULLIF($5,'')::bigint,$6,NULLIF($7,'')::int,$8,'admin_portal')",
    updateSql: "UPDATE applications SET status = $2, updated_at = NOW() WHERE id = $1",
    deleteSql: "DELETE FROM applications WHERE id = $1",
    badgeKey: "status",
    fields: [
      { name: "full_name", label: "Full Name", required: true },
      { name: "email", label: "Email", required: true },
      { name: "phone", label: "Phone", required: true },
      { name: "program_id", label: "Program", type: "select", required: true, optionsQuery: "SELECT id::text AS value, title AS label FROM portal_programs ORDER BY title" },
      { name: "intake_id", label: "Intake", type: "select", optionsQuery: "SELECT id::text AS value, name AS label FROM portal_intakes ORDER BY id" },
      { name: "kcse_mean_grade", label: "KCSE Grade" },
      { name: "kcse_year", label: "KCSE Year", type: "number" },
      { name: "status", label: "Status", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('new','New'),('under_review','Under Review'),('accepted','Accepted'),('rejected','Rejected'),('waitlisted','Waitlisted')) AS x(value,label)" },
    ],
    columns: [
      { key: "full_name", label: "Applicant" },
      { key: "program", label: "Program" },
      { key: "intake", label: "Intake" },
      { key: "phone", label: "Phone" },
      { key: "status", label: "Status" },
      { key: "offer_status", label: "Offer" },
      { key: "created_at", label: "Created" },
    ],
  },
  students: {
    title: "Students",
    description: "Register accepted applicants as students. Registration creates both the student record and student login credentials.",
    table: "portal_students",
    idColumn: "id",
    listSql: "SELECT id, student_number, full_name, email, phone, next_of_kin_name, status, created_at::date AS created_at FROM portal_students ORDER BY created_at DESC",
    insertSql: "custom_student_registration",
    updateSql: "UPDATE portal_students SET status = $2 WHERE id = $1",
    deleteSql: "UPDATE portal_students SET status = 'archived' WHERE id = $1",
    badgeKey: "status",
    fields: [
      { name: "student_number", label: "Student Number", required: true },
      { name: "full_name", label: "Full Name", required: true },
      { name: "email", label: "Email", required: true },
      { name: "phone", label: "Phone", required: true },
      { name: "initial_password", label: "Initial Password", required: true, placeholder: "Give this to the student after registration" },
      { name: "date_of_birth", label: "Date of Birth", type: "date" },
      { name: "gender", label: "Gender", type: "select", optionsQuery: "SELECT value, label FROM (VALUES ('Female','Female'),('Male','Male'),('Not Provided','Not Provided')) AS x(value,label)" },
      { name: "national_id", label: "National ID" },
      { name: "residence", label: "Residence" },
      { name: "next_of_kin_name", label: "Next of Kin Name" },
      { name: "next_of_kin_phone", label: "Next of Kin Phone" },
      { name: "next_of_kin_relationship", label: "Next of Kin Relationship" },
      { name: "status", label: "Status", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('active','Active'),('deferred','Deferred'),('suspended','Suspended'),('completed','Completed'),('graduated','Graduated'),('archived','Archived')) AS x(value,label)" },
    ],
    columns: [
      { key: "student_number", label: "Student No." },
      { key: "full_name", label: "Name" },
      { key: "phone", label: "Phone" },
      { key: "next_of_kin_name", label: "Next of Kin" },
      { key: "status", label: "Status" },
    ],
  },
  onboarding: {
    title: "Onboarding",
    description: "Track onboarding tasks created when an accepted offer becomes a student record.",
    table: "portal_student_onboarding",
    idColumn: "id",
    listSql: "SELECT o.id, s.full_name AS student, p.title AS program, c.name AS cohort, cl.name AS class, o.status, o.documents_status, o.orientation_status, o.policies_status FROM portal_student_onboarding o JOIN portal_students s ON s.id=o.student_id LEFT JOIN portal_student_enrollments e ON e.id=o.enrollment_id LEFT JOIN portal_programs p ON p.id=e.program_id LEFT JOIN portal_cohorts c ON c.id=e.cohort_id LEFT JOIN portal_classes cl ON cl.id=e.class_id ORDER BY o.started_at DESC",
    insertSql:
      "INSERT INTO portal_student_onboarding (student_id,application_id,offer_id,enrollment_id,status,documents_status,orientation_status,policies_status,notes) VALUES (NULLIF($1,'')::bigint,NULLIF($2,'')::bigint,NULLIF($3,'')::bigint,NULLIF($4,'')::bigint,$5,$6,$7,$8,$9)",
    updateSql: "UPDATE portal_student_onboarding SET status = $2, completed_at = CASE WHEN $2='completed' THEN NOW() ELSE completed_at END WHERE id = $1",
    deleteSql: "UPDATE portal_student_onboarding SET status = 'cancelled' WHERE id = $1",
    badgeKey: "status",
    fields: [
      { name: "student_id", label: "Student", type: "select", required: true, optionsQuery: "SELECT id::text AS value, full_name || ' - ' || student_number AS label FROM portal_students ORDER BY full_name" },
      { name: "application_id", label: "Application", type: "select", optionsQuery: "SELECT id::text AS value, full_name || ' - ' || program AS label FROM applications ORDER BY created_at DESC" },
      { name: "offer_id", label: "Offer", type: "select", optionsQuery: "SELECT id::text AS value, offer_number AS label FROM portal_admission_offers ORDER BY issued_at DESC" },
      { name: "enrollment_id", label: "Enrollment", type: "select", optionsQuery: "SELECT e.id::text AS value, s.student_number || ' - ' || p.title AS label FROM portal_student_enrollments e JOIN portal_students s ON s.id=e.student_id JOIN portal_programs p ON p.id=e.program_id ORDER BY e.id DESC" },
      { name: "status", label: "Status", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('pending','Pending'),('in_progress','In Progress'),('completed','Completed'),('blocked','Blocked'),('cancelled','Cancelled')) AS x(value,label)" },
      { name: "documents_status", label: "Documents", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('pending','Pending'),('submitted','Submitted'),('verified','Verified'),('rejected','Rejected')) AS x(value,label)" },
      { name: "orientation_status", label: "Orientation", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('pending','Pending'),('scheduled','Scheduled'),('completed','Completed')) AS x(value,label)" },
      { name: "policies_status", label: "Policies", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('pending','Pending'),('accepted','Accepted')) AS x(value,label)" },
      { name: "notes", label: "Notes", type: "textarea" },
    ],
    columns: [
      { key: "student", label: "Student" },
      { key: "program", label: "Program" },
      { key: "cohort", label: "Cohort" },
      { key: "class", label: "Class" },
      { key: "status", label: "Status" },
      { key: "documents_status", label: "Documents" },
    ],
  },
  enrollments: {
    title: "Student Enrollments",
    description: "Assign each student to the accepted program, cohort and class. This is the hub used by the student dashboard.",
    table: "portal_student_enrollments",
    idColumn: "id",
    listSql: "SELECT e.id, s.full_name AS student, p.title AS program, c.name AS cohort, cl.name AS class, e.status, e.enrolled_on FROM portal_student_enrollments e JOIN portal_students s ON s.id=e.student_id JOIN portal_programs p ON p.id=e.program_id JOIN portal_cohorts c ON c.id=e.cohort_id LEFT JOIN portal_classes cl ON cl.id=e.class_id ORDER BY e.enrolled_on DESC",
    insertSql:
      "INSERT INTO portal_student_enrollments (student_id,program_id,cohort_id,class_id,application_id,offer_id,enrolled_on,status) VALUES (NULLIF($1,'')::bigint,NULLIF($2,'')::bigint,NULLIF($3,'')::bigint,NULLIF($4,'')::bigint,NULLIF($5,'')::bigint,NULLIF($6,'')::bigint,NULLIF($7,'')::date,$8)",
    updateSql: "UPDATE portal_student_enrollments SET status = $2 WHERE id = $1",
    deleteSql: "UPDATE portal_student_enrollments SET status = 'archived' WHERE id = $1",
    badgeKey: "status",
    fields: [
      { name: "student_id", label: "Student", type: "select", required: true, optionsQuery: "SELECT id::text AS value, full_name || ' - ' || student_number AS label FROM portal_students ORDER BY full_name" },
      { name: "program_id", label: "Program", type: "select", required: true, optionsQuery: "SELECT id::text AS value, title AS label FROM portal_programs ORDER BY title" },
      { name: "cohort_id", label: "Cohort", type: "select", required: true, optionsQuery: "SELECT id::text AS value, name AS label FROM portal_cohorts ORDER BY starts_on DESC" },
      { name: "class_id", label: "Class", type: "select", optionsQuery: "SELECT id::text AS value, name AS label FROM portal_classes ORDER BY name" },
      { name: "application_id", label: "Application", type: "select", optionsQuery: "SELECT id::text AS value, full_name || ' - ' || program AS label FROM applications ORDER BY created_at DESC" },
      { name: "offer_id", label: "Offer", type: "select", optionsQuery: "SELECT id::text AS value, offer_number AS label FROM portal_admission_offers ORDER BY issued_at DESC" },
      { name: "enrolled_on", label: "Enrolled On", type: "date", required: true },
      { name: "status", label: "Status", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('active','Active'),('deferred','Deferred'),('completed','Completed'),('withdrawn','Withdrawn'),('archived','Archived')) AS x(value,label)" },
    ],
    columns: [
      { key: "student", label: "Student" },
      { key: "program", label: "Program" },
      { key: "cohort", label: "Cohort" },
      { key: "class", label: "Class" },
      { key: "status", label: "Status" },
    ],
  },
  programs: {
    title: "Programs",
    description: "Define courses, requirements, fees, and linked PDF documents.",
    table: "portal_programs",
    idColumn: "id",
    listSql: "SELECT id, slug, title, duration_months, entry_requirements, tuition_fee_kes, status FROM portal_programs ORDER BY id",
    insertSql:
      "INSERT INTO portal_programs (slug,title,duration_months,entry_requirements,tuition_fee_kes,overview,pdf_url,status) VALUES ($1,$2,NULLIF($3,'')::int,$4,NULLIF($5,'')::int,$6,$7,$8)",
    updateSql: "UPDATE portal_programs SET status = $2 WHERE id = $1",
    deleteSql: "UPDATE portal_programs SET status = 'archived' WHERE id = $1",
    badgeKey: "status",
    fields: [
      { name: "slug", label: "Slug", required: true },
      { name: "title", label: "Title", required: true },
      { name: "duration_months", label: "Duration Months", type: "number", required: true },
      { name: "entry_requirements", label: "Entry Requirements", required: true },
      { name: "tuition_fee_kes", label: "Tuition Fee KES", type: "number", required: true },
      { name: "overview", label: "Overview", type: "textarea", required: true },
      { name: "pdf_url", label: "PDF URL" },
      { name: "status", label: "Status", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('active','Active'),('paused','Paused'),('archived','Archived')) AS x(value,label)" },
    ],
    columns: [
      { key: "slug", label: "Code" },
      { key: "title", label: "Program" },
      { key: "duration_months", label: "Months" },
      { key: "tuition_fee_kes", label: "Tuition" },
      { key: "status", label: "Status" },
    ],
  },
  modules: {
    title: "Modules",
    description: "Manage academic modules and units.",
    table: "portal_modules",
    idColumn: "id",
    listSql: "SELECT id, code, title, credits, description FROM portal_modules ORDER BY code",
    insertSql: "INSERT INTO portal_modules (code,title,description,credits) VALUES ($1,$2,$3,NULLIF($4,'')::int)",
    deleteSql: "DELETE FROM portal_modules WHERE id = $1",
    fields: [
      { name: "code", label: "Code", required: true },
      { name: "title", label: "Title", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "credits", label: "Credits", type: "number", required: true },
    ],
    columns: [
      { key: "code", label: "Code" },
      { key: "title", label: "Title" },
      { key: "credits", label: "Credits" },
      { key: "description", label: "Description" },
    ],
  },
  cohorts: {
    title: "Cohorts",
    description: "Create intakes/cohorts and connect them to programs.",
    table: "portal_cohorts",
    idColumn: "id",
    listSql: "SELECT c.id, c.name, p.title AS program, i.name AS intake, c.starts_on, c.expected_graduation_on, c.status FROM portal_cohorts c JOIN portal_programs p ON p.id=c.program_id JOIN portal_intakes i ON i.id=c.intake_id ORDER BY c.starts_on DESC",
    insertSql:
      "INSERT INTO portal_cohorts (program_id,intake_id,name,starts_on,expected_graduation_on,status) VALUES (NULLIF($1,'')::bigint,NULLIF($2,'')::bigint,$3,NULLIF($4,'')::date,NULLIF($5,'')::date,$6)",
    updateSql: "UPDATE portal_cohorts SET status = $2 WHERE id = $1",
    deleteSql: "UPDATE portal_cohorts SET status = 'archived' WHERE id = $1",
    badgeKey: "status",
    fields: [
      { name: "program_id", label: "Program", type: "select", required: true, optionsQuery: "SELECT id::text AS value, title AS label FROM portal_programs ORDER BY title" },
      { name: "intake_id", label: "Intake", type: "select", required: true, optionsQuery: "SELECT id::text AS value, name AS label FROM portal_intakes ORDER BY id" },
      { name: "name", label: "Cohort Name", required: true },
      { name: "starts_on", label: "Starts On", type: "date", required: true },
      { name: "expected_graduation_on", label: "Expected Graduation", type: "date" },
      { name: "status", label: "Status", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('planned','Planned'),('active','Active'),('completed','Completed'),('archived','Archived')) AS x(value,label)" },
    ],
    columns: [
      { key: "name", label: "Cohort" },
      { key: "program", label: "Program" },
      { key: "intake", label: "Intake" },
      { key: "starts_on", label: "Starts" },
      { key: "status", label: "Status" },
    ],
  },
  classes: {
    title: "Classes",
    description: "Assign cohorts to classes, trainers, and rooms.",
    table: "portal_classes",
    idColumn: "id",
    listSql: "SELECT cl.id, cl.name, c.name AS cohort, u.full_name AS trainer, cl.room, cl.status FROM portal_classes cl JOIN portal_cohorts c ON c.id=cl.cohort_id LEFT JOIN portal_users u ON u.id=cl.trainer_user_id ORDER BY cl.id DESC",
    insertSql:
      "INSERT INTO portal_classes (cohort_id,name,trainer_user_id,room,status) VALUES (NULLIF($1,'')::bigint,$2,NULLIF($3,'')::uuid,$4,$5)",
    updateSql: "UPDATE portal_classes SET status = $2 WHERE id = $1",
    deleteSql: "UPDATE portal_classes SET status = 'archived' WHERE id = $1",
    badgeKey: "status",
    fields: [
      { name: "cohort_id", label: "Cohort", type: "select", required: true, optionsQuery: "SELECT id::text AS value, name AS label FROM portal_cohorts ORDER BY starts_on DESC" },
      { name: "name", label: "Class Name", required: true },
      { name: "trainer_user_id", label: "Trainer", type: "select", optionsQuery: "SELECT id::text AS value, full_name AS label FROM portal_users ORDER BY full_name" },
      { name: "room", label: "Room" },
      { name: "status", label: "Status", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('active','Active'),('completed','Completed'),('archived','Archived')) AS x(value,label)" },
    ],
    columns: [
      { key: "name", label: "Class" },
      { key: "cohort", label: "Cohort" },
      { key: "trainer", label: "Trainer" },
      { key: "room", label: "Room" },
      { key: "status", label: "Status" },
    ],
  },
  resources: {
    title: "Resources",
    description: "Create learning resources for assignment to programs, cohorts, classes or students.",
    table: "portal_learning_resources",
    idColumn: "id",
    listSql: "SELECT id, title, resource_type, url, description FROM portal_learning_resources ORDER BY created_at DESC",
    insertSql: "INSERT INTO portal_learning_resources (title,resource_type,url,description) VALUES ($1,$2,$3,$4)",
    deleteSql: "DELETE FROM portal_learning_resources WHERE id = $1",
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "resource_type", label: "Type", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('pdf','PDF'),('link','Link'),('video','Video'),('policy','Policy'),('announcement','Announcement')) AS x(value,label)" },
      { name: "url", label: "URL" },
      { name: "description", label: "Description", type: "textarea" },
    ],
    columns: [
      { key: "title", label: "Title" },
      { key: "resource_type", label: "Type" },
      { key: "url", label: "URL" },
      { key: "description", label: "Description" },
    ],
  },
  timetable: {
    title: "Timetable",
    description: "Schedule classes, modules, trainers, rooms and sessions.",
    table: "portal_timetable_events",
    idColumn: "id",
    listSql: "SELECT t.id, t.title, cl.name AS class, m.title AS module, t.room, t.starts_at, t.ends_at FROM portal_timetable_events t JOIN portal_classes cl ON cl.id=t.class_id LEFT JOIN portal_modules m ON m.id=t.module_id ORDER BY t.starts_at DESC",
    insertSql:
      "INSERT INTO portal_timetable_events (class_id,module_id,trainer_user_id,title,room,starts_at,ends_at) VALUES (NULLIF($1,'')::bigint,NULLIF($2,'')::bigint,NULLIF($3,'')::uuid,$4,$5,NULLIF($6,'')::timestamptz,NULLIF($7,'')::timestamptz)",
    deleteSql: "DELETE FROM portal_timetable_events WHERE id = $1",
    fields: [
      { name: "class_id", label: "Class", type: "select", required: true, optionsQuery: "SELECT id::text AS value, name AS label FROM portal_classes ORDER BY name" },
      { name: "module_id", label: "Module", type: "select", optionsQuery: "SELECT id::text AS value, title AS label FROM portal_modules ORDER BY code" },
      { name: "trainer_user_id", label: "Trainer", type: "select", optionsQuery: "SELECT id::text AS value, full_name AS label FROM portal_users ORDER BY full_name" },
      { name: "title", label: "Title", required: true },
      { name: "room", label: "Room" },
      { name: "starts_at", label: "Starts At", type: "datetime-local", required: true },
      { name: "ends_at", label: "Ends At", type: "datetime-local", required: true },
    ],
    columns: [
      { key: "title", label: "Title" },
      { key: "class", label: "Class" },
      { key: "module", label: "Module" },
      { key: "room", label: "Room" },
      { key: "starts_at", label: "Starts" },
    ],
  },
  exams: {
    title: "Exams and Assessments",
    description: "Create assessments against modules, cohorts, and classes so student results can be tied back to the class they took.",
    table: "portal_assessments",
    idColumn: "id",
    listSql: "SELECT a.id, a.title, m.title AS module, c.name AS cohort, cl.name AS class, a.assessment_type, a.max_score, a.weight_percent, a.exam_date, a.status FROM portal_assessments a JOIN portal_modules m ON m.id=a.module_id JOIN portal_cohorts c ON c.id=a.cohort_id LEFT JOIN portal_classes cl ON cl.id=a.class_id ORDER BY a.exam_date DESC NULLS LAST",
    insertSql:
      "INSERT INTO portal_assessments (module_id,cohort_id,class_id,title,assessment_type,max_score,weight_percent,exam_date,status) VALUES (NULLIF($1,'')::bigint,NULLIF($2,'')::bigint,NULLIF($3,'')::bigint,$4,$5,NULLIF($6,'')::numeric,NULLIF($7,'')::numeric,NULLIF($8,'')::date,$9)",
    updateSql: "UPDATE portal_assessments SET status = $2 WHERE id = $1",
    deleteSql: "DELETE FROM portal_assessments WHERE id = $1",
    badgeKey: "status",
    fields: [
      { name: "module_id", label: "Module", type: "select", required: true, optionsQuery: "SELECT id::text AS value, code || ' - ' || title AS label FROM portal_modules ORDER BY code" },
      { name: "cohort_id", label: "Cohort", type: "select", required: true, optionsQuery: "SELECT id::text AS value, name AS label FROM portal_cohorts ORDER BY starts_on DESC" },
      { name: "class_id", label: "Class", type: "select", optionsQuery: "SELECT id::text AS value, name AS label FROM portal_classes ORDER BY name" },
      { name: "title", label: "Assessment Title", required: true },
      { name: "assessment_type", label: "Type", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('CAT','CAT'),('Exam','Exam'),('Practical','Practical'),('Assignment','Assignment')) AS x(value,label)" },
      { name: "max_score", label: "Max Score", type: "number", required: true },
      { name: "weight_percent", label: "Weight %", type: "number", required: true },
      { name: "exam_date", label: "Exam Date", type: "date" },
      { name: "status", label: "Status", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('planned','Planned'),('published','Published'),('completed','Completed'),('approved','Approved'),('archived','Archived')) AS x(value,label)" },
    ],
    columns: [
      { key: "title", label: "Assessment" },
      { key: "module", label: "Module" },
      { key: "cohort", label: "Cohort" },
      { key: "class", label: "Class" },
      { key: "assessment_type", label: "Type" },
      { key: "status", label: "Status" },
    ],
  },
  results: {
    title: "Student Results",
    description: "Enter and approve marks for students who sat an assessment.",
    table: "portal_marks",
    idColumn: "id",
    listSql: "SELECT mark.assessment_id::text || '-' || mark.student_id::text AS id, s.full_name AS student, a.title AS assessment, m.title AS module, mark.score, mark.status, mark.updated_at::date AS updated_at FROM portal_marks mark JOIN portal_students s ON s.id=mark.student_id JOIN portal_assessments a ON a.id=mark.assessment_id JOIN portal_modules m ON m.id=a.module_id ORDER BY mark.updated_at DESC",
    insertSql:
      "INSERT INTO portal_marks (assessment_id,student_id,score,status) VALUES (NULLIF($1,'')::bigint,NULLIF($2,'')::bigint,NULLIF($3,'')::numeric,$4) ON CONFLICT (assessment_id, student_id) DO UPDATE SET score = EXCLUDED.score, status = EXCLUDED.status, updated_at = NOW()",
    updateSql: "UPDATE portal_marks SET status = $2, updated_at = NOW() WHERE (assessment_id::text || '-' || student_id::text) = $1",
    deleteSql: "DELETE FROM portal_marks WHERE (assessment_id::text || '-' || student_id::text) = $1",
    badgeKey: "status",
    fields: [
      { name: "assessment_id", label: "Assessment", type: "select", required: true, optionsQuery: "SELECT id::text AS value, title AS label FROM portal_assessments ORDER BY exam_date DESC NULLS LAST" },
      { name: "student_id", label: "Student", type: "select", required: true, optionsQuery: "SELECT id::text AS value, full_name || ' - ' || student_number AS label FROM portal_students ORDER BY full_name" },
      { name: "score", label: "Score", type: "number", required: true },
      { name: "status", label: "Status", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('draft','Draft'),('submitted','Submitted'),('approved','Approved'),('published','Published')) AS x(value,label)" },
    ],
    columns: [
      { key: "student", label: "Student" },
      { key: "assessment", label: "Assessment" },
      { key: "module", label: "Module" },
      { key: "score", label: "Score" },
      { key: "status", label: "Status" },
      { key: "updated_at", label: "Updated" },
    ],
  },
  fees: {
    title: "Fees and Invoices",
    description: "Create invoices and track balances.",
    table: "portal_invoices",
    idColumn: "id",
    listSql: "SELECT i.id, s.full_name AS student, i.invoice_number, i.description, i.amount_kes, i.status, i.due_on FROM portal_invoices i JOIN portal_students s ON s.id=i.student_id ORDER BY i.created_at DESC",
    insertSql:
      "INSERT INTO portal_invoices (student_id,invoice_number,description,amount_kes,status,due_on) VALUES (NULLIF($1,'')::bigint,$2,$3,NULLIF($4,'')::int,$5,NULLIF($6,'')::date)",
    updateSql: "UPDATE portal_invoices SET status = $2 WHERE id = $1",
    deleteSql: "DELETE FROM portal_invoices WHERE id = $1",
    badgeKey: "status",
    fields: [
      { name: "student_id", label: "Student", type: "select", required: true, optionsQuery: "SELECT id::text AS value, full_name || ' - ' || student_number AS label FROM portal_students ORDER BY full_name" },
      { name: "invoice_number", label: "Invoice Number", required: true },
      { name: "description", label: "Description", required: true },
      { name: "amount_kes", label: "Amount KES", type: "number", required: true },
      { name: "status", label: "Status", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('unpaid','Unpaid'),('partially_paid','Partially Paid'),('paid','Paid'),('void','Void')) AS x(value,label)" },
      { name: "due_on", label: "Due On", type: "date" },
    ],
    columns: [
      { key: "student", label: "Student" },
      { key: "invoice_number", label: "Invoice" },
      { key: "amount_kes", label: "Amount" },
      { key: "status", label: "Status" },
      { key: "due_on", label: "Due" },
    ],
  },
  requests: {
    title: "Student Requests",
    description: "Track and update student service requests.",
    table: "portal_student_requests",
    idColumn: "id",
    listSql: "SELECT r.id, s.full_name AS student, c.name AS category, r.subject, r.status, r.created_at::date AS created_at FROM portal_student_requests r JOIN portal_students s ON s.id=r.student_id LEFT JOIN portal_request_categories c ON c.id=r.category_id ORDER BY r.created_at DESC",
    updateSql: "UPDATE portal_student_requests SET status = $2, updated_at = NOW() WHERE id = $1",
    deleteSql: "DELETE FROM portal_student_requests WHERE id = $1",
    badgeKey: "status",
    fields: [],
    columns: [
      { key: "student", label: "Student" },
      { key: "category", label: "Category" },
      { key: "subject", label: "Subject" },
      { key: "status", label: "Status" },
      { key: "created_at", label: "Created" },
    ],
  },
  clearance: {
    title: "Clearance Checkpoints",
    description: "Define clearance checkpoints for departments.",
    table: "portal_clearance_checkpoints",
    idColumn: "id",
    listSql: "SELECT cc.id, ct.name AS template, d.name AS department, cc.title, cc.checkpoint_order FROM portal_clearance_checkpoints cc JOIN portal_clearance_templates ct ON ct.id=cc.template_id LEFT JOIN portal_departments d ON d.id=cc.department_id ORDER BY cc.checkpoint_order",
    insertSql:
      "INSERT INTO portal_clearance_checkpoints (template_id,department_id,title,checkpoint_order) VALUES (NULLIF($1,'')::bigint,NULLIF($2,'')::bigint,$3,NULLIF($4,'')::int)",
    deleteSql: "DELETE FROM portal_clearance_checkpoints WHERE id = $1",
    fields: [
      { name: "template_id", label: "Template", type: "select", required: true, optionsQuery: "SELECT id::text AS value, name AS label FROM portal_clearance_templates ORDER BY name" },
      { name: "department_id", label: "Department", type: "select", optionsQuery: "SELECT id::text AS value, name AS label FROM portal_departments ORDER BY name" },
      { name: "title", label: "Checkpoint", required: true },
      { name: "checkpoint_order", label: "Order", type: "number", required: true },
    ],
    columns: [
      { key: "template", label: "Template" },
      { key: "department", label: "Department" },
      { key: "title", label: "Checkpoint" },
      { key: "checkpoint_order", label: "Order" },
    ],
  },
  graduation: {
    title: "Graduation Batches",
    description: "Plan graduation batches and ceremony details.",
    table: "portal_graduation_batches",
    idColumn: "id",
    listSql: "SELECT id, name, ceremony_date, status FROM portal_graduation_batches ORDER BY ceremony_date DESC",
    insertSql: "INSERT INTO portal_graduation_batches (name,ceremony_date,status) VALUES ($1,NULLIF($2,'')::date,$3)",
    updateSql: "UPDATE portal_graduation_batches SET status = $2 WHERE id = $1",
    deleteSql: "DELETE FROM portal_graduation_batches WHERE id = $1",
    badgeKey: "status",
    fields: [
      { name: "name", label: "Batch Name", required: true },
      { name: "ceremony_date", label: "Ceremony Date", type: "date" },
      { name: "status", label: "Status", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('planned','Planned'),('published','Published'),('completed','Completed')) AS x(value,label)" },
    ],
    columns: [
      { key: "name", label: "Batch" },
      { key: "ceremony_date", label: "Ceremony" },
      { key: "status", label: "Status" },
    ],
  },
  users: {
    title: "Portal Users",
    description: "View portal users and account status.",
    table: "portal_users",
    idColumn: "id",
    listSql: "SELECT id, full_name, email, phone, status, created_at::date AS created_at FROM portal_users ORDER BY created_at DESC",
    updateSql: "UPDATE portal_users SET status = $2 WHERE id = $1",
    deleteSql: "UPDATE portal_users SET status = 'archived' WHERE id = $1",
    badgeKey: "status",
    fields: [],
    columns: [
      { key: "full_name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "status", label: "Status" },
    ],
  },
};

async function getOptions(config: CrudConfig) {
  const optionEntries = await Promise.all(
    config.fields
      .filter((field) => field.optionsQuery)
      .map(async (field) => {
        const result = await query<{ value: string; label: string }>(field.optionsQuery!);
        return [field.name, result.rows] as const;
      })
  );

  return Object.fromEntries(optionEntries) as Record<string, { value: string; label: string }[]>;
}

async function createRecord(module: string, formData: FormData) {
  "use server";
  const user = await requireUser("portal.admin");
  const config = configs[module];
  if (!config?.insertSql) return;

  if (module === "students") {
    const studentNumber = String(formData.get("student_number") ?? "").trim();
    const fullName = String(formData.get("full_name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const phone = String(formData.get("phone") ?? "").trim();
    const initialPassword = String(formData.get("initial_password") ?? "");

    if (!studentNumber || !fullName || !email || !phone || !initialPassword) return;

    const userResult = await query<{ id: string }>(
      `INSERT INTO portal_users (full_name, email, phone, password_hash, status)
       VALUES ($1, $2, $3, $4, 'active')
       ON CONFLICT (email) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        password_hash = EXCLUDED.password_hash,
        status = 'active',
        updated_at = NOW()
       RETURNING id::text`,
      [fullName, email, phone, hashPassword(initialPassword)]
    );

    const studentUserId = userResult.rows[0]?.id;
    if (!studentUserId) return;

    await query(
      `INSERT INTO portal_user_roles (user_id, role_id)
       SELECT $1::uuid, id FROM portal_roles WHERE name = 'student'
       ON CONFLICT DO NOTHING`,
      [studentUserId]
    );

    await query(
      `INSERT INTO portal_students (
        user_id,
        student_number,
        full_name,
        email,
        phone,
        date_of_birth,
        gender,
        national_id,
        residence,
        next_of_kin_name,
        next_of_kin_phone,
        next_of_kin_relationship,
        status,
        registered_by
      ) VALUES (
        $1::uuid,$2,$3,$4,$5,NULLIF($6,'')::date,$7,NULLIF($8,''),NULLIF($9,''),NULLIF($10,''),NULLIF($11,''),NULLIF($12,''),$13,$14::uuid
      )`,
      [
        studentUserId,
        studentNumber,
        fullName,
        email,
        phone,
        String(formData.get("date_of_birth") ?? ""),
        String(formData.get("gender") ?? "Not Provided"),
        String(formData.get("national_id") ?? ""),
        String(formData.get("residence") ?? ""),
        String(formData.get("next_of_kin_name") ?? ""),
        String(formData.get("next_of_kin_phone") ?? ""),
        String(formData.get("next_of_kin_relationship") ?? ""),
        String(formData.get("status") ?? "active"),
        user.id,
      ]
    );

    await query("INSERT INTO portal_audit_logs (user_id, action, entity_type, details) VALUES ($1, 'student.registered', 'portal_students', $2::jsonb)", [
      user.id,
      JSON.stringify({ student_number: studentNumber, email }),
    ]);
    revalidatePath("/portal/admin/students");
    return;
  }

  const values = config.fields.map((field) => String(formData.get(field.name) ?? ""));
  await query(config.insertSql, values);
  await query("INSERT INTO portal_audit_logs (action, entity_type, details) VALUES ($1,$2,$3::jsonb)", [
    `${module}.create`,
    config.table,
    JSON.stringify(Object.fromEntries(config.fields.map((field) => [field.name, String(formData.get(field.name) ?? "")]))),
  ]);
  revalidatePath(`/portal/admin/${module}`);
}

async function updateStatus(module: string, formData: FormData) {
  "use server";
  await requireUser("portal.admin");
  const config = configs[module];
  if (!config?.updateSql) return;

  await query(config.updateSql, [String(formData.get("id")), String(formData.get("status"))]);
  await query("INSERT INTO portal_audit_logs (action, entity_type, entity_id, details) VALUES ($1,$2,$3,$4::jsonb)", [
    `${module}.update_status`,
    config.table,
    String(formData.get("id")),
    JSON.stringify({ status: String(formData.get("status")) }),
  ]);
  revalidatePath(`/portal/admin/${module}`);
}

async function deleteRecord(module: string, formData: FormData) {
  "use server";
  await requireUser("portal.admin");
  const config = configs[module];
  if (!config?.deleteSql) return;

  await query(config.deleteSql, [String(formData.get("id"))]);
  await query("INSERT INTO portal_audit_logs (action, entity_type, entity_id) VALUES ($1,$2,$3)", [
    `${module}.delete`,
    config.table,
    String(formData.get("id")),
  ]);
  revalidatePath(`/portal/admin/${module}`);
}

function valueText(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  if (value instanceof Date) return value.toLocaleDateString("en-KE");
  if (typeof value === "number") return value.toLocaleString("en-KE");
  return String(value);
}

export default async function AdminCrudPage({ params }: { params: Promise<{ module: string }> }) {
  await requireUser("portal.admin");
  const { module } = await params;
  const config = configs[module];
  if (!config) notFound();

  const [rowsResult, options] = await Promise.all([query<Record<string, unknown>>(config.listSql), getOptions(config)]);
  const createAction = createRecord.bind(null, module);
  const updateAction = updateStatus.bind(null, module);
  const deleteAction = deleteRecord.bind(null, module);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 md:px-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="mb-2 text-xs font-black uppercase tracking-[0.3em] text-primary">Admin CRUD</p>
          <h1 className="text-4xl font-black leading-none text-dark md:text-6xl">{config.title}</h1>
          <p className="mt-3 max-w-3xl text-dark/60">{config.description}</p>
        </div>
        <a href="/portal/admin" className="text-sm font-black uppercase tracking-widest text-primary">Back to Dashboard</a>
      </div>

      {config.insertSql && config.fields.length > 0 ? (
        <section className="border border-dark/10 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-primary/10 text-primary"><Plus size={20} /></div>
            <h2 className="m-0 text-2xl font-black text-dark">Create {config.title.slice(0, -1) || config.title}</h2>
          </div>
          <form action={createAction} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {config.fields.map((field) => (
              <label key={field.name} className={field.type === "textarea" ? "md:col-span-2 xl:col-span-3" : ""}>
                <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-dark/50">{field.label}</span>
                {field.type === "textarea" ? (
                  <textarea name={field.name} required={field.required} placeholder={field.placeholder} rows={3} className="w-full border border-dark/10 bg-accent/20 px-3 py-3 text-sm outline-none focus:border-primary" />
                ) : field.type === "select" ? (
                  <select name={field.name} required={field.required} className="w-full border border-dark/10 bg-accent/20 px-3 py-3 text-sm outline-none focus:border-primary">
                    <option value="">Select {field.label}</option>
                    {(options[field.name] ?? []).map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                ) : (
                  <input name={field.name} required={field.required} type={field.type ?? "text"} placeholder={field.placeholder} className="w-full border border-dark/10 bg-accent/20 px-3 py-3 text-sm outline-none focus:border-primary" />
                )}
              </label>
            ))}
            <div className="flex items-end">
              <button className="flex w-full items-center justify-center gap-2 bg-primary px-4 py-3 text-sm font-black uppercase tracking-widest text-white hover:bg-dark">
                <Save size={16} /> Save
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="overflow-hidden border border-dark/10 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="bg-dark text-white">
              <tr>
                {config.columns.map((column) => (
                  <th key={column.key} className="px-4 py-3 text-xs font-black uppercase tracking-widest">{column.label}</th>
                ))}
                <th className="px-4 py-3 text-xs font-black uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rowsResult.rows.map((row) => (
                <tr key={String(row[config.idColumn])} className="border-b border-dark/5 hover:bg-accent/20">
                  {config.columns.map((column) => (
                    <td key={column.key} className="max-w-[280px] px-4 py-3 align-top">
                      {column.key === config.badgeKey ? (
                        <span className="inline-flex bg-primary/10 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                          {valueText(row[column.key])}
                        </span>
                      ) : (
                        <span className="line-clamp-2">{valueText(row[column.key])}</span>
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-wrap gap-2">
                      {module === "students" ? (
                        <a
                          href={`/portal/admin/students/${String(row[config.idColumn])}`}
                          className="flex items-center gap-1 bg-primary px-3 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-dark"
                        >
                          <Eye size={14} /> Dashboard
                        </a>
                      ) : null}
                      {config.updateSql ? (
                        <form action={updateAction} className="flex gap-2">
                          <input type="hidden" name="id" value={String(row[config.idColumn])} />
                          <select name="status" defaultValue={String(row.status ?? "")} className="border border-dark/10 bg-white px-2 py-2 text-xs">
                            <option value="active">Active</option>
                            <option value="new">New</option>
                            <option value="under_review">Under Review</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                            <option value="submitted">Submitted</option>
                            <option value="in_progress">In Progress</option>
                            <option value="approved">Approved</option>
                            <option value="paid">Paid</option>
                            <option value="partially_paid">Partially Paid</option>
                            <option value="completed">Completed</option>
                            <option value="archived">Archived</option>
                          </select>
                          <button className="bg-dark px-3 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-primary">Update</button>
                        </form>
                      ) : null}
                      {config.deleteSql ? (
                        <form action={deleteAction}>
                          <input type="hidden" name="id" value={String(row[config.idColumn])} />
                          <button className="flex items-center gap-1 border border-primary/30 px-3 py-2 text-xs font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-white">
                            <Trash2 size={14} /> Remove
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
              {rowsResult.rows.length === 0 ? (
                <tr>
                  <td colSpan={config.columns.length + 1} className="px-4 py-10 text-center text-dark/50">No records found.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
