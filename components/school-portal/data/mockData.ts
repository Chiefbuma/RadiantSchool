/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  User, 
  Application, 
  Program, 
  Module, 
  Cohort, 
  Class, 
  Student, 
  OnboardingStatus, 
  LearningResource, 
  TimetableEvent, 
  Exam, 
  StudentMark, 
  Invoice, 
  Payment, 
  StudentRequest, 
  AttachmentPlacement, 
  ClearanceStatus, 
  GraduationBatch, 
  GraduationCandidate, 
  ActivityLog 
} from '../types';

// Mock Users
export const INITIAL_USERS: User[] = [
  {
    id: 'u_admin_1',
    email: 'registrar@rhti.ac.ke',
    phone: '+254 712 345678',
    fullName: 'Dr. Julian Vane',
    role: 'super_admin',
    status: 'active',
    created_at: '2025-01-10'
  },
  {
    id: 'u_student_1',
    email: 'b.vance@rhti.student.ac.ke',
    phone: '+254 722 000111',
    fullName: 'Beatrice Vance',
    role: 'student',
    status: 'active',
    created_at: '2026-03-05'
  },
  {
    id: 'u_student_2',
    email: 'm.karanja@rhti.student.ac.ke',
    phone: '+254 733 444555',
    fullName: 'Moses Karanja',
    role: 'student',
    status: 'active',
    created_at: '2026-03-06'
  },
  {
    id: 'u_student_3',
    email: 'e.atieno@rhti.student.ac.ke',
    phone: '+254 711 999888',
    fullName: 'Elizabeth Atieno',
    role: 'student',
    status: 'active',
    created_at: '2026-03-07'
  }
];

// RHTI Programs
export const INITIAL_PROGRAMS: Program[] = [
  {
    id: 'prog_cna',
    code: 'CNA',
    name: 'Certified Nursing Assistant',
    durationMonths: 6,
    tuitionFee: 45000,
    entryRequirement: 'KCSE Mean Grade D Plain or above',
    minKcseGrade: 'D',
    description: 'Practical training on fundamental nursing procedures, patient hygiene, nutritional support, and clinical vital sign monitoring.'
  },
  {
    id: 'prog_da',
    code: 'DA',
    name: 'Dental Assistant',
    durationMonths: 9,
    tuitionFee: 60000,
    entryRequirement: 'KCSE Mean Grade D Plain or above',
    minKcseGrade: 'D',
    description: 'Specialized training in chairside dental assisting, sterilizing instrumentation, mixing dental materials, and dental radiography.'
  },
  {
    id: 'prog_hrit',
    code: 'HRIT',
    name: 'Health Records and IT',
    durationMonths: 12,
    tuitionFee: 75000,
    entryRequirement: 'KCSE Mean Grade C- or above',
    minKcseGrade: 'C-',
    description: 'Comprehensive curriculum on medical coding, digital health record management systems, healthcare statistics, and hospital databases.'
  }
];

// Program Modules / Units
export const INITIAL_MODULES: Module[] = [
  // CNA modules
  { id: 'mod_cna_1', code: 'CNA-101', name: 'Fundamentals of Patient Care', programId: 'prog_cna', credits: 4 },
  { id: 'mod_cna_2', code: 'CNA-102', name: 'Anatomy and Basic Physiology', programId: 'prog_cna', credits: 3 },
  { id: 'mod_cna_3', code: 'CNA-103', name: 'First Aid & Emergency Response', programId: 'prog_cna', credits: 2 },
  
  // Dental Assistant modules
  { id: 'mod_da_1', code: 'DA-201', name: 'Dental Anatomy & Nomenclature', programId: 'prog_da', credits: 4 },
  { id: 'mod_da_2', code: 'DA-202', name: 'Dental Materials & Instruments', programId: 'prog_da', credits: 4 },
  { id: 'mod_da_3', code: 'DA-203', name: 'Sterilization & Infection Control', programId: 'prog_da', credits: 3 },

  // Health Records modules
  { id: 'mod_hrit_1', code: 'HRIT-301', name: 'Medical Terminology & Coding ICD-11', programId: 'prog_hrit', credits: 4 },
  { id: 'mod_hrit_2', code: 'HRIT-302', name: 'Digital Health Information Systems', programId: 'prog_hrit', credits: 3 },
  { id: 'mod_hrit_3', code: 'HRIT-303', name: 'Healthcare Data Analysis & Stats', programId: 'prog_hrit', credits: 4 }
];

