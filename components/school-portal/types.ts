/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Core Roles
export type RoleName = 'super_admin' | 'student';

export interface User {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  role: RoleName;
  status: 'active' | 'suspended';
  created_at: string;
}

// 1. Applications
export interface Application {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  kcseGrade: string; // KCSE grade
  kcseYear: number;
  preferredProgramId: string;
  intakeTerm: string;
  status: 'new' | 'under_review' | 'accepted' | 'rejected' | 'waitlisted';
  reviewNotes?: string;
  assignedOfficer: string;
  source: 'website' | 'whatsapp' | 'staff';
  created_at: string;
}

// 2. Programs
export interface Program {
  id: string; // e.g. 'cna', 'da', 'hrit'
  code: string; // e.g. 'CNA'
  name: string; // e.g. 'Certified Nursing Assistant'
  durationMonths: number;
  tuitionFee: number;
  entryRequirement: string; // e.g. 'KCSE D Plain or above'
  minKcseGrade: string; // 'D', 'C-' etc for validation
  description: string;
}

// 3. Modules
export interface Module {
  id: string;
  code: string;
  name: string;
  programId: string;
  credits: number;
  prerequisites?: string[];
}

// 4. Cohorts
export interface Cohort {
  id: string;
  name: string; // e.g. 'CNA-2026-A'
  programId: string;
  intakeTerm: string;
  startDate: string;
}

// 5. Classes
export interface Class {
  id: string;
  name: string; // e.g. 'CNA Class 1'
  cohortId: string;
  lecturerName: string; // trainer
  room: string;
  status: 'planned' | 'active' | 'completed' | 'archived';
}

// 6. Students
export interface Student {
  id: string; // student_id, generated as RHTI/{PROGRAM}/{YEAR}/{SEQ}
  databaseId?: string; // internal relational key used only when calling scoped APIs
  userId: string; // linked user account ID
  applicationId?: string; // from application record
  fullName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  nationalId: string;
  residence: string;
  nextOfKinName: string;
  nextOfKinPhone: string;
  nextOfKinRelationship: string;
  status: 'active' | 'deferred' | 'suspended' | 'completed' | 'withdrawn' | 'graduated';
  holds: string[]; // 'finance_hold', 'document_hold', etc.
  created_at: string;

  // Enrollment Relationships (assigned on student dashboard)
  programId: string;
  cohortId: string;
  classId: string;
}

// 7. Onboarding Status
export interface OnboardingStatus {
  studentId: string;
  documentsUploaded: {
    nationalId: boolean;
    kcseSlip: boolean;
    passportPhoto: boolean;
    conductCertificate: boolean;
  };
  orientationCompleted: boolean;
  conductSigned: boolean;
  paymentPlanAccepted: boolean;
  status: 'pending' | 'in_progress' | 'verified';
}

// 8. Learning Resources
export interface LearningResource {
  id: string;
  title: string;
  type: 'pdf' | 'link' | 'video' | 'assignment' | 'policy' | 'timetable' | 'announcement';
  url: string;
  targetType: 'all' | 'program' | 'cohort' | 'class' | 'student';
  targetId: string; // references programId, cohortId, classId, or studentId
  uploadedBy: string;
  created_at: string;
}

// 9. Timetable Events
export interface TimetableEvent {
  id: string;
  classId: string;
  moduleId: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  startTime: string; // e.g. '08:30 AM'
  endTime: string; // e.g. '10:30 AM'
  room: string;
}

// 10. Exams
export interface Exam {
  id: string;
  classId: string;
  moduleId: string;
  name: string; // e.g. 'Nursing Fundamentals Midterm'
  date: string;
  maxMarks: number;
  weightPercent: number; // e.g. 40 for 40% weight
}

// 11. Marks / Results
export interface StudentMark {
  id: string;
  studentId: string;
  examId: string;
  moduleId: string;
  marksObtained: number;
  grade: string; // A, B, C, D, F
  status: 'Passed' | 'Failed' | 'Pending';
  isModerated: boolean;
  recordedBy: string;
  dateRecorded: string;
}

// 12. Fees Invoices and Payments
export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. 'INV-2026-0001'
  studentId: string;
  title: string; // e.g. 'Term 1 Tuition Fee'
  amount: number;
  dueDate: string;
  status: 'paid' | 'unpaid' | 'partially_paid';
  created_at: string;
}

export interface Payment {
  id: string;
  receiptNumber: string; // e.g. 'REC-2026-0001'
  invoiceId: string;
  studentId: string;
  amount: number;
  paymentMethod: 'MPesa' | 'Bank Transfer' | 'Cash';
  transactionReference: string;
  datePaid: string;
}

// 13. Student Requests
export interface StudentRequest {
  id: string;
  studentId: string;
  studentName: string;
  category: 'Deferment' | 'Leave of Absence' | 'Fee Plan' | 'Document Request' | 'Result Query' | 'Attachment Issue' | 'Clearance Request';
  subject: string;
  description: string;
  status: 'submitted' | 'assigned' | 'in_progress' | 'approved' | 'rejected' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  adminComments?: string;
}

// 14. Attachment Placements
export interface AttachmentPlacement {
  id: string;
  studentId: string;
  siteName: string; // e.g. 'Radiant Group of Hospitals - Ruiru Branch'
  supervisorName: string;
  department: string; // e.g. 'Outpatient', 'Maternity'
  startDate: string;
  endDate: string;
  completionStatus: 'pending' | 'active' | 'completed' | 'evaluated';
  evaluationScore?: number; // e.g. 85/100
  supervisorNotes?: string;
  logbooksSubmitted: number; // count of daily entries logged
}

// 15. Clearance Checkpoints
export interface ClearanceStatus {
  studentId: string;
  checkpointIds?: Partial<Record<'financeApproved' | 'libraryApproved' | 'skillsLabApproved' | 'academicOfficeApproved' | 'attachmentOfficeApproved' | 'registrarApproved', string>>;
  checkpoints: {
    financeApproved: boolean;
    libraryApproved: boolean;
    skillsLabApproved: boolean;
    academicOfficeApproved: boolean;
    attachmentOfficeApproved: boolean;
    registrarApproved: boolean;
  };
  comments: {
    finance?: string;
    library?: string;
    skillsLab?: string;
    academicOffice?: string;
    attachmentOffice?: string;
    registrar?: string;
  };
  status: 'pending' | 'in_progress' | 'cleared';
}

// 16. Graduation Batches
export interface GraduationBatch {
  id: string;
  name: string; // e.g. '12th Graduation Ceremony - Nov 2026'
  ceremonyDate: string;
  status: 'upcoming' | 'completed';
}

export interface GraduationCandidate {
  id: string;
  studentId: string;
  batchId: string;
  eligibilityStatus: 'eligible' | 'on_hold' | 'graduated';
  holdReason?: string;
  certificateIssued: boolean;
  certificateNumber?: string;
  transcriptIssued: boolean;
}

// Activity Log
export interface ActivityLog {
  id: string;
  userId?: string;
  studentId?: string;
  title: string;
  description: string;
  date: string;
  category: 'System' | 'Admissions' | 'Finance' | 'Academic' | 'Exams' | 'Clearance';
}
