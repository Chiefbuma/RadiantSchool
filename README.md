# Radiant Hospital Training Institute

Next.js website, admissions database, n8n automation environment, and planning blueprint for the Radiant Hospital Training Institute management system.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local` and adjust values if needed.
3. Run the app: `npm run dev`

## Run With Docker

**Prerequisites:** Docker and Docker Compose

1. Copy `.env.example` to `.env`.
2. Run: `docker compose up --build`
3. Open the website: `http://localhost:3001`
4. Open n8n: `http://localhost:5688`

Postgres is exposed on `localhost:55432`.

Current services:

- `web`: Next.js website and API routes.
- `postgres`: Main application database.
- `n8n`: Workflow automation server for WhatsApp, admissions automation, notifications, and integrations.

## Implemented Portal Foundation

The current implementation includes a working first version of the institution management system foundation:

- Secure portal login using HTTP-only cookie sessions.
- Seeded admin and student users.
- Admin portal dashboard at `http://localhost:3001/portal/admin`.
- Student portal dashboard at `http://localhost:3001/portal/student`.
- Public website portal buttons route to `http://localhost:3001/login`.
- Relational Postgres schema for users, roles, permissions, sessions, institution setup, programs, modules, cohorts, classes, students, enrollments, resources, timetable, attendance, fees, payments, assessments, marks, attachment, requests, clearance, graduation, and audit logs.
- Seed data from the RHTI profile, website content, PDFs, and current course information.
- n8n remains available for WhatsApp workflow automation at `http://localhost:5688`.

Seeded local credentials:

- Admin: `admin@rhti.local` / `Admin@RHTI2026`
- Student: `student@rhti.local` / `Student@RHTI2026`

## Student-Centered Registration Model

The portal should follow the same operational pattern as RadiantAfya: the person record is the center of the system, and staff enter a management dashboard for that person. Admission offer and acceptance are handled manually outside the database. The database starts controlling the lifecycle only after the applicant has accepted and is being registered as a student.

The intended flow is:

1. Applicant submits an `applications` record from the website, WhatsApp, or staff entry.
2. Admissions reviews the application manually.
3. Offer letter and acceptance are handled manually by the institute.
4. After acceptance, admin/registrar registers the student in `portal_students`.
5. Registration creates:
   - A `portal_students` record with personal details, contacts, date of birth, ID details, residence, and next of kin.
   - A linked `portal_users` login account for the student.
   - A `student` role assignment in `portal_user_roles`.
6. Admin opens the student dashboard from the Students table.
7. On the student dashboard, staff assign and manage the student lifecycle:
   - Program, cohort, and class through `portal_student_enrollments`.
   - Onboarding status through `portal_student_onboarding`.
   - Program modules through the assigned program.
   - Timetable through the assigned class.
   - Lecturer/trainer through the assigned class.
   - Resources through student, class, cohort, program, or module assignments.
   - Exams through the assigned class/cohort/modules.
   - Results through `portal_marks`.
   - Fees through student invoices and payments.
   - Requests, attachments, clearance, and graduation by `student_id`.

This avoids a brittle admissions workflow. Applications are only a lead/admissions pipeline. The student record is the real system-of-record after acceptance.

### Student Dashboard Relationship Chain

The main relationship chain after registration is:

`portal_students -> portal_users`

`portal_students -> portal_student_enrollments -> portal_programs -> portal_cohorts -> portal_classes`

Supporting relationships on the student dashboard:

- `portal_programs -> portal_program_modules -> portal_modules`
- `portal_classes -> portal_timetable_events`
- `portal_classes -> portal_assessments`
- `portal_assessments -> portal_marks -> portal_students`
- `portal_classes/cohorts/programs/modules/students -> portal_resource_assignments -> portal_learning_resources`
- `portal_students -> portal_invoices -> portal_payments`
- `portal_students -> portal_student_requests`
- `portal_students -> portal_attachment_placements`
- `portal_students -> portal_student_clearance -> portal_clearance_checkpoints`
- `portal_students -> portal_graduation_candidates -> portal_graduation_batches`

### Admin Configuration Order

Admins should set up records in this order:

1. Institution, campus, departments, academic year, terms, and intakes.
2. Programs and fee structures.
3. Modules and program-module mappings.
4. Cohorts for each program/intake.
5. Classes under each cohort, with lecturer/trainer assignment.
6. Timetable, exams, resources, attachment sites, clearance templates, and graduation batches.
7. Applications for enquiry/admissions tracking.
8. Manual offer and acceptance outside the database.
9. Student registration after acceptance.
10. Student dashboard assignment: program, cohort, class, onboarding, resources, fees, exams, clearance, graduation.
11. Ongoing operations: fees, payments, attendance, results, requests, attachments, clearance, graduation.