// Cohorts for Intakes
export const INITIAL_COHORTS: Cohort[] = [
  { id: 'coh_cna_2026', name: 'CNA-2026-A', programId: 'prog_cna', intakeTerm: 'Fall 2026', startDate: '2026-09-01' },
  { id: 'coh_da_2026', name: 'DA-2026-A', programId: 'prog_da', intakeTerm: 'Fall 2026', startDate: '2026-09-01' },
  { id: 'coh_hrit_2026', name: 'HRIT-2026-A', programId: 'prog_hrit', intakeTerm: 'Fall 2026', startDate: '2026-09-01' }
];

// Classes under cohorts
export const INITIAL_CLASSES: Class[] = [
  { id: 'cls_cna_1', name: 'CNA Senior Class 1', cohortId: 'coh_cna_2026', lecturerName: 'Dr. Ada Lovelace', room: 'Skills Lab 102', status: 'active' },
  { id: 'cls_da_1', name: 'DA Lab Class A', cohortId: 'coh_da_2026', lecturerName: 'Prof. Alan Turing', room: 'Dental Clinic Bay B', status: 'active' },
  { id: 'cls_hrit_1', name: 'HRIT Computing Team', cohortId: 'coh_hrit_2026', lecturerName: 'Dr. Grace Hopper', room: 'IT Lab 204', status: 'active' }
];

// Applications
export const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'app_1',
    fullName: 'Mary Wanjiku Nyambura',
    phone: '+254 701 123456',
    email: 'mary.nyambura@gmail.com',
    dateOfBirth: '2005-08-14',
    kcseGrade: 'D Plain',
    kcseYear: 2024,
    preferredProgramId: 'prog_cna',
    intakeTerm: 'Fall 2026',
    status: 'new',
    assignedOfficer: 'Alice Chebet',
    source: 'website',
    created_at: '2026-07-10'
  },
  {
    id: 'app_2',
    fullName: 'John Kiprop Kosgei',
    phone: '+254 725 987654',
    email: 'kiprop.kosgei@yahoo.com',
    dateOfBirth: '2004-11-22',
    kcseGrade: 'D-', // Warning: CNA requires D Plain, HRIT requires C-! John applied for HRIT with D-, which fails requirements.
    kcseYear: 2023,
    preferredProgramId: 'prog_hrit',
    intakeTerm: 'Fall 2026',
    status: 'under_review',
    reviewNotes: 'Grade is below the standard admission policy threshold of C- for HRIT. Flags generated.',
    assignedOfficer: 'David Mwangi',
    source: 'whatsapp',
    created_at: '2026-07-12'
  },
  {
    id: 'app_3',
    fullName: 'Cynthia Mwende',
    phone: '+254 714 555666',
    email: 'cynthia.mwende@hotmail.com',
    dateOfBirth: '2006-03-30',
    kcseGrade: 'D+',
    kcseYear: 2024,
    preferredProgramId: 'prog_da',
    intakeTerm: 'Fall 2026',
    status: 'accepted',
    reviewNotes: 'Meets minimum grade policy. Offer generated manually.',
    assignedOfficer: 'Alice Chebet',
    source: 'staff',
    created_at: '2026-07-01'
  },
  {
    id: 'app_4',
    fullName: 'Francis Kamau',
    phone: '+254 750 444333',
    email: 'francis.kamau@gmail.com',
    dateOfBirth: '2003-05-18',
    kcseGrade: 'C-',
    kcseYear: 2022,
    preferredProgramId: 'prog_hrit',
    intakeTerm: 'Fall 2026',
    status: 'accepted',
    reviewNotes: 'Grade verified. Acceptance letter received from applicant. Ready to register.',
    assignedOfficer: 'David Mwangi',
    source: 'whatsapp',
    created_at: '2026-06-20'
  }
];

