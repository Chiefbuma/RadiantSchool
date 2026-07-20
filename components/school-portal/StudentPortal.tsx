/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import React, { useState } from 'react';
import { 
  Student, 
  Program, 
  Cohort, 
  Class, 
  Module, 
  TimetableEvent, 
  LearningResource, 
  Invoice, 
  Payment, 
  StudentRequest, 
  AttachmentPlacement, 
  ClearanceStatus, 
  GraduationBatch, 
  GraduationCandidate, 
  StudentMark,
  Exam
} from './types';
import { 
  BookOpen, 
  Calendar, 
  FileText, 
  CreditCard, 
  MessageSquare, 
  CheckCircle, 
  Award, 
  Plus, 
  Activity, 
  User, 
  MapPin, 
  ShieldAlert, 
  ShieldCheck, 
  CheckSquare, 
  ClipboardList,
  X,
  Menu
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNotifications } from './notifications';

interface StudentPortalProps {
  students: Student[];
  loggedInStudentId: string;
  programs: Program[];
  cohorts: Cohort[];
  classes: Class[];
  modules: Module[];
  timetable: TimetableEvent[];
  resources: LearningResource[];
  invoices: Invoice[];
  payments: Payment[];
  requests: StudentRequest[];
  attachments: AttachmentPlacement[];
  clearances: ClearanceStatus[];
  graduationBatches: GraduationBatch[];
  graduationCandidates: GraduationCandidate[];
  marks: StudentMark[];
  exams: Exam[];

  onAddPayment: (paymentData: Omit<Payment, 'id' | 'receiptNumber' | 'datePaid'>) => void;
  onAddRequest: (requestData: Omit<StudentRequest, 'id' | 'createdAt' | 'studentName'>) => void;
  onLogAttachmentHour: (placementId: string) => void;
}