The admin sidebar now exposes these database-backed workbench pages:

- Applications
- Students
- Onboarding
- Enrollments
- Programs
- Modules
- Cohorts
- Classes
- Resources
- Timetable
- Exams
- Results
- Fees
- Requests
- Clearance
- Graduation
- Users

## Institute Management System Blueprint

The long-term goal is to build a full institution management system for RHTI. The system should support the entire lifecycle from public enquiry and application, through admission, student onboarding, learning, exams, fees, attachments, results, graduation, and final clearance.

The system should have two primary portals:

- **Admin portal:** For institute staff to configure, manage, approve, assign, monitor, and report on all institutional operations.
- **Student portal:** For admitted students to access their profile, course resources, timetable, fee status, requests, progress, results, attachments, clearance, and graduation status.

The website remains the public entry point. n8n/WhatsApp can act as an external admissions assistant, but the system of record should be Postgres.

## Core Roles

- **Super Admin:** Full system access, institute setup, user management, module configuration, audit review.
- **Admissions Officer:** Reviews applications, communicates with applicants, approves/rejects admissions, converts applicants into students.
- **Registrar:** Manages student records, cohorts, enrollment, class lists, graduation, clearance.
- **Finance Officer:** Manages fee structures, invoices, payments, balances, receipts, penalties, statements.
- **Academic Admin:** Manages courses, units/modules, timetables, trainers, classes, exams, results, academic progression.
- **Trainer/Lecturer:** Accesses assigned classes, learning resources, attendance, marks entry, student progress.
- **Attachment/Clinical Coordinator:** Assigns students to hospital attachments, tracks supervisors, rotations, reports, evaluations.
- **Student:** Applies, enrolls, views resources, submits requests, tracks fees/progress/results/clearance.
- **Guardian/Sponsor, optional:** Views fee statements and student status where authorized.

## End-to-End Business Workflow

1. **Public Enquiry**
   - Visitor lands on the website or WhatsApp.
   - Visitor asks about courses, fees, intakes, entry requirements, location, documents, or applications.
   - n8n/WhatsApp can query the database and respond with official RHTI data.

2. **Application**
   - Applicant submits application through website, WhatsApp, or admin entry.
   - Required data: full name, phone, email, date of birth, KCSE grade/year, preferred program, intake, notes, source.
   - Application status starts as `new`.
   - Admissions officer reviews application.

3. **Application Review**
   - Status flow: `new -> under_review -> accepted/rejected/waitlisted`.
   - Admin can request more information.
   - System validates entry requirements against chosen program.
   - Accepted applicants receive admission instructions and document checklist.

4. **Admission and Student Creation**
   - Accepted application is converted into a student record.
   - Student number/admission number is generated.
   - Student is assigned to:
     - Program
     - Intake
     - Cohort
     - Class
     - Fee structure
     - Academic calendar
   - Student portal account is created.

5. **Onboarding**
   - Student completes profile and uploads required documents.
   - Admin verifies documents.
   - Student receives orientation resources.
   - Student signs/accepts policies, payment plan, and code of conduct.

6. **Academic Setup**
   - Admin defines courses/programs, modules/units, semesters/terms, classes, cohorts, trainers, rooms/labs, calendars.
   - Admin assigns trainers, resources, timetable slots, exam windows, and learning materials.

7. **Learning and Resources**
   - Student views assigned courses, modules, class resources, timetables, announcements, trainer contacts.
   - Admin/trainer uploads resources by course/module/class/cohort.
   - Student can submit requests and track responses.

8. **Attendance and Participation**
   - Trainers or admins record attendance.
   - Student views attendance summary.
   - Admin monitors attendance risk, warnings, and eligibility.

9. **Fees and Payments**
   - Finance configures fee structures by program/cohort/intake.
   - Student receives invoices and payment schedule.
   - Payments are recorded manually or through future payment gateway integration.
   - Student can view balance, receipts, statement, and payment plan.
   - Finance can place or remove financial holds.

10. **Exams and Results**
    - Academic admin defines assessments, exams, grading schemes, pass marks, exam timetable.
    - Trainers enter marks.
    - Results pass through moderation/approval.
    - Student views approved results.
    - System calculates progression, retakes, and eligibility.