// Active Students Registered (Post-Acceptance)
export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'RHTI/CNA/2026/0001',
    userId: 'u_student_1',
    fullName: 'Beatrice Vance',
    phone: '+254 722 000111',
    email: 'b.vance@rhti.student.ac.ke',
    dateOfBirth: '2004-03-12',
    nationalId: '38902145',
    residence: 'Ruiru, Town Center',
    nextOfKinName: 'Robert Vance',
    nextOfKinPhone: '+254 722 999000',
    nextOfKinRelationship: 'Father',
    status: 'active',
    holds: [],
    created_at: '2026-03-05',
    programId: 'prog_cna',
    cohortId: 'coh_cna_2026',
    classId: 'cls_cna_1'
  },
  {
    id: 'RHTI/DA/2026/0002',
    userId: 'u_student_2',
    fullName: 'Moses Karanja',
    phone: '+254 733 444555',
    email: 'm.karanja@rhti.student.ac.ke',
    dateOfBirth: '2005-01-20',
    nationalId: '39401239',
    residence: 'Githurai 45',
    nextOfKinName: 'Jane Karanja',
    nextOfKinPhone: '+254 733 000111',
    nextOfKinRelationship: 'Mother',
    status: 'active',
    holds: ['finance_hold'], // Has active balance, locked out of some features
    created_at: '2026-03-06',
    programId: 'prog_da',
    cohortId: 'coh_da_2026',
    classId: 'cls_da_1'
  },
  {
    id: 'RHTI/HRIT/2026/0003',
    userId: 'u_student_3',
    fullName: 'Elizabeth Atieno',
    phone: '+254 711 999888',
    email: 'e.atieno@rhti.student.ac.ke',
    dateOfBirth: '2004-07-15',
    nationalId: '38112233',
    residence: 'Kahawa Sukari',
    nextOfKinName: 'Daniel Atieno',
    nextOfKinPhone: '+254 711 555666',
    nextOfKinRelationship: 'Brother',
    status: 'completed', // Cleared for graduation
    holds: [],
    created_at: '2026-03-07',
    programId: 'prog_hrit',
    cohortId: 'coh_hrit_2026',
    classId: 'cls_hrit_1'
  }
];

// Onboarding statuses
export const INITIAL_ONBOARDING: OnboardingStatus[] = [
  {
    studentId: 'RHTI/CNA/2026/0001',
    documentsUploaded: { nationalId: true, kcseSlip: true, passportPhoto: true, conductCertificate: true },
    orientationCompleted: true,
    conductSigned: true,
    paymentPlanAccepted: true,
    status: 'verified'
  },
  {
    studentId: 'RHTI/DA/2026/0002',
    documentsUploaded: { nationalId: true, kcseSlip: true, passportPhoto: true, conductCertificate: false },
    orientationCompleted: true,
    conductSigned: true,
    paymentPlanAccepted: false,
    status: 'in_progress'
  },
  {
    studentId: 'RHTI/HRIT/2026/0003',
    documentsUploaded: { nationalId: true, kcseSlip: true, passportPhoto: true, conductCertificate: true },
    orientationCompleted: true,
    conductSigned: true,
    paymentPlanAccepted: true,
    status: 'verified'
  }
];