export default function StudentPortal({
  students,
  loggedInStudentId,
  programs,
  cohorts,
  classes,
  modules,
  timetable,
  resources,
  invoices,
  payments,
  requests,
  attachments,
  clearances,
  graduationBatches,
  graduationCandidates,
  marks,
  exams,

  onAddPayment,
  onAddRequest,
  onLogAttachmentHour
}: StudentPortalProps) {
  const { toast } = useNotifications();
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'academics' | 'exams' | 'fees' | 'requests' | 'clearance'>('dashboard');
  
  // Simulated Fee payment states
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<'MPesa' | 'Bank Transfer' | 'Cash'>('MPesa');
  const [payRef, setPayRef] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');

  // Request form state
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [reqCategory, setReqCategory] = useState<StudentRequest['category']>('Fee Plan');
  const [reqSubject, setReqSubject] = useState('');
  const [reqDesc, setReqDesc] = useState('');
  const [reqPriority, setReqPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Find logged in student record
  const student = students.find(s => s.id === loggedInStudentId);

  if (!student) {
    return (
      <div className="p-6 text-center border-4 border-zinc-900 bg-white neo-shadow uppercase font-bold text-zinc-500">
        Student account not found or deactivated.
      </div>
    );
  }

  // Related models
  const program = programs.find(p => p.id === student.programId);
  const cohort = cohorts.find(c => c.id === student.cohortId);
  const studentClass = classes.find(cl => cl.id === student.classId);

  // Student specific arrays
  const studentInvoices = invoices.filter(i => i.studentId === student.id);
  const studentPayments = payments.filter(p => p.studentId === student.id);
  const studentRequests = requests.filter(r => r.studentId === student.id);
  const studentAttachments = attachments.filter(a => a.studentId === student.id);
  const studentClearance = clearances.find(c => c.studentId === student.id);
  const studentGraduation = graduationCandidates.find(g => g.studentId === student.id);
  const studentMarks = marks.filter(m => m.studentId === student.id);
  const studentExams = exams.filter(exam => !exam.classId || exam.classId === student.classId);
  const today = new Date().toISOString().slice(0, 10);
  const upcomingExams = studentExams.filter(exam => exam.date >= today && !studentMarks.some(mark => mark.examId === exam.id)).sort((a,b) => a.date.localeCompare(b.date));
  const completedExams = studentExams.filter(exam => exam.date < today || studentMarks.some(mark => mark.examId === exam.id)).sort((a,b) => b.date.localeCompare(a.date));

  // Filter modules of the student's program
  const studentModules = modules.filter(m => m.programId === student.programId);

  // Filter timetable for student's assigned class
  const studentTimetables = timetable.filter(t => t.classId === student.classId);

  // Filter resources
  const studentResources = resources.filter(res => {
    if (res.targetType === 'all') return true;
    if (res.targetType === 'program' && res.targetId === student.programId) return true;
    if (res.targetType === 'cohort' && res.targetId === student.cohortId) return true;
    if (res.targetType === 'class' && res.targetId === student.classId) return true;
    if (res.targetType === 'student' && res.targetId === student.id) return true;
    return false;
  });

  // Calculate fee totals
  const totalInvoiced = studentInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = studentPayments.reduce((sum, p) => sum + p.amount, 0);
  const outstandingBalance = totalInvoiced - totalPaid;

  const handlePayFeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0 || !selectedInvoiceId) {
      toast('Payment details required', { tone: 'warning', message: 'Choose an invoice and enter a valid payment amount.' });
      return;
    }

    onAddPayment({
      invoiceId: selectedInvoiceId,
      studentId: student.id,
      amount: Number(payAmount),
      paymentMethod: payMethod,
      transactionReference: payRef || 'TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase()
    });

    // Reset fields
    setPayAmount('');
    setPayRef('');
    setShowPayModal(false);
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqSubject || !reqDesc) {
      toast('Request details required', { tone: 'warning', message: 'Enter both a subject and description.' });
      return;
    }

    onAddRequest({
      studentId: student.id,
      category: reqCategory,
      subject: reqSubject,
      description: reqDesc,
      status: 'submitted',
      priority: reqPriority
    });

    setReqSubject('');
    setReqDesc('');
    setShowRequestForm(false);
  };

  return (
    <motion.div key={activeSubTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .22 }} id="student-portal" className="space-y-6">
      
      {/* Student Top Info Card */}
      <div className="flex flex-col items-start justify-between gap-4 border-4 border-zinc-900 bg-zinc-900 p-4 text-white neo-shadow-sm sm:p-6 md:flex-row md:items-center">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-yellow-400 text-zinc-900 font-black px-2 py-0.5 border border-zinc-900 uppercase">
              STUDENT PROFILE PORTAL
            </span>
            <span className="text-[10px] bg-zinc-800 text-zinc-300 font-black px-2 py-0.5 uppercase tracking-wider font-mono border border-zinc-700">
              {student.id}
            </span>
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tight text-[#d15a2a]">{student.fullName}</h2>
          <p className="text-xs font-black uppercase text-[#d15a2a]">
            Certificate in {program?.name} ({program?.code}) &bull; Cohort: {cohort?.name || 'TBA'} &bull; Class: {studentClass?.name || 'Unassigned'}
          </p>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 sm:gap-4 md:w-auto md:flex-nowrap">
          <div className="bg-zinc-800 p-3 border-2 border-zinc-700 text-center rounded-none font-mono min-w-[120px]">
            <div className="text-[9px] text-zinc-400 uppercase font-sans font-bold">FEES BALANCE</div>
            <div className={`text-lg font-black ${outstandingBalance > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              KES {outstandingBalance.toLocaleString()}
            </div>
          </div>
          <div className="bg-zinc-800 p-3 border-2 border-zinc-700 text-center rounded-none font-mono min-w-[100px]">
            <div className="text-[9px] text-zinc-400 uppercase font-sans font-bold">ONBOARDING</div>
            <div className="text-sm font-black text-yellow-400 uppercase">
              {student.status.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Holds Banner Alert */}
      {student.holds.length > 0 && (
        <div className="bg-rose-100 text-rose-950 border-4 border-zinc-900 p-4 rounded-none flex items-center gap-3 font-bold uppercase text-xs">
          <ShieldAlert className="text-rose-700 shrink-0" size={24} />
          <div className="space-y-0.5">
            <div>ACCOUNT COMPLIANCE FLAG: ACTIVE SYSTEM LOCKOUTS</div>
            <p className="text-[10px] text-rose-800 normal-case font-medium">
              Your profile has flags: {student.holds.map(h => <b>{h.replace('_', ' ').toUpperCase()}</b>).reduce<React.ReactNode[]>((prev, curr) => [prev, ', ', curr], [])}. Please resolve tuition balances with the bursar desk to reactivate full exam clearance operations.
            </p>
          </div>
        </div>
      )}

      {/* Compact tabs remain visible on mobile; no sidebar or horizontal scrolling. */}
      <div className="grid grid-cols-3 border-b-4 border-zinc-900 sm:grid-cols-6">
        {[
          { key: 'dashboard', label: 'Profile', desktopLabel: 'Dashboard & Profile', icon: Activity },
          { key: 'academics', label: 'Academics', desktopLabel: 'Academic & Attachments', icon: BookOpen },
          { key: 'exams', label: 'Exams', desktopLabel: 'Exams & Results', icon: ClipboardList },
          { key: 'fees', label: 'Fees', desktopLabel: 'Financial Ledger', icon: CreditCard },
          { key: 'requests', label: 'Support', desktopLabel: 'Support Requests', icon: MessageSquare },
          { key: 'clearance', label: 'Clearance', desktopLabel: 'Clearance & Graduation', icon: Award }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: .97 }}
              key={tab.key}
              onClick={() => setActiveSubTab(tab.key as any)}
              className={`flex min-w-0 items-center justify-center gap-1 border-x border-t-2 border-zinc-900 px-1 py-2 text-[9px] font-black uppercase leading-tight tracking-tight transition-all sm:gap-2 sm:px-2 sm:py-3 sm:text-[10px] lg:text-xs ${
                activeSubTab === tab.key
                  ? 'bg-yellow-400 text-zinc-900 border-t-zinc-900'
                  : 'bg-white hover:bg-zinc-100 text-zinc-500 border-t-transparent'
              }`}
            >
              <Icon size={14} />
              <span className="sm:hidden">{tab.label}</span><span className="hidden sm:inline">{tab.desktopLabel}</span>
            </motion.button>
          );
        })}
      </div>

      {/* SUB-TAB CONTENTS */}

      {/* 1. DASHBOARD & PROFILE */}
      {activeSubTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main profile fields */}
          <div className="lg:col-span-2 bg-white border-2 border-zinc-900 p-6 neo-shadow-sm space-y-4">
            <h3 className="text-base font-black text-zinc-900 border-b-2 border-zinc-100 pb-2 uppercase tracking-wide">
              Official Registrar Profile Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 uppercase text-xs">
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400 font-black tracking-widest block">FULL STUDENT NAME</span>
                <div className="p-2 bg-zinc-50 border border-zinc-900 font-bold">{student.fullName}</div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400 font-black tracking-widest block">ADMISSION REG NO</span>
                <div className="p-2 bg-zinc-50 border border-zinc-900 font-mono font-bold text-blue-700">{student.id}</div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400 font-black tracking-widest block">EMAIL ADDRESS</span>
                <div className="p-2 bg-zinc-50 border border-zinc-900 font-mono text-zinc-600 font-bold lowercase">{student.email}</div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400 font-black tracking-widest block">TELEPHONE NUMBER</span>
                <div className="p-2 bg-zinc-50 border border-zinc-900 font-mono font-bold">{student.phone}</div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400 font-black tracking-widest block">DATE OF BIRTH</span>
                <div className="p-2 bg-zinc-50 border border-zinc-900 font-mono font-bold">{student.dateOfBirth}</div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400 font-black tracking-widest block">NATIONAL ID / DOCUMENT NO</span>
                <div className="p-2 bg-zinc-50 border border-zinc-900 font-mono font-bold">{student.nationalId}</div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400 font-black tracking-widest block">RESIDENTIAL PARISH/ESTATE</span>
                <div className="p-2 bg-zinc-50 border border-zinc-900 font-bold">{student.residence}</div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400 font-black tracking-widest block">NEXT OF KIN CONTACT</span>
                <div className="p-2 bg-zinc-50 border border-zinc-900 font-bold">
                  {student.nextOfKinName} ({student.nextOfKinRelationship}) - {student.nextOfKinPhone}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-zinc-100">
              <span className="text-[10px] text-zinc-400 font-black tracking-widest uppercase block mb-2">
                DATABASE SCHEMA SYNCHRONIZATION CHAIN
              </span>
              <div className="bg-zinc-100 p-3 border border-zinc-900 text-[10px] font-mono lowercase normal-case flex items-center gap-2">
                <Activity size={14} className="text-zinc-900 shrink-0" />
                <span>
                  <b>portal_students</b> ({student.id}) &rarr; <b>portal_student_enrollments</b> &rarr; <b>portal_programs</b> ({student.programId}) &rarr; <b>portal_cohorts</b> &rarr; <b>portal_classes</b>
                </span>
              </div>
            </div>
          </div>

          {/* Onboarding requirements checklist */}
          <div className="bg-white border-2 border-zinc-900 p-6 neo-shadow-sm space-y-4">
            <h3 className="text-base font-black text-zinc-900 border-b-2 border-zinc-100 pb-2 uppercase tracking-wide">
              Onboarding Checklist
            </h3>

            {/* Find onboarding status */}
            {(() => {
              const o = clearances.find(c => c.studentId === student.id); // Or let's mock checks
              return (
                <div className="space-y-4 uppercase text-xs">
                  <div className="flex justify-between items-center bg-zinc-50 p-2.5 border border-zinc-900">
                    <span className="font-bold">National ID Copy:</span>
                    <span className="text-emerald-600 font-black flex items-center gap-1"><CheckCircle size={14} /> Uploaded</span>
                  </div>
                  <div className="flex justify-between items-center bg-zinc-50 p-2.5 border border-zinc-900">
                    <span className="font-bold">KCSE Results Slip:</span>
                    <span className="text-emerald-600 font-black flex items-center gap-1"><CheckCircle size={14} /> Uploaded</span>
                  </div>
                  <div className="flex justify-between items-center bg-zinc-50 p-2.5 border border-zinc-900">
                    <span className="font-bold">Good Conduct Cert:</span>
                    {student.id.includes('DA') ? (
                      <span className="text-yellow-600 font-black">pending upload</span>
                    ) : (
                      <span className="text-emerald-600 font-black flex items-center gap-1"><CheckCircle size={14} /> Uploaded</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center bg-zinc-50 p-2.5 border border-zinc-900">
                    <span className="font-bold">Student Code of Conduct:</span>
                    <span className="text-emerald-600 font-black flex items-center gap-1"><CheckCircle size={14} /> Signed</span>
                  </div>
                  <div className="flex justify-between items-center bg-zinc-50 p-2.5 border border-zinc-900">
                    <span className="font-bold">Tuition Payment Schedule:</span>
                    {student.holds.includes('finance_hold') ? (
                      <span className="text-red-600 font-black">rejected (due)</span>
                    ) : (
                      <span className="text-emerald-600 font-black flex items-center gap-1"><CheckCircle size={14} /> Accepted</span>
                    )}
                  </div>

                  <div className="pt-2">
                    <div className="text-[10px] text-zinc-400 font-black">Onboarding Clearance State:</div>
                    <div className="text-base font-black text-zinc-900 uppercase">
                      {student.holds.includes('finance_hold') || student.id.includes('DA') ? 'in_progress' : 'fully_verified'}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

        </div>
      )}

      {/* 2. ACADEMICS & ATTACHMENTS */}
      {activeSubTab === 'academics' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Registered Modules & Timetable */}
            <div className="lg:col-span-2 bg-white border-2 border-zinc-900 p-6 neo-shadow-sm space-y-4">
              <h3 className="text-base font-black text-zinc-900 border-b-2 border-zinc-100 pb-2 uppercase tracking-wide flex items-center justify-between">
                <span>Program Modules Undergoing</span>
                <span className="text-xs bg-zinc-950 text-white font-mono px-2 py-0.5 rounded-none uppercase">
                  {studentModules.length} Modules
                </span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {studentModules.map(m => {
                  // Find if mark is entered
                  const mark = studentMarks.find(mk => mk.moduleId === m.id);
                  return (
                    <div key={m.id} className="p-3 bg-zinc-50 border-2 border-zinc-900 rounded-none space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">{m.code}</span>
                          <h4 className="text-xs font-black text-zinc-900 uppercase tracking-tight leading-tight">{m.name}</h4>
                        </div>
                        <span className="text-[9px] bg-zinc-900 text-white font-black px-1.5 py-0.5 rounded-none font-mono">
                          {m.credits} CR
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center text-[10px] uppercase font-bold pt-1 border-t border-zinc-200">
                        <span className="text-zinc-500">Academic Result:</span>
                        {mark ? (
                          <span className={`font-black ${mark.status === 'Passed' ? 'text-emerald-700' : 'text-red-700'}`}>
                            {mark.marksObtained}% &bull; GRADE {mark.grade} ({mark.status.toUpperCase()})
                          </span>
                        ) : (
                          <span className="text-zinc-400 italic">No Marks Published</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Timetable schedule events */}
              <div className="pt-4 space-y-3">
                <h4 className="text-xs font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={14} /> Weekly Lectures & Skills Lab Timetable
                </h4>
                
                {studentTimetables.length === 0 ? (
                  <p className="text-[10px] text-zinc-400 italic">No class scheduling events logged.</p>
                ) : (
                  <div className="border-2 border-zinc-900 rounded-none overflow-hidden uppercase font-bold text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-zinc-100 border-b-2 border-zinc-900">
                        <tr>
                          <th className="p-2 text-[10px] tracking-widest text-zinc-500">Day</th>
                          <th className="p-2 text-[10px] tracking-widest text-zinc-500">Time Window</th>
                          <th className="p-2 text-[10px] tracking-widest text-zinc-500">Unit Name</th>
                          <th className="p-2 text-[10px] tracking-widest text-zinc-500">Assigned Laboratory/Room</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 bg-white">
                        {studentTimetables.map(t => {
                          const mod = modules.find(m => m.id === t.moduleId);
                          return (
                            <tr key={t.id} className="hover:bg-zinc-50">
                              <td className="p-2 font-black text-zinc-900">{t.dayOfWeek}</td>
                              <td className="p-2 font-mono text-[11px] text-blue-700">{t.startTime} - {t.endTime}</td>
                              <td className="p-2 text-[11px] text-zinc-700 leading-tight">{mod?.name || t.moduleId}</td>
                              <td className="p-2 text-[11px] text-zinc-600 font-mono">{t.room}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>

            {/* Right Column: Learning Materials Directory */}
            <div className="bg-white border-2 border-zinc-900 p-6 neo-shadow-sm space-y-4">
              <h3 className="text-base font-black text-zinc-900 border-b-2 border-zinc-100 pb-2 uppercase tracking-wide">
                Assigned Resources
              </h3>

              <div className="space-y-3">
                {studentResources.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic font-bold">No academic curriculum files or policy documents uploaded.</p>
                ) : (
                  studentResources.map(res => (
                    <div key={res.id} className="p-3 border-2 border-zinc-900 rounded-none hover:bg-zinc-50 space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] bg-blue-100 text-blue-800 border border-blue-900 font-black px-1.5 py-0.5 rounded-none uppercase font-mono">
                          {res.type.toUpperCase()}
                        </span>
                        <span className="text-[8px] font-mono text-zinc-400">{res.created_at}</span>
                      </div>
                      
                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-zinc-900 uppercase tracking-tight">{res.title}</h4>
                        <p className="text-[10px] font-medium text-zinc-500 lowercase">Uploaded by: {res.uploadedBy}</p>
                      </div>

                      <a 
                        href={res.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-wider block pt-1 border-t border-zinc-100 cursor-pointer"
                      >
                        Download / Access Resource &rarr;
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Clinical Hospital Attachment Placement */}
          <div className="bg-white border-2 border-zinc-900 p-6 neo-shadow-sm space-y-4">
            <h3 className="text-base font-black text-zinc-900 border-b-2 border-zinc-100 pb-2 uppercase tracking-wide flex items-center justify-between">
              <span className="flex items-center gap-2"><MapPin size={18} className="text-rose-600" /> Clinical Rotations & Hospital Attachment</span>
              <span className="text-xs text-zinc-500 uppercase font-bold">Radiant Group of Hospitals Site System</span>
            </h3>

            {studentAttachments.length === 0 ? (
              <div className="p-6 text-center border-2 border-zinc-900 border-dashed bg-zinc-50">
                <p className="text-xs text-zinc-400 font-black uppercase">No active clinical attachment scheduled in our hospital network yet.</p>
              </div>
            ) : (
              <div className="space-y-4 uppercase text-xs">
                {studentAttachments.map(att => (
                  <div key={att.id} className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 border-2 border-zinc-900 bg-zinc-50/50 rounded-none">
                    
                    <div className="space-y-2">
                      <div>
                        <span className="text-[10px] text-zinc-400 font-black block tracking-widest">HOSPITAL PLACEMENT SITE</span>
                        <span className="font-black text-zinc-900 text-sm leading-tight block pt-0.5">{att.siteName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 font-black block tracking-widest">ASSIGNED DEPARTMENT / rotation</span>
                        <span className="font-bold text-zinc-800 block pt-0.5">{att.department}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] text-zinc-400 font-black block tracking-widest">START DATE</span>
                          <span className="font-mono font-bold block pt-0.5">{att.startDate}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-400 font-black block tracking-widest">END DATE</span>
                          <span className="font-mono font-bold block pt-0.5">{att.endDate}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 font-black block tracking-widest">CLINICAL SUPERVISOR</span>
                        <span className="font-bold text-zinc-800 block pt-0.5">{att.supervisorName}</span>
                      </div>
                    </div>

                    <div className="space-y-3 bg-white p-3 border border-zinc-900 text-center flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] text-zinc-400 font-black tracking-widest block">LOGBOOK CLINICAL ENTRIES</span>
                        <span className="font-mono font-black text-2xl text-zinc-900 block">{att.logbooksSubmitted} logged days</span>
                      </div>

                      {att.completionStatus === 'active' ? (
                        <button
                          onClick={() => onLogAttachmentHour(att.id)}
                          className="w-full py-1.5 border-2 border-zinc-900 bg-yellow-400 hover:bg-yellow-500 font-black text-[10px] uppercase tracking-wider transition rounded-none cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Plus size={12} /> Log Daily Clinic Evaluation Day
                        </button>
                      ) : (
                        <div className="p-1 bg-emerald-50 border border-emerald-950 text-[10px] text-emerald-800 font-black uppercase flex items-center justify-center gap-1">
                          <CheckSquare size={12} /> Placement Completed & Evaluated: {att.evaluationScore}/100
                        </div>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* 3. EXAMS & RESULTS */}
      {activeSubTab === 'exams' && (
        <div className="space-y-6">
          <section className="space-y-4 border-2 border-zinc-900 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-2 border-b-2 border-zinc-100 pb-3">
              <h3 className="text-base font-black uppercase tracking-wide text-zinc-900">Upcoming Exam & Assessment Timetable</h3>
              <span className="border border-zinc-900 bg-zinc-900 px-2 py-1 font-mono text-[10px] font-black text-white">{upcomingExams.length} UPCOMING</span>
            </div>
            {upcomingExams.length === 0 ? <div className="border border-dashed border-zinc-400 p-5 text-center text-xs font-bold uppercase text-zinc-500">No upcoming assessments scheduled.</div> :
            <div className="overflow-hidden border-2 border-zinc-900"><table className="w-full table-fixed text-left text-[10px] font-bold uppercase sm:text-xs"><thead className="border-b-2 border-zinc-900 bg-zinc-100 text-[9px] tracking-wider text-zinc-500 sm:text-[10px]"><tr><th className="w-[24%] p-2">Date</th><th className="w-[30%] p-2">Module</th><th className="p-2">Assessment</th><th className="w-[16%] p-2 text-right">Weight</th></tr></thead><tbody className="divide-y divide-zinc-200">{upcomingExams.map(exam=>{const module=modules.find(item=>item.id===exam.moduleId);return <tr key={exam.id}><td className="p-2 font-mono text-blue-700">{exam.date}</td><td className="p-2"><span className="block text-[9px] text-zinc-400">{module?.code}</span><span className="break-words">{module?.name??'Module'}</span></td><td className="break-words p-2 font-black">{exam.name}</td><td className="p-2 text-right font-mono">{exam.weightPercent}%</td></tr>})}</tbody></table></div>}
          </section>

          <section className="space-y-4 border-2 border-zinc-900 bg-white p-4 shadow-sm sm:p-6">
            <div className="border-b-2 border-zinc-100 pb-3"><h3 className="text-base font-black uppercase tracking-wide text-zinc-900">Assessment History & Published Results</h3></div>
            {completedExams.length === 0 ? <div className="border border-dashed border-zinc-400 p-5 text-center text-xs font-bold uppercase text-zinc-500">No completed assessments recorded.</div> :
            <div className="overflow-hidden border-2 border-zinc-900"><table className="w-full table-fixed text-left text-[10px] font-bold uppercase sm:text-xs"><thead className="border-b-2 border-zinc-900 bg-zinc-100 text-[9px] tracking-wider text-zinc-500 sm:text-[10px]"><tr><th className="w-[27%] p-2">Module</th><th className="w-[29%] p-2">Exam / Assessment</th><th className="w-[18%] p-2 text-center">Result</th><th className="w-[12%] p-2 text-center">Weight</th><th className="p-2 text-right">Status</th></tr></thead><tbody className="divide-y divide-zinc-200">{completedExams.map(exam=>{const module=modules.find(item=>item.id===exam.moduleId);const mark=studentMarks.find(item=>item.examId===exam.id);return <tr key={exam.id} className="align-top"><td className="break-words p-2"><span className="block text-[9px] text-zinc-400">{module?.code}</span>{module?.name??'Module'}</td><td className="break-words p-2"><span className="font-black">{exam.name}</span><span className="block font-mono text-[9px] text-zinc-400">{exam.date}</span></td><td className="p-2 text-center">{mark?<><span className="block text-sm font-black">{mark.marksObtained}/{exam.maxMarks}</span><span className="text-[9px]">Grade {mark.grade}</span></>:<span className="text-zinc-400">Pending</span>}</td><td className="p-2 text-center font-mono">{exam.weightPercent}%</td><td className="p-2 text-right"><span className={`inline-block border px-1.5 py-0.5 text-[8px] font-black ${!mark?'border-amber-800 bg-amber-50 text-amber-800':mark.status==='Passed'?'border-emerald-800 bg-emerald-50 text-emerald-800':'border-red-800 bg-red-50 text-red-800'}`}>{mark?mark.status:'Awaiting result'}</span></td></tr>})}</tbody></table></div>}
          </section>
        </div>
      )}

      {/* 4. FINANCIAL LEDGER */}
      {activeSubTab === 'fees' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Invoices and Payments Lists */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Invoices List */}
            <div className="bg-white border-2 border-zinc-900 p-6 neo-shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b-2 border-zinc-100 pb-2">
                <h3 className="text-base font-black text-zinc-900 uppercase tracking-wide">
                  Tuition & Lab Invoices Issued
                </h3>
                <button
                  onClick={() => {
                    if (studentInvoices.length > 0) {
                      setSelectedInvoiceId(studentInvoices[0].id);
                      setShowPayModal(true);
                    } else {
                      toast('No outstanding invoices', { tone: 'info', message: 'There is currently no payable invoice on this account.' });
                    }
                  }}
                  className="px-3 py-1.5 border-2 border-zinc-900 bg-yellow-400 hover:bg-yellow-500 font-black text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1"
                >
                  <Plus size={14} /> Simulate MPesa Payment
                </button>
              </div>

              <div className="space-y-3 uppercase text-xs font-bold">
                {studentInvoices.map(inv => (
                  <div key={inv.id} className="p-3 border border-zinc-900 bg-zinc-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <span className="text-[9px] font-mono text-zinc-400 block tracking-widest">{inv.invoiceNumber}</span>
                      <span className="font-black text-zinc-900 text-sm leading-tight block">{inv.title}</span>
                      <span className="text-[10px] text-zinc-500 font-bold block pt-0.5">Due Date: {inv.dueDate}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono font-black text-zinc-900">KES {inv.amount.toLocaleString()}</div>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 border border-zinc-900 inline-block mt-1 ${
                        inv.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {inv.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payments List */}
            <div className="bg-white border-2 border-zinc-900 p-6 neo-shadow-sm space-y-4">
              <h3 className="text-base font-black text-zinc-900 border-b-2 border-zinc-100 pb-2 uppercase tracking-wide">
                Transaction History Receipts
              </h3>

              {studentPayments.length === 0 ? (
                <p className="text-xs text-zinc-400 italic">No historical financial transactions found on this account ledger.</p>
              ) : (
                <div className="space-y-3 uppercase text-xs">
                  {studentPayments.map(pay => (
                    <div key={pay.id} className="p-3 border border-zinc-900 bg-white font-mono flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-zinc-900 text-white font-bold px-1.5 py-0.5">RECEIPT</span>
                          <span className="font-black text-zinc-900 text-xs">{pay.receiptNumber}</span>
                        </div>
                        <div className="text-[11px] text-zinc-500 font-sans font-bold">
                          Paid via {pay.paymentMethod} &bull; Reference: {pay.transactionReference}
                        </div>
                      </div>
                      <div className="text-right font-sans">
                        <span className="text-xs text-zinc-400 block font-mono">{pay.datePaid}</span>
                        <span className="text-sm font-mono font-black text-emerald-700">+KES {pay.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Ledger Summary */}
          <div className="bg-white border-2 border-zinc-900 p-6 neo-shadow-sm h-fit space-y-6 uppercase text-xs">
            <h3 className="text-base font-black text-zinc-900 border-b-2 border-zinc-900/10 pb-2 uppercase tracking-wide">
              Bursar Ledger Summary
            </h3>

            <div className="space-y-3 font-bold font-mono">
              <div className="flex justify-between text-zinc-500">
                <span>TOTAL INVOICED AID:</span>
                <span>KES {totalInvoiced.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>TOTAL REMITTED CASH:</span>
                <span>KES {totalPaid.toLocaleString()}</span>
              </div>
              <hr className="border-t-2 border-zinc-900" />
              <div className="flex justify-between text-sm font-black text-zinc-900">
                <span>OUTSTANDING BALANCE:</span>
                <span className={outstandingBalance > 0 ? 'text-red-600' : 'text-emerald-700'}>
                  KES {outstandingBalance.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-3 bg-zinc-50 border border-zinc-900 rounded-none leading-normal normal-case text-zinc-500 font-medium">
              <span className="font-black text-zinc-900 uppercase text-[10px] tracking-wider block mb-1">Financial policy</span>
              Accounts with outstanding balances above KES 10,000 generate system flags that auto-apply a <b>finance_hold</b> on exam permit allocations and end-of-term transcript releases.
            </div>
          </div>

        </div>
      )}

      {/* 4. SUPPORT REQUESTS */}
      {activeSubTab === 'requests' && (
        <div className="space-y-6">
          
          <div className="bg-white border-2 border-zinc-900 p-6 neo-shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b-2 border-zinc-100 pb-2">
              <h3 className="text-base font-black text-zinc-900 uppercase tracking-wide">
                Official Support & Leave Petitions
              </h3>
              <button
                onClick={() => setShowRequestForm(!showRequestForm)}
                className="px-3 py-1.5 border-2 border-zinc-900 bg-zinc-900 hover:bg-yellow-400 hover:text-zinc-900 text-white font-black text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1"
              >
                <Plus size={14} /> Submit New Leave or Fee Petition
              </button>
            </div>

            {/* Request creation form drawer */}
            {showRequestForm && (
              <form onSubmit={handleRequestSubmit} className="portal-slide-over-form bg-zinc-50 p-4 border-2 border-zinc-900 rounded-none space-y-4 uppercase text-xs font-bold text-zinc-900">
                <span className="text-[10px] font-black text-zinc-400 block tracking-widest">
                  NEW WORKBENCH PETITION SUBMISSION
                </span>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-zinc-500 tracking-widest">Category *</label>
                    <select
                      value={reqCategory}
                      onChange={(e) => setReqCategory(e.target.value as any)}
                      className="w-full p-1.5 border-2 border-zinc-900 bg-white cursor-pointer focus:outline-none"
                    >
                      <option value="Fee Plan">Fee Plan request</option>
                      <option value="Leave of Absence">Leave of Absence</option>
                      <option value="Deferment">Course Deferment</option>
                      <option value="Document Request">Academic Documents Request</option>
                      <option value="Result Query">Result / Marks Query</option>
                      <option value="Attachment Issue">Attachment Issue</option>
                    </select>
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[9px] font-black text-zinc-500 tracking-widest">Petition Subject *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Request for Medical Leave or Attachment Site Modification"
                      value={reqSubject}
                      onChange={(e) => setReqSubject(e.target.value)}
                      className="w-full px-3 py-1.5 border-2 border-zinc-900 bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-zinc-500 tracking-widest">Detailed Explanation / Justification *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Provide a detailed, clear narrative for your academic supervisor or financial auditor."
                    value={reqDesc}
                    onChange={(e) => setReqDesc(e.target.value)}
                    className="w-full p-2 border-2 border-zinc-900 bg-white focus:outline-none uppercase font-bold"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-zinc-500 tracking-widest">Priority level</label>
                    <div className="flex gap-2">
                      {['low', 'medium', 'high'].map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setReqPriority(p as any)}
                          className={`px-3 py-1 border text-[10px] font-black uppercase transition-all ${
                            reqPriority === p 
                              ? 'bg-zinc-900 text-white border-zinc-900' 
                              : 'bg-white hover:bg-zinc-100 text-zinc-500 border-zinc-300'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowRequestForm(false)}
                      className="px-4 py-1.5 border-2 border-zinc-900 bg-white text-zinc-900 font-bold hover:bg-zinc-100 text-xs transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 border-2 border-zinc-900 bg-zinc-900 text-white font-black hover:bg-yellow-400 hover:text-zinc-900 text-xs transition cursor-pointer"
                    >
                      Submit Petition
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* List submitted requests */}
            <div className="space-y-4 font-bold uppercase text-xs">
              {studentRequests.length === 0 ? (
                <p className="text-xs text-zinc-400 text-center py-6">No historical support petitions or clearance deferrals logged.</p>
              ) : (
                studentRequests.map(req => (
                  <div key={req.id} className="border-2 border-zinc-900 rounded-none bg-zinc-50/50 p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b-2 border-zinc-200 pb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] bg-zinc-900 text-white font-black px-2 py-0.5">
                          {req.category.toUpperCase()}
                        </span>
                        <span className={`text-[10px] font-bold border px-2 py-0.5 ${
                          req.priority === 'high' ? 'bg-red-50 text-red-700 border-red-900' : 'bg-zinc-100 text-zinc-700 border-zinc-400'
                        }`}>
                          PRIORITY: {req.priority.toUpperCase()}
                        </span>
                      </div>
                      <span className={`text-xs font-black px-2 py-0.5 border-2 border-zinc-900 ${
                        req.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        req.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {req.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-zinc-900 leading-tight uppercase">{req.subject}</h4>
                      <p className="text-[10px] text-zinc-500 font-mono normal-case font-bold">{req.createdAt} &bull; Petition ID: {req.id}</p>
                      <p className="text-[11px] text-zinc-600 font-medium normal-case leading-normal font-sans pt-1">
                        {req.description}
                      </p>
                    </div>

                    {req.adminComments && (
                      <div className="p-3 bg-white border border-zinc-900 border-dashed space-y-1">
                        <span className="text-[10px] text-zinc-400 font-black tracking-widest block">ADMINISTRATIVE ACTION / FEEDBACK</span>
                        <p className="text-[11px] text-zinc-700 leading-normal font-medium normal-case font-sans italic">
                          "{req.adminComments}"
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

          </div>

        </div>
      )}

      {/* 5. CLEARANCE & GRADUATION */}
      {activeSubTab === 'clearance' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Clearance checklist */}
          <div className="lg:col-span-2 bg-white border-2 border-zinc-900 p-6 neo-shadow-sm space-y-4">
            <h3 className="text-base font-black text-zinc-900 border-b-2 border-zinc-100 pb-2 uppercase tracking-wide">
              Official Graduation Clearance Signoffs
            </h3>

            {studentClearance ? (
              <div className="space-y-4 uppercase text-xs font-bold">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'Finance Bursar Audit', val: studentClearance.checkpoints.financeApproved, key: 'finance', note: 'Checks outstanding fees, laboratory inventory damages, or penalties.' },
                    { label: 'Academic Office Check', val: studentClearance.checkpoints.academicOfficeApproved, key: 'academicOffice', note: 'Verifies minimum required clinical module credits.' },
                    { label: 'Campus Library Clearance', val: studentClearance.checkpoints.libraryApproved, key: 'library', note: 'Confirms complete return of catalog books and references.' },
                    { label: 'Skills Lab Equipment Clearance', val: studentClearance.checkpoints.skillsLabApproved, key: 'skillsLab', note: 'Verifies training lab kits and simulation instruments return.' },
                    { label: 'Attachment Office Clearance', val: studentClearance.checkpoints.attachmentOfficeApproved, key: 'attachmentOffice', note: 'Audits daily clinical logbooks and supervisor score sheets.' },
                    { label: 'Registrar General Signoff', val: studentClearance.checkpoints.registrarApproved, key: 'registrar', note: 'Final audit of National ID, KCSE index, and certificates.' }
                  ].map(cp => (
                    <div key={cp.key} className="p-3 bg-zinc-50 border-2 border-zinc-900 rounded-none space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-black text-zinc-900">{cp.label}</span>
                        {cp.val ? (
                          <span className="text-emerald-700 font-black flex items-center gap-1"><ShieldCheck size={16} /> CLEARED</span>
                        ) : (
                          <span className="text-amber-600 font-black flex items-center gap-1"><ShieldAlert size={16} /> PENDING</span>
                        )}
                      </div>
                      <p className="text-[9px] text-zinc-400 font-bold lowercase normal-case leading-tight leading-normal">
                        {cp.note}
                      </p>
                      
                      {/* Department Comments */}
                      {studentClearance.comments[cp.key as keyof typeof studentClearance.comments] && (
                        <div className="text-[9px] bg-white p-1 border border-zinc-200 text-zinc-500 font-mono">
                          COMMENT: {studentClearance.comments[cp.key as keyof typeof studentClearance.comments]}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t-2 border-zinc-100 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-zinc-400 font-black tracking-widest block">CLEARANCE STATUS</span>
                    <span className="text-lg font-black text-zinc-900 uppercase">
                      {studentClearance.status.replace('_', ' ')}
                    </span>
                  </div>
                  {studentClearance.status === 'cleared' && (
                    <div className="bg-emerald-50 text-emerald-900 border-2 border-emerald-950 px-4 py-2 text-center text-xs font-black">
                      PASSED ALL REGISTRAR CHECKS
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <p className="text-xs text-zinc-400 italic">No graduation clearance record initialized.</p>
            )}
          </div>

          {/* Graduation candidacy status */}
          <div className="bg-white border-2 border-zinc-900 p-6 neo-shadow-sm h-fit space-y-4 uppercase text-xs">
            <h3 className="text-base font-black text-zinc-900 border-b-2 border-zinc-900/10 pb-2 uppercase tracking-wide">
              Ceremony & Certificate Status
            </h3>

            {studentGraduation ? (
              <div className="space-y-4">
                <div className="p-3 bg-yellow-100 text-zinc-900 border-2 border-zinc-900 rounded-none text-center space-y-1">
                  <Award className="mx-auto text-zinc-900" size={32} />
                  <span className="text-[10px] font-black tracking-widest block">GRADUATING CONVOCATION CANDIDATE</span>
                  <span className="font-black text-sm block">ELIGIBLE</span>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] text-zinc-400 font-black block tracking-widest">CONVOCATION BATCH</span>
                    <span className="font-bold text-zinc-900 text-xs block pt-0.5">
                      {graduationBatches.find(b => b.id === studentGraduation.batchId)?.name || 'November 2026 Batch'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 font-black block tracking-widest">CEREMONY DATE</span>
                    <span className="font-bold text-zinc-900 text-xs block pt-0.5">
                      {graduationBatches.find(b => b.id === studentGraduation.batchId)?.ceremonyDate || '2026-11-20'}
                    </span>
                  </div>
                  <hr className="border-t-2 border-zinc-100" />
                  <div className="flex justify-between items-center text-[11px] font-bold">
                    <span>TRANSCRIPT PUBLISHED:</span>
                    {studentGraduation.transcriptIssued ? (
                      <span className="text-emerald-700 font-black">YES (PRINTABLE)</span>
                    ) : (
                      <span className="text-zinc-400 italic">PENDING GENERATION</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-bold">
                    <span>DEGREE/CERTIFICATE ISSUED:</span>
                    {studentGraduation.certificateIssued ? (
                      <span className="text-emerald-700 font-black">YES ({studentGraduation.certificateNumber})</span>
                    ) : (
                      <span className="text-zinc-400 italic">PENDING AUDIT</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center border-2 border-zinc-900 border-dashed bg-zinc-50">
                <p className="text-xs text-zinc-400 font-black uppercase">Not listed in active graduation batch candidates.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* PAY MODAL */}
      {showPayModal && (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border-4 border-zinc-900 rounded-none neo-shadow w-full max-w-md uppercase font-bold text-xs text-zinc-900">
            <div className="bg-zinc-900 text-white px-4 py-3 flex justify-between items-center">
              <span className="font-black text-sm">SIMULATE REMITTED PAYMENTS</span>
              <button onClick={() => setShowPayModal(false)} className="text-white hover:text-yellow-400 cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handlePayFeeSubmit} className="portal-inline-form max-h-[80dvh] space-y-4 overflow-y-auto p-4">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 tracking-widest block">SELECT FEE INVOICE *</label>
                <select
                  required
                  value={selectedInvoiceId}
                  onChange={(e) => setSelectedInvoiceId(e.target.value)}
                  className="w-full p-2 border-2 border-zinc-900 bg-white cursor-pointer focus:outline-none"
                >
                  <option value="">-- Choose Invoice --</option>
                  {studentInvoices.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.title} (KES {i.amount.toLocaleString()}) - {i.status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 tracking-widest block">PAYMENT METHOD *</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as any)}
                    className="w-full p-2 border-2 border-zinc-900 bg-white cursor-pointer focus:outline-none"
                  >
                    <option value="MPesa">MPesa Mobile Cash</option>
                    <option value="Bank Transfer">Cooperative Bank Transfer</option>
                    <option value="Cash">Cash Ledger</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 tracking-widest block">AMOUNT TO PAY (KES) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 20000"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full px-2 py-1.5 border-2 border-zinc-900 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 tracking-widest block">TRANSACTION REF (OPTIONAL)</label>
                <input
                  type="text"
                  placeholder="e.g. QH39ZL9283K or MPesa Code"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="w-full px-3 py-1.5 border-2 border-zinc-900 focus:outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-3 py-1.5 border-2 border-zinc-900 bg-white text-zinc-900 font-bold hover:bg-zinc-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 border-2 border-zinc-900 bg-zinc-900 text-white font-black hover:bg-yellow-400 hover:text-zinc-900 transition cursor-pointer"
                >
                  Submit Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </motion.div>
  );
}