11. **Hospital Attachment**
    - Attachment coordinator assigns students to Radiant Group of Hospitals or affiliated sites.
    - Students are assigned supervisor, department/rotation, dates, reporting instructions.
    - Student submits attachment logs or reports.
    - Supervisor/trainer records evaluation.

12. **Requests and Support**
    - Student can submit requests such as:
      - Deferment
      - Leave/absence
      - Fee plan request
      - Document request
      - Result query
      - Timetable issue
      - Attachment issue
      - Clearance request
    - Admin routes requests to the responsible office.
    - Student tracks status and comments.

13. **Clearance**
    - Clearance starts when a student completes academic requirements or exits.
    - Clearance departments may include:
      - Academic office
      - Finance
      - Library
      - Skills lab
      - Attachment office
      - Registrar
    - Each department approves, rejects, or requests action.
    - Student tracks clearance progress.

14. **Graduation**
    - Registrar creates graduation batch.
    - Eligible students are added after academic, attachment, and finance clearance.
    - Admin manages graduation list, awards, certificates, transcripts, ceremony information.
    - Student views graduation status and required actions.

15. **Alumni**
    - Graduated students become alumni.
    - Alumni record keeps certificate, transcript, graduation batch, contact info, and employment follow-up.

## Admin Portal Requirements

The admin portal should be modular. Each module should be configurable and permission-controlled.

### Dashboard

- Applications count by status.
- Active students by program/cohort.
- Fees collected, outstanding balances.
- Upcoming intakes.
- Upcoming exams/timetables.
- Pending requests.
- Pending clearance approvals.
- Attachment placement status.
- Recent activity and audit trail.

### Institute Setup

- Institution profile.
- Campuses/branches.
- Departments.
- Academic years.
- Terms/semesters.
- Intakes.
- Rooms, labs, libraries, training facilities.
- Hospital attachment sites.
- Document templates.
- Grading schemes.
- Numbering rules for student IDs, invoices, receipts, certificates.

### Programs and Courses

- Create/edit programs.
- Define duration, entry requirements, tuition, description, accreditation info.
- Attach PDF fee structure and admission requirements.
- Define modules/units per program.
- Define module prerequisites.
- Define course resources.
- Define expected learning outcomes.

### Cohorts and Classes

- Create cohort by program and intake.
- Assign students to cohort.
- Split cohort into classes.
- Assign class trainer.
- Assign rooms/labs.
- Track class status: planned, active, completed, archived.

### Students

- Convert accepted application to student.
- Student profile management.
- Documents and verification.
- Emergency contacts.
- Guardian/sponsor details.
- Enrollment history.
- Academic status: active, deferred, suspended, completed, withdrawn, graduated.
- Holds: finance hold, document hold, disciplinary hold, clearance hold.

### Admissions

- View all applications.
- Filter by program, intake, status, source.
- Review eligibility.
- Add comments/internal notes.
- Request additional information.
- Accept/reject/waitlist.
- Generate admission letter.
- Convert to student.

### Fees and Finance

- Fee structures by program/cohort.
- Invoices and invoice items.
- Payment plans.
- Payment recording.
- Receipts.
- Balance statements.
- Discounts/scholarships/waivers.
- Penalties.
- Finance holds.
- Export finance reports.

### Timetables

- Define timetable slots.
- Assign class, module, trainer, room/lab.
- Avoid trainer/room conflicts.
- Publish timetable to student portal.
- Handle changes and notifications.

### Attendance

- Attendance sessions by class/module/date.
- Mark present/absent/late/excused.
- Student attendance reports.
- Eligibility rules.

### Exams and Results

- Assessment types.
- Exam timetables.
- Marks entry.
- Moderation and approval.
- Grade calculation.
- Retake management.
- Result publishing.
- Transcript generation.

### Attachments

- Attachment sites.
- Supervisors.
- Student placement.
- Rotation dates.
- Logbooks/reports.
- Supervisor evaluation.
- Completion status.

### Resources

- Assign resources to students, classes, cohorts, programs, or modules.
- Resource types:
  - PDF
  - Link
  - Video
  - Assignment
  - Policy
  - Timetable
  - Announcement
- Track student access where needed.

### Requests

- Request categories.
- Request routing.
- Status flow: submitted, assigned, in progress, approved, rejected, closed.
- Comments and attachments.
- SLA/priority.

### Clearance

- Clearance templates by program.
- Departments/checkpoints.
- Approval workflow.
- Clearance comments.
- Student clearance status.
- Final registrar approval.