// Learning Resources Directory
export const INITIAL_RESOURCES: LearningResource[] = [
  {
    id: 'res_1',
    title: 'Hospital Hand Hygiene Protocol & WHO Standard Manual',
    type: 'pdf',
    url: 'https://who.int/clean_hands/en/hygiene_manual.pdf',
    targetType: 'program',
    targetId: 'prog_cna',
    uploadedBy: 'Dr. Ada Lovelace',
    created_at: '2026-04-10'
  },
  {
    id: 'res_2',
    title: 'Infection Control and Autoclave Sterilization Lecture Slides',
    type: 'pdf',
    url: 'https://rhti.ac.ke/faculty/da/sterilization.pdf',
    targetType: 'cohort',
    targetId: 'coh_da_2026',
    uploadedBy: 'Prof. Alan Turing',
    created_at: '2026-04-15'
  },
  {
    id: 'res_3',
    title: 'Introduction to ICD-11 Diagnosis Coding Walkthrough Video',
    type: 'video',
    url: 'https://youtube.com/watch?v=icd11coding',
    targetType: 'class',
    targetId: 'cls_hrit_1',
    uploadedBy: 'Dr. Grace Hopper',
    created_at: '2026-04-12'
  },
  {
    id: 'res_4',
    title: 'RHTI Academic Code of Conduct & Ethics Charter',
    type: 'policy',
    url: 'https://rhti.ac.ke/policies/conduct.pdf',
    targetType: 'all',
    targetId: 'all',
    uploadedBy: 'Dr. Julian Vane',
    created_at: '2026-03-01'
  }
];

// Timetable Events
export const INITIAL_TIMETABLE: TimetableEvent[] = [
  { id: 'tt_1', classId: 'cls_cna_1', moduleId: 'mod_cna_1', dayOfWeek: 'Monday', startTime: '08:30 AM', endTime: '10:30 AM', room: 'Skills Lab 102' },
  { id: 'tt_2', classId: 'cls_cna_1', moduleId: 'mod_cna_2', dayOfWeek: 'Wednesday', startTime: '11:00 AM', endTime: '01:00 PM', room: 'Skills Lab 102' },
  { id: 'tt_3', classId: 'cls_da_1', moduleId: 'mod_da_1', dayOfWeek: 'Tuesday', startTime: '09:00 AM', endTime: '12:00 PM', room: 'Dental Clinic Bay B' },
  { id: 'tt_4', classId: 'cls_hrit_1', moduleId: 'mod_hrit_1', dayOfWeek: 'Thursday', startTime: '10:00 AM', endTime: '01:00 PM', room: 'IT Lab 204' }
];

// Exams
export const INITIAL_EXAMS: Exam[] = [
  { id: 'ex_cna_mid', classId: 'cls_cna_1', moduleId: 'mod_cna_1', name: 'Fundamentals of Patient Care Midterm', date: '2026-10-15', maxMarks: 100, weightPercent: 40 },
  { id: 'ex_cna_fin', classId: 'cls_cna_1', moduleId: 'mod_cna_1', name: 'Fundamentals of Patient Care Theory Final', date: '2026-12-18', maxMarks: 100, weightPercent: 60 },
  { id: 'ex_da_mid', classId: 'cls_da_1', moduleId: 'mod_da_1', name: 'Dental Anatomy Nomenclature Exam', date: '2026-10-22', maxMarks: 100, weightPercent: 50 },
  { id: 'ex_hrit_mid', classId: 'cls_hrit_1', moduleId: 'mod_hrit_1', name: 'ICD-11 Medical Terminology Term Test', date: '2026-10-25', maxMarks: 100, weightPercent: 40 }
];

// Marks recorded
export const INITIAL_MARKS: StudentMark[] = [
  {
    id: 'mk_1',
    studentId: 'RHTI/CNA/2026/0001',
    examId: 'ex_cna_mid',
    moduleId: 'mod_cna_1',
    marksObtained: 84,
    grade: 'A',
    status: 'Passed',
    isModerated: true,
    recordedBy: 'Dr. Ada Lovelace',
    dateRecorded: '2026-10-16'
  },
  {
    id: 'mk_2',
    studentId: 'RHTI/DA/2026/0002',
    examId: 'ex_da_mid',
    moduleId: 'mod_da_1',
    marksObtained: 55,
    grade: 'C',
    status: 'Passed',
    isModerated: true,
    recordedBy: 'Prof. Alan Turing',
    dateRecorded: '2026-10-23'
  },
  {
    id: 'mk_3',
    studentId: 'RHTI/HRIT/2026/0003',
    examId: 'ex_hrit_mid',
    moduleId: 'mod_hrit_1',
    marksObtained: 91,
    grade: 'A',
    status: 'Passed',
    isModerated: true,
    recordedBy: 'Dr. Grace Hopper',
    dateRecorded: '2026-10-26'
  }
];

// Invoices
export const INITIAL_INVOICES: Invoice[] = [
  { id: 'inv_1', invoiceNumber: 'INV-2026-0001', studentId: 'RHTI/CNA/2026/0001', title: 'CNA Tuition & Clinical Labs Fee', amount: 45000, dueDate: '2026-09-15', status: 'paid', created_at: '2026-03-05' },
  { id: 'inv_2', invoiceNumber: 'INV-2026-0002', studentId: 'RHTI/DA/2026/0002', title: 'DA Orthodontic Materials & Tuition Fee', amount: 60000, dueDate: '2026-09-15', status: 'partially_paid', created_at: '2026-03-06' },
  { id: 'inv_3', invoiceNumber: 'INV-2026-0003', studentId: 'RHTI/HRIT/2026/0003', title: 'HRIT Computing Resources Tuition Fee', amount: 75000, dueDate: '2026-09-15', status: 'paid', created_at: '2026-03-07' }
];

// Payments
export const INITIAL_PAYMENTS: Payment[] = [
  { id: 'pay_1', receiptNumber: 'REC-2026-0001', invoiceId: 'inv_1', studentId: 'RHTI/CNA/2026/0001', amount: 45000, paymentMethod: 'MPesa', transactionReference: 'QF99XK2830J', datePaid: '2026-03-10' },
  { id: 'pay_2', receiptNumber: 'REC-2026-0002', invoiceId: 'inv_2', studentId: 'RHTI/DA/2026/0002', amount: 20000, paymentMethod: 'Bank Transfer', transactionReference: 'CH-TRANS-4819', datePaid: '2026-03-12' },
  { id: 'pay_3', receiptNumber: 'REC-2026-0003', invoiceId: 'inv_3', studentId: 'RHTI/HRIT/2026/0003', amount: 75000, paymentMethod: 'MPesa', transactionReference: 'QG11ZZ4810M', datePaid: '2026-03-10' }
];

// Student Requests
export const INITIAL_REQUESTS: StudentRequest[] = [
  {
    id: 'req_1',
    studentId: 'RHTI/DA/2026/0002',
    studentName: 'Moses Karanja',
    category: 'Fee Plan',
    subject: 'Request for Tuition Installment Extension',
    description: 'I would like to pay the remaining 40,000 Kes balance in two subsequent installments of 20,000 Kes on October 15th and November 15th due to severe family agricultural constraints.',
    status: 'assigned',
    priority: 'high',
    createdAt: '2026-07-14',
    adminComments: 'Assigned to Finance Desk for invoice installment scheduling review.'
  },
  {
    id: 'req_2',
    studentId: 'RHTI/CNA/2026/0001',
    studentName: 'Beatrice Vance',
    category: 'Attachment Issue',
    subject: 'Supervision Site Clarification',
    description: 'Requesting confirmation on whether my supervisor for Radiant Ruiru branch will visit on morning or afternoon shift for assessment.',
    status: 'approved',
    priority: 'medium',
    createdAt: '2026-07-11',
    adminComments: 'Confirmed with supervisor Dr. Lovelace. Assessments are structured for morning rotations.'
  }
];