### Graduation

- Graduation batches.
- Eligibility checks.
- Graduation list.
- Certificate/transcript status.
- Ceremony details.
- Alumni conversion.

### Reports

- Applications report.
- Student enrollment report.
- Fees report.
- Debtors report.
- Attendance report.
- Results report.
- Attachment report.
- Clearance report.
- Graduation report.
- Custom exports to CSV/PDF.

### User and Role Management

- Admin users.
- Staff users.
- Trainers.
- Student users.
- Role-based permissions.
- Password reset.
- Account status.
- Audit log.

## Student Portal Requirements

### Student Dashboard

- Admission status.
- Program/cohort/class.
- Fee balance.
- Today/upcoming timetable.
- Pending requests.
- Academic progress.
- Attachment status.
- Clearance/graduation status.

### Profile

- Personal details.
- Contact details.
- Guardian/sponsor details.
- Emergency contact.
- Documents.
- Verification status.

### Academics

- Program details.
- Modules/units.
- Course resources.
- Trainer contacts.
- Timetable.
- Attendance summary.
- Progress tracker.

### Fees

- Fee structure.
- Invoices.
- Payments.
- Receipts.
- Outstanding balance.
- Payment plan.
- Finance hold status.

### Exams and Results

- Exam timetable.
- Assessment results.
- Final results.
- Retake status.
- Transcript preview when approved.

### Attachments

- Placement site.
- Supervisor.
- Rotation dates.
- Reporting instructions.
- Logbook/report submissions.
- Evaluation status.

### Requests

- Submit request.
- Attach documents.
- Track request status.
- View comments.
- Respond to admin questions.

### Clearance and Graduation

- Clearance checklist.
- Department approval status.
- Pending actions.
- Graduation eligibility.
- Graduation batch/ceremony information.
- Certificate/transcript status.

## Proposed Database Schema

The database should remain relational and normalized. Below is the proposed schema direction.

### Identity and Access

- `users`
  - `id`
  - `email`
  - `phone`
  - `password_hash`
  - `status`
  - `last_login_at`
  - `created_at`

- `roles`
  - `id`
  - `name`
  - `description`

- `permissions`
  - `id`
  - `key`
  - `description`

- `user_roles`
  - `user_id`
  - `role_id`

- `role_permissions`
  - `role_id`
  - `permission_id`

### Institution Setup

- `institutions`
- `campuses`
- `departments`
- `academic_years`
- `terms`
- `intakes`
- `rooms`
- `facilities`
- `hospital_sites`
- `document_templates`
- `numbering_sequences`

### Admissions

- `applications`
  - Already exists and should be expanded.
  - Should include source, status, program, intake, review notes, assigned admissions officer.

- `application_documents`
- `application_reviews`
- `admission_offers`
- `admission_letters`

### Student Records

- `students`
  - `id`
  - `user_id`
  - `application_id`
  - `student_number`
  - `full_name`
  - `phone`
  - `email`
  - `date_of_birth`
  - `status`
  - `created_at`

- `student_profiles`
- `student_contacts`
- `student_documents`
- `student_status_history`
- `student_holds`

### Academic Structure

- `programs`
- `program_modules`
- `modules`
- `module_prerequisites`
- `cohorts`
- `classes`
- `class_students`
- `trainer_assignments`
- `learning_resources`
- `resource_assignments`

### Timetable and Attendance

- `timetable_events`
- `attendance_sessions`
- `attendance_records`
- `attendance_rules`

### Finance

- `fee_structures`
- `fee_items`
- `student_fee_assignments`
- `invoices`
- `invoice_items`
- `payments`
- `receipts`
- `payment_plans`
- `payment_plan_items`
- `discounts`
- `finance_holds`

### Exams and Results

- `grading_schemes`
- `assessments`
- `exam_sessions`
- `exam_timetables`
- `marks`
- `result_moderations`
- `final_results`
- `retakes`
- `transcripts`

### Attachment

- `attachment_sites`
- `attachment_supervisors`
- `attachment_placements`
- `attachment_rotations`
- `attachment_logs`
- `attachment_evaluations`
- `attachment_completion`

### Requests

- `request_categories`
- `student_requests`
- `request_comments`
- `request_attachments`
- `request_assignments`
- `request_status_history`

### Clearance and Graduation

- `clearance_templates`
- `clearance_checkpoints`
- `student_clearances`
- `clearance_approvals`
- `graduation_batches`
- `graduation_candidates`
- `graduation_awards`
- `certificates`
- `alumni`

### Communication and Automation

- `notifications`
- `notification_templates`
- `message_logs`
- `whatsapp_conversations`
- `n8n_workflow_events`

### Audit

- `audit_logs`
  - `user_id`
  - `action`
  - `entity_type`
  - `entity_id`
  - `before_data`
  - `after_data`
  - `created_at`

## Business Logic Rules

### Application Eligibility

- CNA requires KCSE Mean Grade D Plain or above.
- Dental Assistant requires KCSE Mean Grade D Plain or above.
- Health Records and IT requires KCSE Mean Grade C- or above.
- Application should be flagged if the grade does not meet minimum requirement.
- Admissions officer can override with reason if policy allows.

### Student Number Generation

Student number should be generated when application is converted to student.

Suggested format:

`RHTI/{PROGRAM}/{YEAR}/{SEQUENCE}`

Example:

`RHTI/CNA/2026/0001`

### Fee Assignment

- Student receives fee structure based on program and cohort.
- Fee structure can be split into installments.
- Payment plan can be customized per student.
- Student with overdue balance can be flagged for finance hold.

### Academic Progression

- Student can progress only if required modules, attendance, results, and fees meet policy.
- Failed modules should generate retake requirements.
- Results should not be visible to students until approved.

### Resource Assignment

Admin/trainer can assign resources by:

- Individual student
- Class
- Cohort
- Program
- Module

Student should only see resources assigned to them directly or through their class/cohort/program/module.

### Requests

- Every request must have category, status, owner, and history.
- Students can track all requests.
- Admin can route requests to departments.

### Clearance

Clearance should be checklist-based. A student is cleared only when every required checkpoint is approved.

Typical checkpoints:

- Finance
- Library
- Skills lab
- Academic office
- Attachment office
- Registrar

### Graduation Eligibility

Student is eligible for graduation if:

- All academic modules are passed.
- Attachment is complete.
- All required documents are verified.
- Finance balance meets policy.
- Clearance is complete.
- Registrar approves.

## n8n and WhatsApp Workflow Plan

n8n should be used as the workflow engine for WhatsApp admissions automation.

Recommended flow:

1. WhatsApp message received.
2. n8n identifies intent:
   - Course information
   - Fees
   - Entry requirements
   - Intakes
   - Location/contact
   - Application submission
3. n8n queries Postgres for official RHTI data.
4. n8n replies through WhatsApp.
5. If user wants to apply, n8n collects:
   - Full name
   - Phone
   - Email
   - Program
   - KCSE grade
   - KCSE year
6. n8n inserts the application into `applications`.
7. n8n sends confirmation to applicant.
8. n8n notifies admissions staff.

## Suggested Implementation Phases

### Phase 1: Admissions Foundation

- Finalize `applications`.
- Build admin application review screen.
- Add application status workflow.
- Add WhatsApp/n8n application submission.
- Add applicant-to-student conversion.

### Phase 2: Identity and Portals

- Add authentication.
- Add roles and permissions.
- Build admin portal shell.
- Build student portal shell.
- Add student account creation.

### Phase 3: Institution Setup

- Programs, modules, intakes, cohorts.
- Classes and trainers.
- Rooms/facilities.
- Document templates.

### Phase 4: Student Lifecycle

- Student records.
- Documents.
- Enrollment.
- Resource assignment.
- Timetables.
- Attendance.

### Phase 5: Finance

- Fee structures.
- Invoices.
- Payments.
- Receipts.
- Payment plans.
- Student balance view.

### Phase 6: Exams and Results

- Exam setup.
- Marks entry.
- Moderation.
- Results publishing.
- Transcripts.

### Phase 7: Attachments

- Hospital sites.
- Placement.
- Supervisors.
- Logs/evaluations.

### Phase 8: Requests, Clearance, Graduation

- Student requests.
- Clearance workflow.
- Graduation batches.
- Certificates and alumni records.

### Phase 9: Reporting and Automation

- Dashboards.
- Exports.
- Notifications.
- WhatsApp reminders.
- Audit reports.

## Development Notes

- Keep Postgres as the source of truth.
- Avoid hardcoding institute data in the frontend; seed and manage it in the database.
- Every major admin action should write to `audit_logs`.
- Build permissions before exposing sensitive student/finance/exam data.
- Keep student portal simple and status-driven.
- Prefer configurable workflows for admissions, requests, clearance, and graduation.