// Clinical Hospital Attachment Placements
export const INITIAL_ATTACHMENTS: AttachmentPlacement[] = [
  {
    id: 'att_1',
    studentId: 'RHTI/CNA/2026/0001',
    siteName: 'Radiant Group of Hospitals - Ruiru General',
    supervisorName: 'Sister Mary Teresa',
    department: 'Maternity & Ward General',
    startDate: '2026-10-01',
    endDate: '2026-12-15',
    completionStatus: 'active',
    logbooksSubmitted: 14
  },
  {
    id: 'att_2',
    studentId: 'RHTI/HRIT/2026/0003',
    siteName: 'Radiant Group of Hospitals - Kiambu Clinic',
    supervisorName: 'Mr. James Omondi',
    department: 'Records Management & Coding Desk',
    startDate: '2026-06-01',
    endDate: '2026-08-30',
    completionStatus: 'completed',
    evaluationScore: 94,
    supervisorNotes: 'Elizabeth showed exemplary proficiency in medical coding system ICD-11 and handled patient files with extreme confidentiality.',
    logbooksSubmitted: 30
  }
];

// Clearance status
export const INITIAL_CLEARANCES: ClearanceStatus[] = [
  {
    studentId: 'RHTI/CNA/2026/0001',
    checkpoints: { financeApproved: true, libraryApproved: true, skillsLabApproved: false, academicOfficeApproved: false, attachmentOfficeApproved: false, registrarApproved: false },
    comments: { finance: 'Paid full tuition balance', library: 'No outstanding book borrowings' },
    status: 'in_progress'
  },
  {
    studentId: 'RHTI/DA/2026/0002',
    checkpoints: { financeApproved: false, libraryApproved: true, skillsLabApproved: false, academicOfficeApproved: false, attachmentOfficeApproved: false, registrarApproved: false },
    comments: { finance: 'Outstanding balance of KES 40,000 must be cleared first', library: 'No outstanding book borrowings' },
    status: 'pending'
  },
  {
    studentId: 'RHTI/HRIT/2026/0003',
    checkpoints: { financeApproved: true, libraryApproved: true, skillsLabApproved: true, academicOfficeApproved: true, attachmentOfficeApproved: true, registrarApproved: true },
    comments: { finance: 'Fully cleared', library: 'No outstanding book borrowings', registrar: 'All credentials audited and approved' },
    status: 'cleared'
  }
];

// Graduation Batches
export const INITIAL_GRADUATION_BATCHES: GraduationBatch[] = [
  { id: 'gb_1', name: 'RHTI 12th Graduation Ceremony - Nov 2026', ceremonyDate: '2026-11-20', status: 'upcoming' },
  { id: 'gb_2', name: 'RHTI 11th Graduation Ceremony - Nov 2025', ceremonyDate: '2025-11-15', status: 'completed' }
];

export const INITIAL_GRADUATION_CANDIDATES: GraduationCandidate[] = [
  {
    id: 'gc_1',
    studentId: 'RHTI/HRIT/2026/0003',
    batchId: 'gb_1',
    eligibilityStatus: 'eligible',
    certificateIssued: false,
    transcriptIssued: true
  }
];

// Initial audit / activity logs
export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'act_1',
    title: 'Admissions Automation Online',
    description: 'Postgres application trigger initialized. Ready to receive website/WhatsApp webhook applications.',
    date: '2026-07-01',
    category: 'System'
  },
  {
    id: 'act_2',
    title: 'New Student Intake Registered',
    description: 'Elizabeth Atieno formally moved from "Accepted Applicant" state to "Registered Student" with ID RHTI/HRIT/2026/0003.',
    date: '2026-03-07',
    category: 'Admissions'
  },
  {
    id: 'act_3',
    title: 'Fees Payment Confirmed',
    description: 'Beatrice Vance fully paid KES 45,000 tuition fee via MPesa reference QF99XK2830J.',
    date: '2026-03-10',
    category: 'Finance'
  },
  {
    id: 'act_4',
    title: 'Attachment Supervisor Assigned',
    description: 'Sister Mary Teresa designated supervisor for Beatrice Vance at Radiant Group Ruiru.',
    date: '2026-04-12',
    category: 'Academic'
  }
];
