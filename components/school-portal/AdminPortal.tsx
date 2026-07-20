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
  Exam,
  Application,
  User,
  ActivityLog
} from './types';
import { 
  Users, 
  FileText, 
  BookOpen, 
  Layers, 
  Calendar, 
  Plus, 
  AlertTriangle, 
  CheckCircle, 
  UserCheck, 
  FileCheck, 
  GraduationCap, 
  CreditCard, 
  ClipboardCheck, 
  Clock, 
  FolderPlus, 
  Trash2, 
  X, 
  Sparkles,
  Award,
  Info,
  Menu,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNotifications } from './notifications';

interface AdminPortalProps {
  // Database tables
  applications: Application[];
  students: Student[];
  onboarding: ClearanceStatus[]; // Using clearance / onboarding statuses
  programs: Program[];
  modules: Module[];
  cohorts: Cohort[];
  classes: Class[];
  resources: LearningResource[];
  timetable: TimetableEvent[];
  exams: Exam[];
  marks: StudentMark[];
  invoices: Invoice[];
  payments: Payment[];
  requests: StudentRequest[];
  attachments: AttachmentPlacement[];
  clearances: ClearanceStatus[];
  graduationBatches: GraduationBatch[];
  graduationCandidates: GraduationCandidate[];
  users: User[];
  logs: ActivityLog[];

  // Update actions
  onUpdateApplications: (apps: Application[]) => void;
  onUpdateStudents: (stds: Student[]) => void;
  onUpdateInvoices: (invs: Invoice[]) => void;
  onUpdatePayments: (pays: Payment[]) => void;
  onUpdateRequests: (reqs: StudentRequest[]) => void;
  onUpdateAttachments: (atts: AttachmentPlacement[]) => void;
  onUpdateClearances: (clrs: ClearanceStatus[]) => void;
  onUpdateGraduationCandidates: (gcs: GraduationCandidate[]) => void;
  onUpdateGraduationBatches: (gbs: GraduationBatch[]) => void;
  onUpdateExams: (exs: Exam[]) => void;
  onUpdateMarks: (mks: StudentMark[]) => void;
  onUpdateTimetable: (tts: TimetableEvent[]) => void;
  onUpdateResources: (res: LearningResource[]) => void;
  onUpdateClasses: (cls: Class[]) => void;
  onUpdateCohorts: (cohs: Cohort[]) => void;
  onUpdateModules: (mods: Module[]) => void;
  onUpdatePrograms: (progs: Program[]) => void;
  onUpdateUsers: (usr: User[]) => void;

  onOpenRegisterModal: (app: Application | null) => void;
}

export default function AdminPortal({
  applications,
  students,
  onboarding,
  programs,
  modules,
  cohorts,
  classes,
  resources,
  timetable,
  exams,
  marks,
  invoices,
  payments,
  requests,
  attachments,
  clearances,
  graduationBatches,
  graduationCandidates,
  users,
  logs,

  onUpdateApplications,
  onUpdateStudents,
  onUpdateInvoices,
  onUpdatePayments,
  onUpdateRequests,
  onUpdateAttachments,
  onUpdateClearances,
  onUpdateGraduationCandidates,
  onUpdateGraduationBatches,
  onUpdateExams,
  onUpdateMarks,
  onUpdateTimetable,
  onUpdateResources,
  onUpdateClasses,
  onUpdateCohorts,
  onUpdateModules,
  onUpdatePrograms,
  onUpdateUsers,

  onOpenRegisterModal
}: AdminPortalProps) {
  const { toast, confirm, prompt: promptDialog } = useNotifications();
  const [adminTab, setAdminTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tablePage, setTablePage] = useState(1);
  const tablePageSize = 10;
  const [selectedTableRows, setSelectedTableRows] = useState<string[]>([]);
  
  // Selection/Detail states
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  
  // Creation Form states
  const [showProgramForm, setShowProgramForm] = useState(false);
  const [newProgName, setNewProgName] = useState('');
  const [newProgCode, setNewProgCode] = useState('');
  const [newProgFee, setNewProgFee] = useState('');
  const [newProgDur, setNewProgDur] = useState('');
  const [newProgGrade, setNewProgGrade] = useState('D');
  const [newProgReq, setNewProgReq] = useState('');
  
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [newModName, setNewModName] = useState('');
  const [newModCode, setNewModCode] = useState('');
  const [newModCredits, setNewModCredits] = useState('');
  const [newModProgId, setNewModProgId] = useState('');

  const [showCohortForm, setShowCohortForm] = useState(false);
  const [newCohName, setNewCohName] = useState('');
  const [newCohProgId, setNewCohProgId] = useState('');
  const [newCohTerm, setNewCohTerm] = useState('Fall 2026');

  const [showClassForm, setShowClassForm] = useState(false);
  const [newClsName, setNewClsName] = useState('');
  const [newClsCohId, setNewClsCohId] = useState('');
  const [newClsLecturer, setNewClsLecturer] = useState('');
  const [newClsRoom, setNewClsRoom] = useState('');

  const [showResourceForm, setShowResourceForm] = useState(false);
  const [newResTitle, setNewResTitle] = useState('');
  const [newResType, setNewResType] = useState<'pdf' | 'link' | 'video' | 'assignment' | 'policy'>('pdf');
  const [newResUrl, setNewResUrl] = useState('');
  const [newResTargetType, setNewResTargetType] = useState<'all' | 'program' | 'cohort' | 'class'>('all');
  const [newResTargetId, setNewResTargetId] = useState('');

  const [showExamForm, setShowExamForm] = useState(false);
  const [newExamClassId, setNewExamClassId] = useState('');
  const [newExamModId, setNewExamModId] = useState('');
  const [newExamName, setNewExamName] = useState('');
  const [newExamDate, setNewExamDate] = useState('');
  const [newExamWeight, setNewExamWeight] = useState('40');

  const [showMarkForm, setShowMarkForm] = useState(false);
  const [newMarkStdId, setNewMarkStdId] = useState('');
  const [newMarkExamId, setNewMarkExamId] = useState('');
  const [newMarkScore, setNewMarkScore] = useState('');

  const [showAttachmentForm, setShowAttachmentForm] = useState(false);
  const [newAttStdId, setNewAttStdId] = useState('');
  const [newAttSite, setNewAttSite] = useState('');
  const [newAttSupervisor, setNewAttSupervisor] = useState('');
  const [newAttDept, setNewAttDept] = useState('');

  const [showGradBatchForm, setShowGradBatchForm] = useState(false);
  const [newGbName, setNewGbName] = useState('');
  const [newGbDate, setNewGbDate] = useState('');

  const [showGradCandidateForm, setShowGradCandidateForm] = useState(false);
  const [newGcStdId, setNewGcStdId] = useState('');
  const [newGcBatchId, setNewGcBatchId] = useState('');

  const [showTimetableForm, setShowTimetableForm] = useState(false);
  const [newTtClassId, setNewTtClassId] = useState('');
  const [newTtModId, setNewTtModId] = useState('');
  const [newTtDay, setNewTtDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'>('Monday');
  const [newTtStartTime, setNewTtStartTime] = useState('');
  const [newTtEndTime, setNewTtEndTime] = useState('');
  const [newTtRoom, setNewTtRoom] = useState('');

  // KCSE score grade value order for application qualification logic
  const gradeValue: { [key: string]: number } = {
    'A': 12, 'A-': 11, 'B+': 10, 'B': 9, 'B-': 8, 'C+': 7, 'C': 6, 'C-': 5, 'D+': 4, 'D': 3, 'D-': 2, 'E': 1
  };

  const getGradeQualified = (kcseGrade: string, requiredMinGrade: string) => {
    const scoreVal = gradeValue[kcseGrade.toUpperCase()] || 0;
    const reqVal = gradeValue[requiredMinGrade.toUpperCase()] || 0;
    return scoreVal >= reqVal;
  };

  // 1. Creation Form Submit Handlers
  const handleCreateProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgName || !newProgCode || !newProgFee || !newProgDur) return;
    const newProg: Program = {
      id: 'prog_' + newProgCode.toLowerCase(),
      code: newProgCode.toUpperCase(),
      name: newProgName,
      durationMonths: Number(newProgDur),
      tuitionFee: Number(newProgFee),
      minKcseGrade: newProgGrade,
      entryRequirement: `KCSE Mean Grade ${newProgGrade} or above`,
      description: `Academic curriculum for training professional health practitioners in ${newProgName}.`
    };
    onUpdatePrograms([...programs, newProg]);
    setNewProgName('');
    setNewProgCode('');
    setNewProgFee('');
    setNewProgDur('');
    setShowProgramForm(false);
  };

  const handleCreateModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModName || !newModCode || !newModCredits || !newModProgId) return;
    const newMod: Module = {
      id: 'mod_' + newModCode.toLowerCase().replace('-', '_'),
      code: newModCode.toUpperCase(),
      name: newModName,
      programId: newModProgId,
      credits: Number(newModCredits)
    };
    onUpdateModules([...modules, newMod]);
    setNewModName('');
    setNewModCode('');
    setNewModCredits('');
    setShowModuleForm(false);
  };

  const handleCreateCohort = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCohName || !newCohProgId) return;
    const newCoh: Cohort = {
      id: 'coh_' + newCohName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      name: newCohName.toUpperCase(),
      programId: newCohProgId,
      intakeTerm: newCohTerm,
      startDate: new Date().toISOString().split('T')[0]
    };
    onUpdateCohorts([...cohorts, newCoh]);
    setNewCohName('');
    setShowCohortForm(false);
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClsName || !newClsCohId || !newClsLecturer) return;
    const newCls: Class = {
      id: 'cls_' + newClsName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      name: newClsName,
      cohortId: newClsCohId,
      lecturerName: newClsLecturer,
      room: newClsRoom || 'Lumina Hall Room 1',
      status: 'active'
    };
    onUpdateClasses([...classes, newCls]);
    setNewClsName('');
    setNewClsLecturer('');
    setNewClsRoom('');
    setShowClassForm(false);
  };

  const handleCreateResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResTitle || !newResUrl) return;
    const newRes: LearningResource = {
      id: 'res_' + Date.now(),
      title: newResTitle,
      type: newResType,
      url: newResUrl,
      targetType: newResTargetType,
      targetId: newResTargetType === 'all' ? 'all' : newResTargetId,
      uploadedBy: 'Academic Registrar Office',
      created_at: new Date().toISOString().split('T')[0]
    };
    onUpdateResources([newRes, ...resources]);
    setNewResTitle('');
    setNewResUrl('');
    setShowResourceForm(false);
  };

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamClassId || !newExamModId || !newExamName || !newExamDate) return;
    const newExam: Exam = {
      id: 'ex_' + Date.now().toString().slice(-6),
      classId: newExamClassId,
      moduleId: newExamModId,
      name: newExamName,
      date: newExamDate,
      maxMarks: 100,
      weightPercent: Number(newExamWeight)
    };
    onUpdateExams([...exams, newExam]);
    setNewExamName('');
    setNewExamDate('');
    setShowExamForm(false);
  };

  const handleCreateMark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMarkStdId || !newMarkExamId || !newMarkScore) return;
    
    // Find exam details to get module
    const ex = exams.find(x => x.id === newMarkExamId);
    if (!ex) return;

    const score = Number(newMarkScore);
    let grade = 'F';
    let status: 'Passed' | 'Failed' = 'Failed';
    if (score >= 80) { grade = 'A'; status = 'Passed'; }
    else if (score >= 70) { grade = 'B'; status = 'Passed'; }
    else if (score >= 60) { grade = 'C'; status = 'Passed'; }
    else if (score >= 50) { grade = 'D'; status = 'Passed'; }

    const newMark: StudentMark = {
      id: 'mk_' + Date.now(),
      studentId: newMarkStdId,
      examId: newMarkExamId,
      moduleId: ex.moduleId,
      marksObtained: score,
      grade,
      status,
      isModerated: true,
      recordedBy: 'Registrar Staff',
      dateRecorded: new Date().toISOString().split('T')[0]
    };
    onUpdateMarks([newMark, ...marks]);
    setNewMarkScore('');
    setShowMarkForm(false);
  };

  const handleCreateAttachment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAttStdId || !newAttSite || !newAttSupervisor || !newAttDept) return;
    const newAtt: AttachmentPlacement = {
      id: 'att_' + Date.now(),
      studentId: newAttStdId,
      siteName: newAttSite,
      supervisorName: newAttSupervisor,
      department: newAttDept,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 1000*60*60*24*90).toISOString().split('T')[0], // 3 months
      completionStatus: 'active',
      logbooksSubmitted: 0
    };
    onUpdateAttachments([newAtt, ...attachments]);
    setNewAttSite('');
    setNewAttSupervisor('');
    setNewAttDept('');
    setShowAttachmentForm(false);
  };

  const handleCreateGradBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGbName || !newGbDate) return;
    const newGb: GraduationBatch = {
      id: 'gb_' + Date.now().toString().slice(-4),
      name: newGbName,
      ceremonyDate: newGbDate,
      status: 'upcoming'
    };
    onUpdateGraduationBatches([...graduationBatches, newGb]);
    setNewGbName('');
    setNewGbDate('');
    setShowGradBatchForm(false);
  };

  const handleCreateGradCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGcStdId || !newGcBatchId) return;
    const newGc: GraduationCandidate = {
      id: 'gc_' + Date.now(),
      studentId: newGcStdId,
      batchId: newGcBatchId,
      eligibilityStatus: 'eligible',
      certificateIssued: false,
      transcriptIssued: true
    };
    onUpdateGraduationCandidates([newGc, ...graduationCandidates]);
    setShowGradCandidateForm(false);
  };

  const handleCreateTimetable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTtClassId || !newTtModId || !newTtStartTime || !newTtEndTime) return;
    
    // Check conflicts (room or lecturer)
    const cls = classes.find(c => c.id === newTtClassId);
    const hasConflict = timetable.some(t => {
      const otherCls = classes.find(c => c.id === t.classId);
      return (
        t.dayOfWeek === newTtDay &&
        t.startTime === newTtStartTime &&
        (t.room === newTtRoom || otherCls?.lecturerName === cls?.lecturerName)
      );
    });

    if (hasConflict) {
      toast('Scheduling conflict', { tone: 'error', message: 'The room or trainer is already assigned during this time slot.' });
      return;
    }

    const newTt: TimetableEvent = {
      id: 'tt_' + Date.now(),
      classId: newTtClassId,
      moduleId: newTtModId,
      dayOfWeek: newTtDay,
      startTime: newTtStartTime,
      endTime: newTtEndTime,
      room: newTtRoom || 'Skills Lab 102'
    };
    onUpdateTimetable([...timetable, newTt]);
    setNewTtStartTime('');
    setNewTtEndTime('');
    setNewTtRoom('');
    setShowTimetableForm(false);
  };

  // State calculations for metrics
  const totalOutstandingBalance = invoices.reduce((sum, i) => sum + i.amount, 0) - payments.reduce((sum, p) => sum + p.amount, 0);
  const paged = <T,>(rows: T[]) => rows.slice((tablePage - 1) * tablePageSize, tablePage * tablePageSize);
  const tableRowCount: Record<string, number> = {
    applications: applications.length,
    students: students.length,
    modules: modules.length,
    timetable: timetable.length,
    results: marks.length,
    graduation: graduationCandidates.length,
    users: users.length,
  };
  const activeTableIds: Record<string, string[]> = {
    applications: paged(applications).map(row => row.id),
    students: paged(students).map(row => row.id),
    modules: paged(modules).map(row => row.id),
    timetable: paged(timetable).map(row => row.id),
    results: paged(marks).map(row => row.id),
    graduation: paged(graduationCandidates).map(row => row.id),
    users: paged(users).map(row => row.id),
  };
  const toggleTableRow = (id: string) => setSelectedTableRows(rows => rows.includes(id) ? rows.filter(rowId => rowId !== id) : [...rows, id]);
  const deleteSelectedTableRows = async () => {
    if (!selectedTableRows.length || !await confirm({ title: 'Delete selected records?', message: `${selectedTableRows.length} selected record(s) will be permanently removed.`, confirmLabel: 'Delete selected', tone: 'danger' })) return;
    const keep = <T extends { id: string }>(rows: T[]) => rows.filter(row => !selectedTableRows.includes(row.id));
    if (adminTab === 'applications') onUpdateApplications(keep(applications));
    if (adminTab === 'students') onUpdateStudents(keep(students));
    if (adminTab === 'modules') onUpdateModules(keep(modules));
    if (adminTab === 'timetable') onUpdateTimetable(keep(timetable));
    if (adminTab === 'results') onUpdateMarks(keep(marks));
    if (adminTab === 'graduation') onUpdateGraduationCandidates(keep(graduationCandidates));
    if (adminTab === 'users') onUpdateUsers(keep(users));
    setSelectedTableRows([]);
    toast('Records deleted', { tone: 'success' });
  };

  return (
    <div className="relative flex flex-col gap-4 lg:flex-row lg:gap-4">
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="flex w-full items-center justify-between border-2 border-zinc-900 bg-zinc-900 px-4 py-3 text-xs font-black uppercase tracking-wider text-white lg:hidden"
      >
        <span className="flex items-center gap-2"><Menu size={17} /> Database Workbench</span>
        <span className="bg-yellow-400 px-2 py-0.5 text-[10px] text-zinc-900">Menu</span>
      </button>

      {sidebarOpen && <button type="button" aria-label="Close admin navigation" className="fixed inset-0 z-40 bg-zinc-950/60 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      
      {/* Mini Sidebar of 16 Workbench items */}
      <aside className={`fixed inset-y-0 left-0 z-50 h-dvh overflow-y-auto border-2 border-zinc-900 bg-zinc-900 p-4 text-zinc-300 shadow-2xl transition-[width,transform] duration-300 lg:sticky lg:top-4 lg:z-auto lg:h-[calc(100dvh-2rem)] lg:shrink-0 lg:translate-x-0 lg:shadow-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${sidebarCollapsed ? 'w-20' : 'w-72 lg:w-56'}`}>
        <div className="flex items-center justify-between gap-2 border-b-2 border-zinc-800 pb-2">
          {!sidebarCollapsed && <span className="block text-[10px] font-black uppercase tracking-widest text-yellow-400">DATABASE WORKBENCH</span>}
          <button type="button" onClick={() => setSidebarOpen(false)} className="ml-auto p-1 text-zinc-400 hover:text-yellow-400 lg:hidden" aria-label="Close navigation"><X size={18} /></button>
          <button type="button" onClick={() => setSidebarCollapsed((value) => !value)} className="ml-auto hidden p-1 text-zinc-400 hover:text-yellow-400 lg:block" aria-label={sidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'}>
            {sidebarCollapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
          </button>
        </div>
        
        <ul className="space-y-1 text-xs uppercase font-bold tracking-wider">
          {[
            { key: 'dashboard', label: 'Dashboard Logs', icon: Sparkles },
            { key: 'applications', label: '01. Applications', badge: applications.filter(a => a.status === 'new').length, icon: FileText },
            { key: 'students', label: '02. Students List', badge: students.length, icon: Users },
            { key: 'onboarding', label: '03. Onboarding', icon: ClipboardCheck },
            { key: 'programs', label: '04. Programs', icon: Layers },
            { key: 'modules', label: '05. Modules Units', icon: BookOpen },
            { key: 'cohorts', label: '06. Cohorts', icon: Layers },
            { key: 'classes', label: '07. Classes', icon: Users },
            { key: 'resources', label: '08. Resources', icon: FolderPlus },
            { key: 'timetable', label: '09. Timetable', icon: Calendar },
            { key: 'exams', label: '10. Exam Setup', icon: Calendar },
            { key: 'results', label: '11. Results Marks', icon: FileCheck },
            { key: 'fees', label: '12. Fees Ledger', icon: CreditCard },
            { key: 'requests', label: '13. Requests Pet.', badge: requests.filter(r => r.status === 'submitted' || r.status === 'assigned').length, icon: Clock },
            { key: 'clearance', label: '14. Clearance', icon: UserCheck },
            { key: 'graduation', label: '15. Graduation', icon: Award },
            { key: 'users', label: '16. System Users', icon: Users }
          ].map(item => {
            const Icon = item.icon;
            return (
              <li key={item.key}>
                <motion.button
                  whileHover={{ x: sidebarCollapsed ? 0 : 3 }}
                  whileTap={{ scale: .97 }}
                  onClick={() => {
                    setAdminTab(item.key);
                    setTablePage(1);
                    setSelectedTableRows([]);
                    setSelectedStudentId(null);
                    setSidebarOpen(false);
                  }}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`w-full flex items-center justify-between py-1.5 px-2 transition border-l-2 text-left cursor-pointer ${
                    adminTab === item.key
                      ? 'bg-yellow-400 text-zinc-900 font-black border-zinc-900 pl-3'
                      : 'hover:bg-zinc-800 text-zinc-400 border-transparent hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon size={12} />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </span>
                  {!sidebarCollapsed && item.badge !== undefined && item.badge > 0 && (
                    <span className="text-[9px] font-mono bg-rose-600 text-white font-black px-1.5 py-0.2 select-none border border-zinc-900 rounded-none">
                      {item.badge}
                    </span>
                  )}
                </motion.button>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Main workspace container */}
      <motion.div key={adminTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .22 }} className="min-h-[70vh] min-w-0 flex-1 overflow-hidden rounded-sm border border-zinc-300 bg-white p-3 shadow-[0_4px_16px_rgba(24,24,27,0.08)] sm:p-5">
        {/* Each module below uses the original SchoolPortal workspace and table design. */}
        {activeTableIds[adminTab]?.length > 0 && !selectedStudentId && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border border-zinc-900 bg-zinc-50 p-2 text-[10px] font-black uppercase tracking-wider">
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={activeTableIds[adminTab].every(id => selectedTableRows.includes(id))} onChange={(event) => setSelectedTableRows(event.target.checked ? activeTableIds[adminTab] : [])} />
              Select current page ({activeTableIds[adminTab].length})
            </label>
            <button type="button" disabled={!selectedTableRows.length} onClick={deleteSelectedTableRows} className="border border-rose-800 bg-rose-600 px-3 py-1 text-white disabled:opacity-40">Delete selected ({selectedTableRows.length})</button>
          </div>
        )}
        
        {/* ==================== 0. DASHBOARD ==================== */}
        {adminTab === 'dashboard' && (
          <div className="space-y-6 uppercase text-xs">
            
            {/* Original bento statistics grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center justify-between border-2 border-zinc-900 bg-zinc-50 p-4"><div><span className="text-[10px] font-black text-zinc-400">TOTAL ENROLLED</span><div className="mt-1 text-2xl font-black text-zinc-900">{students.length}</div></div><Users className="text-zinc-400" size={28} /></div>
              <div className="flex items-center justify-between border-2 border-zinc-900 bg-zinc-50 p-4"><div><span className="text-[10px] font-black text-zinc-400">ACTIVE PIPELINE APPLICATIONS</span><div className="mt-1 text-2xl font-black text-blue-600">{applications.length}</div></div><FileText className="text-zinc-400" size={28} /></div>
              <div className="flex items-center justify-between border-2 border-zinc-900 bg-zinc-50 p-4"><div><span className="text-[10px] font-black text-zinc-400">OUTSTANDING DEBTORS</span><div className="mt-1 text-2xl font-black text-rose-600">KES {totalOutstandingBalance.toLocaleString()}</div></div><CreditCard className="text-zinc-400" size={28} /></div>
              <div className="flex items-center justify-between border-2 border-zinc-900 bg-zinc-50 p-4"><div><span className="text-[10px] font-black text-zinc-400">CLINICAL ROTATIONS</span><div className="mt-1 text-2xl font-black text-emerald-700">{attachments.filter(a => a.completionStatus === 'active').length} Active Placements</div></div><Award className="text-zinc-400" size={28} /></div>
            </div>

            {/* Quick procedural flow guidelines */}
            <div className="space-y-1 border-2 border-zinc-900 bg-amber-50 p-4 font-medium leading-normal normal-case">
              <h4 className="font-black text-zinc-900 uppercase text-xs tracking-wider">RHTI Administrative Onboarding Directive</h4>
              <p className="text-[11px] text-zinc-700">
                To prevent student records from getting desynchronized, strictly follow the admin sequence:
                Seed <b>Programs</b>, Map <b>Modules</b>, Create <b>Cohorts</b>, Assign <b>Classes and Trainers</b>, review <b>Applications</b>, and then trigger acceptance register profile. The system handles role creation and ledger invoicing automatically.
              </p>
            </div>

            {/* Activity and Audit Trails */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-zinc-900 border-b-2 border-zinc-100 pb-1.5 uppercase tracking-wide">
                Database System Audit Logs
              </h3>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {logs.map(log => (
                  <div key={log.id} className="flex items-start justify-between border border-zinc-900 bg-zinc-50 p-3 font-mono text-[10px]">
                    <div className="space-y-0.5 max-w-[80%]">
                      <span className="bg-zinc-900 text-white font-bold px-1 py-0.2 tracking-widest text-[8px]">
                        {log.category.toUpperCase()}
                      </span>
                      <h4 className="font-black text-zinc-900 uppercase font-sans text-xs pt-1 leading-tight">{log.title}</h4>
                      <p className="text-zinc-500 font-sans leading-normal lowercase normal-case">{log.description}</p>
                    </div>
                    <span className="text-zinc-400 font-bold">{log.date}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ==================== 1. APPLICATIONS ==================== */}
        {adminTab === 'applications' && (
          <div className="space-y-4 uppercase text-xs">
            <div className="flex justify-between items-center border-b-2 border-zinc-100 pb-2">
              <div>
                <h3 className="text-base font-black text-zinc-900 tracking-wide">Admissions Enquiry Pipeline</h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase">Manual and WhatsApp integrated applications</p>
              </div>
            </div>

            <div className="border-2 border-zinc-900 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-zinc-100 border-b-2 border-zinc-900 font-bold text-[10px] tracking-widest text-zinc-500">
                  <tr>
                    <th className="p-2.5">Candidate Name</th>
                    <th className="p-2.5">KCSE Grade</th>
                    <th className="p-2.5">Preferred Program</th>
                    <th className="p-2.5">Status Check</th>
                    <th className="p-2.5">Source</th>
                    <th className="p-2.5">Action Workspace</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 bg-white font-bold text-xs">
                  {paged(applications).map(app => {
                    const prog = programs.find(p => p.id === app.preferredProgramId);
                    
                    // Policy validation: check if candidate kcse grade meets program eligibility
                    const isEligible = prog ? getGradeQualified(app.kcseGrade, prog.minKcseGrade) : true;

                    return (
                      <tr key={app.id} className="hover:bg-zinc-50">
                        <td className="p-2.5">
                          <span className="font-black text-zinc-900 block">{app.fullName}</span>
                          <span className="text-[10px] text-zinc-400 font-mono block">{app.email} &bull; {app.phone}</span>
                        </td>
                        <td className="p-2.5 font-mono">
                          <span className={isEligible ? 'text-zinc-900' : 'text-rose-600 bg-rose-50 border border-rose-900 px-1 py-0.5 rounded-none flex items-center gap-1 w-fit'}>
                            {!isEligible && <AlertTriangle size={12} />}
                            {app.kcseGrade} ({app.kcseYear})
                          </span>
                        </td>
                        <td className="p-2.5">
                          <span className="font-black text-zinc-900">{prog?.code || 'TBA'}</span>
                          <span className="text-[10px] text-zinc-400 block lowercase normal-case">{prog?.name}</span>
                        </td>
                        <td className="p-2.5">
                          <span className={`text-[10px] border px-2 py-0.5 ${
                            app.status === 'accepted' ? 'bg-emerald-50 text-emerald-800 border-emerald-900' :
                            app.status === 'rejected' ? 'bg-rose-50 text-rose-800 border-rose-900' : 'bg-zinc-100 text-zinc-700 border-zinc-400'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="p-2.5 lowercase font-mono text-[10px]">{app.source}</td>
                        <td className="p-2.5">
                          <div className="flex gap-2">
                            {app.status === 'accepted' ? (
                              <button
                                onClick={() => onOpenRegisterModal(app)}
                                className="px-2.5 py-1 border border-zinc-900 bg-yellow-400 hover:bg-yellow-500 font-black text-[10px] uppercase tracking-wider transition cursor-pointer"
                              >
                                Onboard & Register Student &rarr;
                              </button>
                            ) : (
                              <div className="flex gap-1">
                                <button
                                  onClick={async () => {
                                    if (!await confirm({ title: 'Accept application?', message: `${app.fullName} will be marked accepted and become available for registration.`, confirmLabel: 'Accept offer' })) return;
                                    const updated = applications.map(a => a.id === app.id ? { ...a, status: 'accepted' as const, reviewNotes: 'Meets program requirements.' } : a);
                                    onUpdateApplications(updated);
                                    toast('Application accepted', { tone: 'success', message: `${app.fullName} is ready for onboarding.` });
                                  }}
                                  className="px-2 py-0.5 border border-zinc-400 hover:border-zinc-900 bg-white hover:bg-emerald-50 text-emerald-800 font-bold text-[9px] transition cursor-pointer"
                                >
                                  Accept Offer
                                </button>
                                <button
                                  onClick={async () => {
                                    if (!await confirm({ title: 'Reject application?', message: `${app.fullName}'s application will be marked rejected.`, confirmLabel: 'Reject application', tone: 'danger' })) return;
                                    const updated = applications.map(a => a.id === app.id ? { ...a, status: 'rejected' as const } : a);
                                    onUpdateApplications(updated);
                                    toast('Application rejected', { tone: 'warning', message: `${app.fullName}'s status was updated.` });
                                  }}
                                  className="px-2 py-0.5 border border-zinc-400 hover:border-zinc-900 bg-white hover:bg-rose-50 text-rose-800 font-bold text-[9px] transition cursor-pointer"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ==================== 2. STUDENTS LIST ==================== */}
        {adminTab === 'students' && (
          <div className="space-y-4 uppercase text-xs">
            
            {selectedStudentId ? (
              // Individual Student Dashboard inside Admin Portal
              (() => {
                const std = students.find(s => s.id === selectedStudentId);
                if (!std) return null;
                const prog = programs.find(p => p.id === std.programId);
                const coh = cohorts.find(c => c.id === std.cohortId);
                const cls = classes.find(c => c.id === std.classId);
                const stdClearance = clearances.find(c => c.studentId === std.id);
                const stdInvoice = invoices.filter(i => i.studentId === std.id);
                const stdPayment = payments.filter(p => p.studentId === std.id);
                const bal = stdInvoice.reduce((sum, i) => sum + i.amount, 0) - stdPayment.reduce((sum, p) => sum + p.amount, 0);

                return (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b-4 border-zinc-900 pb-2">
                      <div>
                        <button 
                          onClick={() => setSelectedStudentId(null)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-black tracking-widest uppercase cursor-pointer"
                        >
                          &larr; Back to Students Directory
                        </button>
                        <h3 className="text-lg font-black text-zinc-900 mt-1 uppercase tracking-tight">
                          Student Manager: {std.fullName}
                        </h3>
                      </div>
                      <div className="flex gap-2">
                        {std.holds.includes('finance_hold') ? (
                          <button
                            onClick={async () => {
                              if (!await confirm({ title: 'Lift financial hold?', message: `Restore finance-restricted access for ${std.fullName}.`, confirmLabel: 'Lift hold' })) return;
                              const updated = students.map(s => s.id === std.id ? { ...s, holds: s.holds.filter(h => h !== 'finance_hold') } : s);
                              onUpdateStudents(updated);
                              toast('Financial hold lifted', { tone: 'success' });
                            }}
                            className="px-3 py-1 border border-zinc-900 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-black text-[10px] uppercase transition cursor-pointer"
                          >
                            Lift Financial Hold
                          </button>
                        ) : (
                          <button
                            onClick={async () => {
                              if (!await confirm({ title: 'Apply financial hold?', message: `${std.fullName} will have finance-restricted portal access.`, confirmLabel: 'Apply hold', tone: 'danger' })) return;
                              const updated = students.map(s => s.id === std.id ? { ...s, holds: [...s.holds, 'finance_hold'] } : s);
                              onUpdateStudents(updated);
                              toast('Financial hold applied', { tone: 'warning' });
                            }}
                            className="px-3 py-1 border border-zinc-900 bg-rose-100 hover:bg-rose-200 text-rose-800 font-black text-[10px] uppercase transition cursor-pointer"
                          >
                            Apply Financial Hold
                          </button>
                        )}
                        <button
                          onClick={async () => {
                            if (await confirm({ title: 'Deactivate student record?', message: `${std.fullName} will be removed from the active student collection.`, confirmLabel: 'Deactivate record', tone: 'danger' })) {
                              onUpdateStudents(students.filter(s => s.id !== std.id));
                              setSelectedStudentId(null);
                              toast('Student record deactivated', { tone: 'success' });
                            }
                          }}
                          className="px-3 py-1 border border-zinc-900 bg-zinc-900 hover:bg-red-600 hover:text-white text-white font-black text-[10px] uppercase transition cursor-pointer"
                        >
                          Deactivate Record
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Left Block: Demographics & Allocations */}
                      <div className="space-y-4 p-4 border-2 border-zinc-900 bg-zinc-50/50">
                        <span className="text-[10px] font-black text-zinc-400 block tracking-widest">I. ACADEMIC LIFECYCLE ALLOCATION</span>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="text-[9px] text-zinc-500 font-black tracking-widest">Assigned Program</label>
                            <select
                              value={std.programId}
                              onChange={(e) => {
                                const updated = students.map(s => s.id === std.id ? { ...s, programId: e.target.value } : s);
                                onUpdateStudents(updated);
                              }}
                              className="w-full p-2 border border-zinc-900 bg-white cursor-pointer font-bold uppercase text-xs"
                            >
                              {programs.map(p => (
                                <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-[9px] text-zinc-500 font-black tracking-widest">Assigned Cohort</label>
                            <select
                              value={std.cohortId}
                              onChange={(e) => {
                                const updated = students.map(s => s.id === std.id ? { ...s, cohortId: e.target.value } : s);
                                onUpdateStudents(updated);
                              }}
                              className="w-full p-2 border border-zinc-900 bg-white cursor-pointer font-bold uppercase text-xs"
                            >
                              {cohorts.filter(c => c.programId === std.programId).map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-[9px] text-zinc-500 font-black tracking-widest">Assigned Class Room</label>
                            <select
                              value={std.classId}
                              onChange={(e) => {
                                const updated = students.map(s => s.id === std.id ? { ...s, classId: e.target.value } : s);
                                onUpdateStudents(updated);
                              }}
                              className="w-full p-2 border border-zinc-900 bg-white cursor-pointer font-bold uppercase text-xs"
                            >
                              {classes.filter(c => c.cohortId === std.cohortId).map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-[9px] text-zinc-500 font-black tracking-widest">Student Enrollment Status</label>
                            <select
                              value={std.status}
                              onChange={(e) => {
                                const updated = students.map(s => s.id === std.id ? { ...s, status: e.target.value as any } : s);
                                onUpdateStudents(updated);
                              }}
                              className="w-full p-2 border border-zinc-900 bg-white cursor-pointer font-bold uppercase text-xs"
                            >
                              <option value="active">Active (Enrolled)</option>
                              <option value="deferred">Deferred Term</option>
                              <option value="suspended">Suspended Accounts</option>
                              <option value="completed">Completed Study</option>
                              <option value="graduated">Alumni Graduated</option>
                            </select>
                          </div>

                        </div>
                      </div>

                      {/* Right Block: Personal Details, NOK, & Financial State */}
                      <div className="space-y-4 p-4 border-2 border-zinc-900 bg-zinc-50/50">
                        <span className="text-[10px] font-black text-zinc-400 block tracking-widest">II. REGISTER INFORMATION DETAILS</span>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[10px] text-zinc-400 block font-black">National ID:</span>
                            <span className="font-bold text-zinc-900 font-mono text-xs">{std.nationalId}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-400 block font-black">Residence:</span>
                            <span className="font-bold text-zinc-900 text-xs">{std.residence}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-400 block font-black">Telephone:</span>
                            <span className="font-bold text-zinc-900 font-mono text-xs">{std.phone}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-400 block font-black">Email Address:</span>
                            <span className="font-bold text-zinc-900 font-mono text-xs lowercase">{std.email}</span>
                          </div>
                          <div className="col-span-2 border-t border-zinc-200 pt-2">
                            <span className="text-[10px] text-zinc-400 block font-black">Next of Kin Contact:</span>
                            <span className="font-bold text-zinc-900 text-xs">
                              {std.nextOfKinName} ({std.nextOfKinRelationship}) - {std.nextOfKinPhone}
                            </span>
                          </div>
                          <div className="col-span-2 border-t border-zinc-200 pt-2 flex justify-between items-center font-mono">
                            <div>
                              <span className="text-[10px] text-zinc-400 block font-sans font-black">OUTSTANDING FEE BALANCE:</span>
                              <span className={`text-base font-black ${bal > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                                KES {bal.toLocaleString()}
                              </span>
                            </div>
                            <span className={`text-[10px] border px-2 py-0.5 uppercase ${std.holds.length > 0 ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                              {std.holds.length > 0 ? 'Holds active' : 'Clear accounts'}
                            </span>
                          </div>
                        </div>

                      </div>

                    </div>

                  </div>
                );
              })()
            ) : (
              // Student table directory
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b-2 border-zinc-100 pb-2">
                  <div>
                    <h3 className="text-base font-black text-zinc-900 tracking-wide">Registered Student Directory</h3>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">Authorized database system of record</p>
                  </div>
                  <button
                    onClick={() => onOpenRegisterModal(null)}
                    className="px-3 py-1.5 border-2 border-zinc-900 bg-yellow-400 hover:bg-yellow-500 font-black text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1"
                  >
                    <Plus size={14} /> Register New Student Profile
                  </button>
                </div>

                <div className="overflow-hidden rounded-sm border-2 border-zinc-900 shadow-sm">
                  <table className="w-full table-fixed text-left border-collapse">
                    <thead className="bg-zinc-100 border-b-2 border-zinc-900 font-bold text-[10px] tracking-widest text-zinc-500">
                      <tr>
                        <th className="w-[28%] p-2.5 sm:w-[24%]">Admission Number</th>
                        <th className="w-[28%] p-2.5 sm:w-[22%]">Student Full Name</th>
                        <th className="hidden p-2.5 md:table-cell md:w-[20%]">Program Track</th>
                        <th className="hidden p-2.5 lg:table-cell lg:w-[14%]">Cohort</th>
                        <th className="hidden p-2.5 sm:table-cell sm:w-[14%]">Status Check</th>
                        <th className="w-[44%] p-2.5 sm:w-[26%] md:w-[20%] lg:w-[16%]">Action Workspace</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 bg-white font-bold text-xs">
                      {paged(students).map(std => {
                        const prog = programs.find(p => p.id === std.programId);
                        const coh = cohorts.find(c => c.id === std.cohortId);

                        return (
                          <tr key={std.id} className="hover:bg-zinc-50">
                            <td className="break-words p-2.5 font-mono text-[10px] text-blue-700 sm:text-xs">{std.id}</td>
                            <td className="break-words p-2.5 font-black text-zinc-900">{std.fullName}</td>
                            <td className="hidden p-2.5 text-zinc-600 md:table-cell">{prog?.name || 'Unassigned'}</td>
                            <td className="hidden p-2.5 font-mono text-[11px] text-zinc-500 lg:table-cell">{coh?.name || 'TBA'}</td>
                            <td className="hidden p-2.5 sm:table-cell">
                              <span className={`text-[10px] border px-2 py-0.5 uppercase ${
                                std.status === 'active' ? 'bg-emerald-50 text-emerald-800 border-emerald-900' : 'bg-amber-50 text-amber-800 border-amber-900'
                              }`}>
                                {std.status}
                              </span>
                            </td>
                            <td className="p-2.5">
                              <button
                                onClick={() => setSelectedStudentId(std.id)}
                                className="w-full border border-zinc-900 bg-zinc-900 px-2 py-1 text-[9px] font-black uppercase text-white transition hover:bg-white hover:text-zinc-900 sm:text-[10px]"
                              >
                                Manage Lifecycle &rarr;
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ==================== 3. ONBOARDING DOCUMENT AUDITS ==================== */}
        {adminTab === 'onboarding' && (
          <div className="space-y-4 uppercase text-xs font-bold">
            <h3 className="text-base font-black text-zinc-900 border-b-2 border-zinc-100 pb-2 tracking-wide">
              Onboarding & Document Verification Audits
            </h3>

            <div className="space-y-4">
              {students.map(std => (
                <div key={std.id} className="p-4 border-2 border-zinc-900 bg-zinc-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="font-mono text-blue-700 text-[10px]">{std.id}</span>
                    <h4 className="font-black text-zinc-900 text-sm leading-tight pt-0.5">{std.fullName}</h4>
                    <p className="text-[10px] text-zinc-400 uppercase font-black">Verification status: {std.status.toUpperCase()}</p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {/* Simulated document toggles */}
                    <button
                      onClick={async () => {
                        if (!await confirm({ title: 'Change onboarding status?', message: `${std.fullName}'s orientation state will be changed.`, confirmLabel: 'Change status' })) return;
                        const updated = students.map(s => s.id === std.id ? { ...s, status: s.status === 'active' ? 'completed' as const : 'active' as const } : s);
                        onUpdateStudents(updated);
                        toast('Onboarding status updated', { tone: 'success' });
                      }}
                      className="px-3 py-1 border border-zinc-900 bg-white hover:bg-zinc-100 transition text-[10px] uppercase font-black cursor-pointer"
                    >
                      Orientation: Signed
                    </button>
                    <button
                      onClick={() => {
                        toast('National ID verified', { tone: 'success', message: 'Verification recorded by the Academic Registrar.' });
                      }}
                      className="px-3 py-1 border border-zinc-900 bg-emerald-50 text-emerald-800 font-bold text-[10px] uppercase cursor-pointer"
                    >
                      National ID: OK
                    </button>
                    <button
                      onClick={() => {
                        toast('KCSE slip verified', { tone: 'success', message: 'The academic document passed verification.' });
                      }}
                      className="px-3 py-1 border border-zinc-900 bg-emerald-50 text-emerald-800 font-bold text-[10px] uppercase cursor-pointer"
                    >
                      KCSE Slip: OK
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ==================== 4. PROGRAMS ==================== */}
        {adminTab === 'programs' && (
          <div className="space-y-6 uppercase text-xs font-bold">
            <div className="flex justify-between items-center border-b-2 border-zinc-100 pb-2">
              <div>
                <h3 className="text-base font-black text-zinc-900 tracking-wide">RHTI Programs & Syllabus</h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase">Tuition structures and entry requirements</p>
              </div>
              <button
                onClick={() => setShowProgramForm(!showProgramForm)}
                className="px-3 py-1.5 border-2 border-zinc-900 bg-zinc-900 text-white hover:bg-yellow-400 hover:text-zinc-900 text-xs font-black uppercase transition cursor-pointer flex items-center gap-1"
              >
                <Plus size={14} /> Add New Program
              </button>
            </div>

            {/* Creation Form Drawer */}
            {showProgramForm && (
              <form onSubmit={handleCreateProgram} className="portal-slide-over-form bg-zinc-50 p-4 border-2 border-zinc-900 rounded-none space-y-3">
                <span className="text-[10px] text-zinc-400 font-black tracking-widest block">CREATING NEW ACADEMIC PROGRAM</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 block tracking-widest">Program Name *</label>
                    <input type="text" required value={newProgName} onChange={e => setNewProgName(e.target.value)} className="w-full p-1.5 border border-zinc-900 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 block tracking-widest">Program code *</label>
                    <input type="text" required placeholder="e.g. CNA" value={newProgCode} onChange={e => setNewProgCode(e.target.value)} className="w-full p-1.5 border border-zinc-900 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 block tracking-widest">Tuition Cost (KES) *</label>
                    <input type="number" required placeholder="e.g. 45000" value={newProgFee} onChange={e => setNewProgFee(e.target.value)} className="w-full p-1.5 border border-zinc-900 focus:outline-none font-mono" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 block tracking-widest">Duration (Months) *</label>
                    <input type="number" required placeholder="e.g. 6" value={newProgDur} onChange={e => setNewProgDur(e.target.value)} className="w-full p-1.5 border border-zinc-900 focus:outline-none font-mono" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 block tracking-widest">Min KCSE Grade Policy *</label>
                    <select value={newProgGrade} onChange={e => setNewProgGrade(e.target.value)} className="w-full p-1.5 border border-zinc-900 focus:outline-none">
                      <option value="A">A</option>
                      <option value="B+">B+</option>
                      <option value="B">B</option>
                      <option value="C+">C+</option>
                      <option value="C">C</option>
                      <option value="C-">C-</option>
                      <option value="D+">D+</option>
                      <option value="D">D</option>
                      <option value="D-">D-</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowProgramForm(false)} className="px-3 py-1 border border-zinc-900 bg-white">Cancel</button>
                  <button type="submit" className="px-4 py-1 border border-zinc-900 bg-zinc-900 text-white font-black uppercase">Confirm</button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {programs.map(prog => (
                <div key={prog.id} className="p-4 border-2 border-zinc-900 bg-white rounded-none space-y-3">
                  <div className="flex justify-between items-start border-b border-zinc-200 pb-2">
                    <div>
                      <span className="text-[9px] bg-zinc-900 text-white font-bold px-1.5 py-0.5">{prog.code}</span>
                      <h4 className="text-sm font-black text-zinc-900 leading-tight pt-1">{prog.name}</h4>
                    </div>
                    <span className="text-xs font-mono font-black text-blue-700">KES {prog.tuitionFee.toLocaleString()}</span>
                  </div>
                  
                  <div className="space-y-1 text-[10px] text-zinc-500 leading-normal lowercase normal-case">
                    <div><span className="font-bold uppercase text-[9px] text-zinc-800 block">KCSE Entry requirement:</span> Mean Grade {prog.minKcseGrade} or above</div>
                    <div><span className="font-bold uppercase text-[9px] text-zinc-800 block pt-1">Academic Duration:</span> {prog.durationMonths} Months</div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ==================== 5. MODULES UNITS ==================== */}
        {adminTab === 'modules' && (
          <div className="space-y-6 uppercase text-xs font-bold">
            <div className="flex justify-between items-center border-b-2 border-zinc-100 pb-2">
              <div>
                <h3 className="text-base font-black text-zinc-900 tracking-wide">Syllabus Curriculum Modules</h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase">Required study units assigned by program</p>
              </div>
              <button
                onClick={() => {
                  if (programs.length > 0) {
                    setNewModProgId(programs[0].id);
                    setShowModuleForm(!showModuleForm);
                  } else {
                    toast('Program required', { tone: 'warning', message: 'Create a program before adding this record.' });
                  }
                }}
                className="px-3 py-1.5 border-2 border-zinc-900 bg-zinc-900 text-white hover:bg-yellow-400 hover:text-zinc-900 text-xs font-black uppercase transition cursor-pointer flex items-center gap-1"
              >
                <Plus size={14} /> Add New Unit
              </button>
            </div>

            {/* Creation Form Drawer */}
            {showModuleForm && (
              <form onSubmit={handleCreateModule} className="portal-slide-over-form bg-zinc-50 p-4 border-2 border-zinc-900 rounded-none space-y-3">
                <span className="text-[10px] text-zinc-400 font-black tracking-widest block">CREATING NEW ACADEMIC UNIT</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 block tracking-widest">Unit Name *</label>
                    <input type="text" required value={newModName} onChange={e => setNewModName(e.target.value)} className="w-full p-1.5 border border-zinc-900 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 block tracking-widest">Unit Code *</label>
                    <input type="text" required placeholder="e.g. CNA-104" value={newModCode} onChange={e => setNewModCode(e.target.value)} className="w-full p-1.5 border border-zinc-900 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 block tracking-widest">Credits *</label>
                    <input type="number" required placeholder="e.g. 3" value={newModCredits} onChange={e => setNewModCredits(e.target.value)} className="w-full p-1.5 border border-zinc-900 focus:outline-none font-mono" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 block tracking-widest">Belongs to Program *</label>
                    <select value={newModProgId} onChange={e => setNewModProgId(e.target.value)} className="w-full p-1.5 border border-zinc-900 focus:outline-none">
                      {programs.map(p => (
                        <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowModuleForm(false)} className="px-3 py-1 border border-zinc-900 bg-white">Cancel</button>
                  <button type="submit" className="px-4 py-1 border border-zinc-900 bg-zinc-900 text-white font-black uppercase">Confirm</button>
                </div>
              </form>
            )}

            <div className="border-2 border-zinc-900 overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-zinc-100 border-b-2 border-zinc-900 font-bold text-[10px] tracking-widest text-zinc-500">
                  <tr>
                    <th className="p-2.5">Unit Code</th>
                    <th className="p-2.5">Unit Title</th>
                    <th className="p-2.5">Course Credits</th>
                    <th className="p-2.5">Program Track</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 bg-white font-bold text-xs text-zinc-900">
                  {paged(modules).map(m => (
                    <tr key={m.id} className="hover:bg-zinc-50">
                      <td className="p-2.5 font-mono text-zinc-600">{m.code}</td>
                      <td className="p-2.5 text-zinc-900">{m.name}</td>
                      <td className="p-2.5 font-mono text-zinc-700">{m.credits} credits</td>
                      <td className="p-2.5 text-zinc-500">{programs.find(p => p.id === m.programId)?.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ==================== 6. COHORTS ==================== */}
        {adminTab === 'cohorts' && (
          <div className="space-y-6 uppercase text-xs font-bold">
            <div className="flex justify-between items-center border-b-2 border-zinc-100 pb-2">
              <div>
                <h3 className="text-base font-black text-zinc-900 tracking-wide">Intake Cohort Batches</h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase">Registration cohorts linked to academic programs</p>
              </div>
              <button
                onClick={() => {
                  if (programs.length > 0) {
                    setNewCohProgId(programs[0].id);
                    setShowCohortForm(!showCohortForm);
                  } else {
                    toast('Program required', { tone: 'warning', message: 'Create a program before adding this record.' });
                  }
                }}
                className="px-3 py-1.5 border-2 border-zinc-900 bg-zinc-900 text-white hover:bg-yellow-400 hover:text-zinc-900 text-xs font-black uppercase transition cursor-pointer flex items-center gap-1"
              >
                <Plus size={14} /> Add New Cohort
              </button>
            </div>

            {/* Creation Form Drawer */}
            {showCohortForm && (
              <form onSubmit={handleCreateCohort} className="portal-slide-over-form bg-zinc-50 p-4 border-2 border-zinc-900 rounded-none space-y-3">
                <span className="text-[10px] text-zinc-400 font-black tracking-widest block">CREATING COHORT</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 block tracking-widest">Cohort Name *</label>
                    <input type="text" required placeholder="e.g. CNA-2026-B" value={newCohName} onChange={e => setNewCohName(e.target.value)} className="w-full p-1.5 border border-zinc-900 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 block tracking-widest">Program *</label>
                    <select value={newCohProgId} onChange={e => setNewCohProgId(e.target.value)} className="w-full p-1.5 border border-zinc-900 focus:outline-none">
                      {programs.map(p => (
                        <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowCohortForm(false)} className="px-3 py-1 border border-zinc-900 bg-white">Cancel</button>
                  <button type="submit" className="px-4 py-1 border border-zinc-900 bg-zinc-900 text-white font-black uppercase">Confirm</button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {cohorts.map(coh => (
                <div key={coh.id} className="p-4 border-2 border-zinc-900 bg-zinc-50 flex justify-between items-center">
                  <div>
                    <h4 className="font-black text-sm text-zinc-900">{coh.name}</h4>
                    <span className="text-[9px] text-zinc-400 block pt-0.5">{coh.intakeTerm}</span>
                    <span className="text-[10px] text-zinc-500 font-mono block">{coh.startDate}</span>
                  </div>
                  <span className="text-[10px] bg-zinc-900 text-white font-bold px-2 py-0.5 uppercase">
                    {programs.find(p => p.id === coh.programId)?.code}
                  </span>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ==================== 7. CLASSES ==================== */}
        {adminTab === 'classes' && (
          <div className="space-y-6 uppercase text-xs font-bold">
            <div className="flex justify-between items-center border-b-2 border-zinc-100 pb-2">
              <div>
                <h3 className="text-base font-black text-zinc-900 tracking-wide">Class Divisions & Trainers</h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase">Assigned lecturers and rooms under cohorts</p>
              </div>
              <button
                onClick={() => {
                  if (cohorts.length > 0) {
                    setNewClsCohId(cohorts[0].id);
                    setShowClassForm(!showClassForm);
                  } else {
                    toast('Cohort required', { tone: 'warning', message: 'Create a cohort before adding a class.' });
                  }
                }}
                className="px-3 py-1.5 border-2 border-zinc-900 bg-zinc-900 text-white hover:bg-yellow-400 hover:text-zinc-900 text-xs font-black uppercase transition cursor-pointer flex items-center gap-1"
              >
                <Plus size={14} /> Add New Class
              </button>
            </div>

            {/* Creation Form Drawer */}
            {showClassForm && (
              <form onSubmit={handleCreateClass} className="portal-slide-over-form bg-zinc-50 p-4 border-2 border-zinc-900 rounded-none space-y-3">
                <span className="text-[10px] text-zinc-400 font-black tracking-widest block">CREATING CLASSROOM GROUP</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 block tracking-widest">Classroom Name *</label>
                    <input type="text" required placeholder="e.g. CNA Class A" value={newClsName} onChange={e => setNewClsName(e.target.value)} className="w-full p-1.5 border border-zinc-900 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 block tracking-widest">Lecturer / Trainer *</label>
                    <input type="text" required placeholder="e.g. Prof. Alan Turing" value={newClsLecturer} onChange={e => setNewClsLecturer(e.target.value)} className="w-full p-1.5 border border-zinc-900 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 block tracking-widest">Laboratory / Room Name</label>
                    <input type="text" placeholder="e.g. IT Room 101" value={newClsRoom} onChange={e => setNewClsRoom(e.target.value)} className="w-full p-1.5 border border-zinc-900 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 block tracking-widest">Cohort Batch *</label>
                    <select value={newClsCohId} onChange={e => setNewClsCohId(e.target.value)} className="w-full p-1.5 border border-zinc-900 focus:outline-none">
                      {cohorts.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowClassForm(false)} className="px-3 py-1 border border-zinc-900 bg-white">Cancel</button>
                  <button type="submit" className="px-4 py-1 border border-zinc-900 bg-zinc-900 text-white font-black uppercase">Confirm</button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {classes.map(cl => (
                <div key={cl.id} className="p-4 border-2 border-zinc-900 bg-white rounded-none space-y-3">
                  <div className="flex justify-between items-center border-b border-zinc-200 pb-2">
                    <h4 className="text-sm font-black text-zinc-900">{cl.name}</h4>
                    <span className="text-[9px] bg-zinc-900 text-white font-bold px-1.5 py-0.5 rounded-none uppercase">
                      {cl.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-500 space-y-1">
                    <div><span className="font-bold text-zinc-900">TRAINER:</span> {cl.lecturerName}</div>
                    <div><span className="font-bold text-zinc-900">LABORATORY:</span> {cl.room}</div>
                    <div><span className="font-bold text-zinc-900">COHORT BATCH:</span> {cohorts.find(c => c.id === cl.cohortId)?.name}</div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ==================== 8. RESOURCES ==================== */}
        {adminTab === 'resources' && (
          <div className="space-y-6 uppercase text-xs font-bold">
            <div className="flex justify-between items-center border-b-2 border-zinc-100 pb-2">
              <div>
                <h3 className="text-base font-black text-zinc-900 tracking-wide">Campus Learning Resources Directory</h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase">Assign curriculum files, video links, or syllabus guidelines</p>
              </div>
              <button
                onClick={() => setShowResourceForm(!showResourceForm)}
                className="px-3 py-1.5 border-2 border-zinc-900 bg-zinc-900 text-white hover:bg-yellow-400 hover:text-zinc-900 text-xs font-black uppercase transition cursor-pointer flex items-center gap-1"
              >
                <Plus size={14} /> Upload New Document
              </button>
            </div>

            {/* Creation Form Drawer */}
            {showResourceForm && (
              <form onSubmit={handleCreateResource} className="portal-slide-over-form bg-zinc-50 p-4 border-2 border-zinc-900 rounded-none space-y-3">
                <span className="text-[10px] text-zinc-400 font-black tracking-widest block">UPLOADING DOCUMENT</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 block tracking-widest">Document Title *</label>
                    <input type="text" required placeholder="e.g. Hand Hygiene WHO standard" value={newResTitle} onChange={e => setNewResTitle(e.target.value)} className="w-full p-1.5 border border-zinc-900 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 block tracking-widest">Document Link/URL *</label>
                    <input type="text" required placeholder="https://..." value={newResUrl} onChange={e => setNewResUrl(e.target.value)} className="w-full p-1.5 border border-zinc-900 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 block tracking-widest">Resource Type *</label>
                    <select value={newResType} onChange={e => setNewResType(e.target.value as any)} className="w-full p-1.5 border border-zinc-900 focus:outline-none">
                      <option value="pdf">PDF Syllabus</option>
                      <option value="link">Website Link</option>
                      <option value="video">Lecturer Video</option>
                      <option value="assignment">Homework Assignment</option>
                      <option value="policy">Institute Policy</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 block tracking-widest">Assign to Target Group *</label>
                    <select value={newResTargetType} onChange={e => {
                      setNewResTargetType(e.target.value as any);
                      setNewResTargetId('');
                    }} className="w-full p-1.5 border border-zinc-900 focus:outline-none">
                      <option value="all">Publish to All (all students)</option>
                      <option value="program">Target Program Specific</option>
                      <option value="cohort">Target Cohort Specific</option>
                      <option value="class">Target Class Specific</option>
                    </select>
                  </div>

                  {newResTargetType !== 'all' && (
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 block tracking-widest">Enter Target Group ID *</label>
                      <select required value={newResTargetId} onChange={e => setNewResTargetId(e.target.value)} className="w-full p-1.5 border border-zinc-900 focus:outline-none">
                        <option value="">-- Select Target ID --</option>
                        {newResTargetType === 'program' && programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        {newResTargetType === 'cohort' && cohorts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        {newResTargetType === 'class' && classes.map(cl => <option key={cl.id} value={cl.id}>{cl.name}</option>)}
                      </select>
                    </div>
                  )}

                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowResourceForm(false)} className="px-3 py-1 border border-zinc-900 bg-white">Cancel</button>
                  <button type="submit" className="px-4 py-1 border border-zinc-900 bg-zinc-900 text-white font-black uppercase">Confirm</button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {resources.map(res => (
                <div key={res.id} className="p-3 border-2 border-zinc-900 bg-zinc-50 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] bg-zinc-900 text-white px-2 py-0.5 tracking-wider font-mono">{res.type.toUpperCase()}</span>
                    <h4 className="font-black text-sm text-zinc-900 pt-1">{res.title}</h4>
                    <p className="text-[10px] text-zinc-400 lowercase normal-case">Uploaded by {res.uploadedBy} &bull; Target: {res.targetType} ({res.targetId})</p>
                  </div>
                  <button
                    onClick={() => {
                      onUpdateResources(resources.filter(r => r.id !== res.id));
                    }}
                    className="p-1 border border-zinc-400 hover:border-zinc-900 text-zinc-400 hover:text-zinc-900 bg-white"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ==================== 9. TIMETABLE ==================== */}
        {adminTab === 'timetable' && (
          <div className="space-y-6 uppercase text-xs font-bold">
            <div className="flex justify-between items-center border-b-2 border-zinc-100 pb-2">
              <div>
                <h3 className="text-base font-black text-zinc-900 tracking-wide">Weekly Timetable Planner</h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase">Lecturer, class, and room assignments conflict checker</p>
              </div>
              <button
                onClick={() => {
                  if (classes.length > 0 && modules.length > 0) {
                    setNewTtClassId(classes[0].id);
                    setNewTtModId(modules[0].id);
                    setShowTimetableForm(!showTimetableForm);
                  } else {
                    toast('Class and module required', { tone: 'warning' });
                  }
                }}
                className="px-3 py-1.5 border-2 border-zinc-900 bg-zinc-900 text-white hover:bg-yellow-400 hover:text-zinc-900 text-xs font-black uppercase transition cursor-pointer flex items-center gap-1"
              >
                <Plus size={14} /> Schedule New Slot
              </button>
            </div>

            {/* Creation Form Drawer */}
            {showTimetableForm && (
              <form onSubmit={handleCreateTimetable} className="portal-slide-over-form bg-zinc-50 p-4 border-2 border-zinc-900 rounded-none space-y-3">
                <span className="text-[10px] text-zinc-400 font-black tracking-widest block">CREATING SCHEDULE UNIT</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 block tracking-widest">Class Group *</label>
                    <select value={newTtClassId} onChange={e => setNewTtClassId(e.target.value)} className="w-full p-1.5 border border-zinc-900 bg-white">
                      {classes.map(cl => <option key={cl.id} value={cl.id}>{cl.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 block tracking-widest">Subject Module Unit *</label>
                    <select value={newTtModId} onChange={e => setNewTtModId(e.target.value)} className="w-full p-1.5 border border-zinc-900 bg-white">
                      {modules.map(m => <option key={m.id} value={m.id}>{m.code} - {m.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 block tracking-widest">Day of Week *</label>
                    <select value={newTtDay} onChange={e => setNewTtDay(e.target.value as any)} className="w-full p-1.5 border border-zinc-900 bg-white">
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 block tracking-widest">Start Time *</label>
                      <input type="text" required placeholder="e.g. 08:30 AM" value={newTtStartTime} onChange={e => setNewTtStartTime(e.target.value)} className="w-full p-1.5 border border-zinc-900 focus:outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 block tracking-widest">End Time *</label>
                      <input type="text" required placeholder="e.g. 10:30 AM" value={newTtEndTime} onChange={e => setNewTtEndTime(e.target.value)} className="w-full p-1.5 border border-zinc-900 focus:outline-none" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 block tracking-widest">Laboratory / Room *</label>
                    <input type="text" required placeholder="e.g. Dental Clinic Bay B" value={newTtRoom} onChange={e => setNewTtRoom(e.target.value)} className="w-full p-1.5 border border-zinc-900 focus:outline-none" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowTimetableForm(false)} className="px-3 py-1 border border-zinc-900 bg-white">Cancel</button>
                  <button type="submit" className="px-4 py-1 border border-zinc-900 bg-zinc-900 text-white font-black uppercase">Confirm</button>
                </div>
              </form>
            )}

            <div className="border-2 border-zinc-900 overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-zinc-100 border-b-2 border-zinc-900 font-bold text-[10px] tracking-widest text-zinc-500">
                  <tr>
                    <th className="p-2.5">Classroom Group</th>
                    <th className="p-2.5">Weekday</th>
                    <th className="p-2.5">Time Schedule</th>
                    <th className="p-2.5">Subject Unit</th>
                    <th className="p-2.5">Laboratory / Room</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 bg-white font-bold text-xs text-zinc-900">
                  {paged(timetable).map(t => (
                    <tr key={t.id} className="hover:bg-zinc-50">
                      <td className="p-2.5 text-zinc-900">{classes.find(cl => cl.id === t.classId)?.name}</td>
                      <td className="p-2.5 text-zinc-800">{t.dayOfWeek}</td>
                      <td className="p-2.5 font-mono text-blue-700">{t.startTime} - {t.endTime}</td>
                      <td className="p-2.5 text-zinc-600">{modules.find(m => m.id === t.moduleId)?.name}</td>
                      <td className="p-2.5 font-mono text-zinc-500">{t.room}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ==================== 10. EXAMS SETUP ==================== */}
        {adminTab === 'exams' && (
          <div className="space-y-6 uppercase text-xs font-bold">
            <div className="flex justify-between items-center border-b-2 border-zinc-100 pb-2">
              <div>
                <h3 className="text-base font-black text-zinc-900 tracking-wide">Continuous Assessments & Exams Setup</h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase">Weight distributions, dates, and grading schemes</p>
              </div>
              <button
                onClick={() => {
                  if (classes.length > 0 && modules.length > 0) {
                    setNewExamClassId(classes[0].id);
                    setNewExamModId(modules[0].id);
                    setShowExamForm(!showExamForm);
                  } else {
                    toast('Class and module required', { tone: 'warning' });
                  }
                }}
                className="px-3 py-1.5 border-2 border-zinc-900 bg-zinc-900 text-white hover:bg-yellow-400 hover:text-zinc-900 text-xs font-black uppercase transition cursor-pointer flex items-center gap-1"
              >
                <Plus size={14} /> Schedule New Exam
              </button>
            </div>

            {/* Creation Form Drawer */}
            {showExamForm && (
              <form onSubmit={handleCreateExam} className="portal-slide-over-form bg-zinc-50 p-4 border-2 border-zinc-900 rounded-none space-y-3">
                <span className="text-[10px] text-zinc-400 font-black tracking-widest block">CREATING NEW EXAM BOARD</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 block tracking-widest">Exam/Assessment Title *</label>
                    <input type="text" required placeholder="e.g. End of Term Clinical Practical" value={newExamName} onChange={e => setNewExamName(e.target.value)} className="w-full p-1.5 border border-zinc-900 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 block tracking-widest">Exam Date *</label>
                    <input type="date" required value={newExamDate} onChange={e => setNewExamDate(e.target.value)} className="w-full p-1 border border-zinc-900 focus:outline-none font-mono" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 block tracking-widest">Grading Weight % *</label>
                    <input type="number" required placeholder="e.g. 40 for 40%" value={newExamWeight} onChange={e => setNewExamWeight(e.target.value)} className="w-full p-1.5 border border-zinc-900 focus:outline-none font-mono" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 block tracking-widest">Class Group *</label>
                    <select value={newExamClassId} onChange={e => setNewExamClassId(e.target.value)} className="w-full p-1.5 border border-zinc-900 bg-white">
                      {classes.map(cl => <option key={cl.id} value={cl.id}>{cl.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 block tracking-widest">Module Unit *</label>
                    <select value={newExamModId} onChange={e => setNewExamModId(e.target.value)} className="w-full p-1.5 border border-zinc-900 bg-white">
                      {modules.map(m => <option key={m.id} value={m.id}>{m.code} - {m.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowExamForm(false)} className="px-3 py-1 border border-zinc-900 bg-white">Cancel</button>
                  <button type="submit" className="px-4 py-1 border border-zinc-900 bg-zinc-900 text-white font-black uppercase">Confirm</button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exams.map(ex => (
                <div key={ex.id} className="p-4 border-2 border-zinc-900 bg-white space-y-3">
                  <div className="flex justify-between items-start border-b border-zinc-200 pb-2">
                    <div>
                      <span className="text-[9px] bg-zinc-900 text-white font-bold px-1.5 py-0.5">WEIGHT: {ex.weightPercent}%</span>
                      <h4 className="text-sm font-black text-zinc-900 pt-1 leading-tight">{ex.name}</h4>
                    </div>
                    <span className="text-xs font-mono font-bold text-zinc-500">{ex.date}</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 space-y-1">
                    <div><span className="font-bold text-zinc-900">MODULE:</span> {modules.find(m => m.id === ex.moduleId)?.name}</div>
                    <div><span className="font-bold text-zinc-900">CLASS:</span> {classes.find(c => c.id === ex.classId)?.name}</div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ==================== 11. RESULTS PUBLISHING ==================== */}
        {adminTab === 'results' && (
          <div className="space-y-6 uppercase text-xs font-bold">
            <div className="flex justify-between items-center border-b-2 border-zinc-100 pb-2">
              <div>
                <h3 className="text-base font-black text-zinc-900 tracking-wide">Continuous Assessment & Exam Grading Ledger</h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase">Record scores, grades, and pass/fail thresholds</p>
              </div>
              <button
                onClick={() => {
                  if (students.length > 0 && exams.length > 0) {
                    setNewMarkStdId(students[0].id);
                    setNewMarkExamId(exams[0].id);
                    setShowMarkForm(!showMarkForm);
                  } else {
                    toast('Student and exam required', { tone: 'warning' });
                  }
                }}
                className="px-3 py-1.5 border-2 border-zinc-900 bg-zinc-900 text-white hover:bg-yellow-400 hover:text-zinc-900 text-xs font-black uppercase transition cursor-pointer flex items-center gap-1"
              >
                <Plus size={14} /> Enter New Score Mark
              </button>
            </div>

            {/* Creation Form Drawer */}
            {showMarkForm && (
              <form onSubmit={handleCreateMark} className="portal-slide-over-form bg-zinc-50 p-4 border-2 border-zinc-900 rounded-none space-y-3">
                <span className="text-[10px] text-zinc-400 font-black tracking-widest block">RECORDING STUDENT SCORE</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 block tracking-widest">Select Student *</label>
                    <select value={newMarkStdId} onChange={e => setNewMarkStdId(e.target.value)} className="w-full p-1.5 border border-zinc-900 bg-white">
                      {students.map(s => <option key={s.id} value={s.id}>{s.fullName} ({s.id})</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 block tracking-widest">Select Scheduled Exam *</label>
                    <select value={newMarkExamId} onChange={e => setNewMarkExamId(e.target.value)} className="w-full p-1.5 border border-zinc-900 bg-white">
                      {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 block tracking-widest">Marks Obtained (Out of 100) *</label>
                    <input type="number" required placeholder="e.g. 85" min="0" max="100" value={newMarkScore} onChange={e => setNewMarkScore(e.target.value)} className="w-full p-1.5 border border-zinc-900 focus:outline-none font-mono" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowMarkForm(false)} className="px-3 py-1 border border-zinc-900 bg-white">Cancel</button>
                  <button type="submit" className="px-4 py-1 border border-zinc-900 bg-zinc-900 text-white font-black uppercase">Confirm</button>
                </div>
              </form>
            )}

            <div className="border-2 border-zinc-900 overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-zinc-100 border-b-2 border-zinc-900 font-bold text-[10px] tracking-widest text-zinc-500">
                  <tr>
                    <th className="p-2.5">Student Admission</th>
                    <th className="p-2.5">Exam Name</th>
                    <th className="p-2.5">Marks Obtained</th>
                    <th className="p-2.5">Final Grade</th>
                    <th className="p-2.5">Moderation status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 bg-white font-bold text-xs text-zinc-900">
                  {paged(marks).map(m => {
                    const std = students.find(s => s.id === m.studentId);
                    const ex = exams.find(x => x.id === m.examId);
                    return (
                      <tr key={m.id} className="hover:bg-zinc-50">
                        <td className="p-2.5 font-mono text-zinc-600">
                          <span className="font-bold text-zinc-900 block">{std?.fullName}</span>
                          {m.studentId}
                        </td>
                        <td className="p-2.5 text-zinc-800">{ex?.name || m.examId}</td>
                        <td className="p-2.5 font-mono font-black text-sm">{m.marksObtained}%</td>
                        <td className="p-2.5">
                          <span className={`text-[10px] px-2 py-0.5 border ${m.status === 'Passed' ? 'bg-emerald-50 text-emerald-800 border-emerald-950' : 'bg-rose-50 text-rose-800 border-rose-950'}`}>
                            {m.grade} ({m.status.toUpperCase()})
                          </span>
                        </td>
                        <td className="p-2.5">
                          <span className="text-[10px] bg-zinc-900 text-white px-2 py-0.5 tracking-wider">
                            MODERATED OK
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ==================== 12. FEES LEDGER ==================== */}
        {adminTab === 'fees' && (
          <div className="space-y-6 uppercase text-xs font-bold">
            <h3 className="text-base font-black text-zinc-900 border-b-2 border-zinc-100 pb-2 tracking-wide">
              Bursar Invoices & Payments Ledger
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Invoices */}
              <div className="space-y-3 p-4 border-2 border-zinc-900 bg-zinc-50/50">
                <span className="text-[10px] font-black text-zinc-400 tracking-widest block">I. ACTIVE STUDENT INVOICES</span>
                <div className="space-y-2">
                  {invoices.map(inv => {
                    const std = students.find(s => s.id === inv.studentId);
                    return (
                      <div key={inv.id} className="p-3 bg-white border border-zinc-950">
                        <span className="font-mono text-[9px] text-zinc-400">{inv.invoiceNumber} &bull; {inv.dueDate}</span>
                        <h4 className="font-black text-zinc-900 text-xs uppercase pt-0.5">{std?.fullName || inv.studentId}</h4>
                        <p className="text-[10px] text-zinc-500 normal-case">{inv.title}</p>
                        <div className="flex justify-between items-center mt-2 pt-1 border-t border-zinc-100">
                          <span className="font-mono text-xs font-black text-blue-700">KES {inv.amount.toLocaleString()}</span>
                          <span className={`text-[9px] font-black px-1.5 border border-zinc-900 uppercase ${inv.status === 'paid' ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                            {inv.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payments History */}
              <div className="space-y-3 p-4 border-2 border-zinc-900 bg-zinc-50/50 font-mono text-[10px]">
                <span className="text-[10px] font-sans font-black text-zinc-400 tracking-widest block">II. REMITTANCES AUDIT TRAIL</span>
                <div className="space-y-2">
                  {payments.map(pay => {
                    const std = students.find(s => s.id === pay.studentId);
                    return (
                      <div key={pay.id} className="p-3 bg-white border border-zinc-950">
                        <div className="flex justify-between font-sans text-zinc-400 text-[8px]">
                          <span>RECEIPT {pay.receiptNumber}</span>
                          <span>{pay.datePaid}</span>
                        </div>
                        <h4 className="font-black text-zinc-900 font-sans text-xs pt-0.5">{std?.fullName || pay.studentId}</h4>
                        <p className="text-[10px] text-zinc-500 font-sans font-bold normal-case">Paid KES {pay.amount.toLocaleString()} via {pay.paymentMethod} ({pay.transactionReference})</p>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ==================== 13. REQUESTS PETITIONS ==================== */}
        {adminTab === 'requests' && (
          <div className="space-y-4 uppercase text-xs font-bold">
            <h3 className="text-base font-black text-zinc-900 border-b-2 border-zinc-100 pb-2 tracking-wide">
              Support Petitions & Leave Requests
            </h3>

            <div className="space-y-4">
              {requests.map(req => {
                const std = students.find(s => s.id === req.studentId);
                return (
                  <div key={req.id} className="border-2 border-zinc-900 p-4 space-y-3 bg-zinc-50/40">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-zinc-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-zinc-900 text-white font-black px-2 py-0.5 text-[9px]">
                          {req.category.toUpperCase()}
                        </span>
                        <span className="font-mono text-blue-700 text-[10px]">By student {std?.fullName || req.studentId} ({req.studentId})</span>
                      </div>
                      <span className={`text-[10px] border px-2 py-0.5 ${
                        req.status === 'approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-950' : 'bg-amber-50 text-amber-800 border-amber-950'
                      }`}>
                        {req.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-zinc-900 leading-tight uppercase">{req.subject}</h4>
                      <p className="text-[11px] text-zinc-600 font-medium normal-case font-sans leading-normal">
                        "{req.description}"
                      </p>
                    </div>

                    {req.adminComments ? (
                      <div className="p-2 bg-white border border-zinc-200 text-[10px] font-sans lowercase normal-case italic">
                        <b>Feedback:</b> "{req.adminComments}"
                      </div>
                    ) : (
                      <div className="pt-2 flex gap-2">
                        <button
                          onClick={async () => {
                            const note = await promptDialog({ title: 'Approve petition?', message: `Add the response that ${req.studentName} will see.`, inputLabel: 'Administrative response', inputPlaceholder: 'Enter approval notes…', confirmLabel: 'Approve petition' });
                            if (note === null) return;
                            const updated = requests.map(r => r.id === req.id ? { ...r, status: 'approved' as const, adminComments: note } : r);
                            onUpdateRequests(updated);
                            toast('Petition approved', { tone: 'success' });
                          }}
                          className="px-2 py-1 border border-zinc-900 bg-white hover:bg-emerald-50 text-emerald-800 font-black text-[9px] transition cursor-pointer"
                        >
                          Approve Petition
                        </button>
                        <button
                          onClick={async () => {
                            const note = await promptDialog({ title: 'Decline petition?', message: `Explain why ${req.studentName}'s petition is being declined.`, inputLabel: 'Rejection reason', inputPlaceholder: 'Enter a clear reason…', confirmLabel: 'Decline petition', tone: 'danger' });
                            if (note === null) return;
                            const updated = requests.map(r => r.id === req.id ? { ...r, status: 'rejected' as const, adminComments: note } : r);
                            onUpdateRequests(updated);
                            toast('Petition declined', { tone: 'warning' });
                          }}
                          className="px-2 py-1 border border-zinc-900 bg-white hover:bg-rose-50 text-rose-800 font-black text-[9px] transition cursor-pointer"
                        >
                          Decline Petition
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ==================== 14. CLEARANCE CHECKS ==================== */}
        {adminTab === 'clearance' && (
          <div className="space-y-4 uppercase text-xs font-bold">
            <h3 className="text-base font-black text-zinc-900 border-b-2 border-zinc-100 pb-2 tracking-wide">
              Official Departmental Clearance Audits
            </h3>

            <div className="space-y-4">
              {clearances.map(clr => {
                const std = students.find(s => s.id === clr.studentId);
                return (
                  <div key={clr.studentId} className="border-2 border-zinc-900 p-4 space-y-3 bg-zinc-50/40">
                    <div className="flex justify-between border-b border-zinc-200 pb-2">
                      <h4 className="font-black text-zinc-900 text-sm">{std?.fullName || clr.studentId} ({clr.studentId})</h4>
                      <span className={`text-[10px] border px-2 py-0.5 ${clr.status === 'cleared' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
                        {clr.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px]">
                      {[
                        { key: 'financeApproved', label: 'Finance' },
                        { key: 'libraryApproved', label: 'Library' },
                        { key: 'skillsLabApproved', label: 'Skills Lab' },
                        { key: 'academicOfficeApproved', label: 'Academic' },
                        { key: 'attachmentOfficeApproved', label: 'Attachment' },
                        { key: 'registrarApproved', label: 'Registrar' }
                      ].map(field => {
                        const isOk = clr.checkpoints[field.key as keyof typeof clr.checkpoints];
                        return (
                          <button
                            key={field.key}
                            onClick={async () => {
                              if (!await confirm({ title: `${isOk ? 'Revoke' : 'Approve'} ${field.label} clearance?`, message: `This changes the departmental clearance status for ${std?.fullName || clr.studentId}.`, confirmLabel: isOk ? 'Revoke clearance' : 'Approve clearance', tone: isOk ? 'danger' : 'default' })) return;
                              const updatedCheckpoints = { ...clr.checkpoints, [field.key]: !isOk };
                              
                              // Check if all are true to auto-mark as cleared
                              const allOk = Object.values(updatedCheckpoints).every(v => v === true);
                              const newStatus = allOk ? 'cleared' as const : 'in_progress' as const;

                              const updated = clearances.map(c => c.studentId === clr.studentId ? {
                                ...c,
                                checkpoints: updatedCheckpoints,
                                status: newStatus
                              } : c);
                              onUpdateClearances(updated);
                              toast('Clearance status updated', { tone: 'success', message: `${field.label}: ${isOk ? 'Pending' : 'Approved'}.` });
                            }}
                            className={`p-2 border border-zinc-900 font-black text-center transition cursor-pointer flex justify-between items-center ${
                              isOk ? 'bg-emerald-50 text-emerald-800' : 'bg-white text-zinc-400'
                            }`}
                          >
                            <span>{field.label}:</span>
                            <span>{isOk ? 'OK' : 'PENDING'}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ==================== 15. GRADUATION ==================== */}
        {adminTab === 'graduation' && (
          <div className="space-y-6 uppercase text-xs font-bold">
            
            <div className="flex justify-between items-center border-b-2 border-zinc-100 pb-2">
              <div>
                <h3 className="text-base font-black text-zinc-900 tracking-wide">Convocation Ceremonies & Graduation Batches</h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase">Candidate eligibility lists and certificate issuance</p>
              </div>
              <button
                onClick={() => setShowGradBatchForm(!showGradBatchForm)}
                className="px-3 py-1.5 border-2 border-zinc-900 bg-zinc-900 text-white hover:bg-yellow-400 hover:text-zinc-900 text-xs font-black uppercase transition cursor-pointer flex items-center gap-1"
              >
                <Plus size={14} /> Create Ceremony Batch
              </button>
            </div>

            {/* Creation Form Drawer */}
            {showGradBatchForm && (
              <form onSubmit={handleCreateGradBatch} className="portal-slide-over-form bg-zinc-50 p-4 border-2 border-zinc-900 rounded-none space-y-3">
                <span className="text-[10px] text-zinc-400 font-black tracking-widest block">CREATING CEREMONY BATCH</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 block tracking-widest">Ceremony Name *</label>
                    <input type="text" required placeholder="e.g. 13th Convocation Ceremony" value={newGbName} onChange={e => setNewGbName(e.target.value)} className="w-full p-1.5 border border-zinc-900 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 block tracking-widest">Ceremony Date *</label>
                    <input type="date" required value={newGbDate} onChange={e => setNewGbDate(e.target.value)} className="w-full p-1 border border-zinc-900 focus:outline-none font-mono" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowGradBatchForm(false)} className="px-3 py-1 border border-zinc-900 bg-white">Cancel</button>
                  <button type="submit" className="px-4 py-1 border border-zinc-900 bg-zinc-900 text-white font-black uppercase">Confirm</button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {graduationBatches.map(gb => (
                <div key={gb.id} className="p-4 border-2 border-zinc-900 bg-zinc-50 space-y-2">
                  <div className="flex justify-between items-center border-b border-zinc-200 pb-1.5">
                    <h4 className="font-black text-sm text-zinc-900">{gb.name}</h4>
                    <span className="text-[9px] bg-zinc-900 text-white px-1.5 py-0.5 rounded-none">{gb.status}</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 flex justify-between font-mono">
                    <span>DATE: {gb.ceremonyDate}</span>
                    <span>BATCH ID: {gb.id}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Graduation Candidates Eligibility Grid */}
            <div className="pt-4 space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                <h4 className="text-sm font-black text-zinc-900 tracking-wide uppercase">Graduation Candidates Register</h4>
                <button
                  onClick={() => {
                    if (students.length > 0 && graduationBatches.length > 0) {
                      setNewGcStdId(students[0].id);
                      setNewGcBatchId(graduationBatches[0].id);
                      setShowGradCandidateForm(!showGradCandidateForm);
                    } else {
                      toast('Graduation setup required', { tone: 'warning', message: 'Add a student and graduation batch first.' });
                    }
                  }}
                  className="px-2.5 py-1 border border-zinc-900 bg-zinc-150 hover:bg-zinc-200 font-bold text-[10px] uppercase transition cursor-pointer"
                >
                  + Add Eligible Candidate
                </button>
              </div>

              {showGradCandidateForm && (
                <form onSubmit={handleCreateGradCandidate} className="portal-slide-over-form bg-zinc-50 p-4 border-2 border-zinc-900 rounded-none space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 block tracking-widest">Select Student *</label>
                      <select value={newGcStdId} onChange={e => setNewGcStdId(e.target.value)} className="w-full p-1.5 border border-zinc-900 bg-white">
                        {students.map(s => <option key={s.id} value={s.id}>{s.fullName} ({s.id})</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 block tracking-widest">Select Graduation Ceremony *</label>
                      <select value={newGcBatchId} onChange={e => setNewGcBatchId(e.target.value)} className="w-full p-1.5 border border-zinc-900 bg-white">
                        {graduationBatches.map(gb => <option key={gb.id} value={gb.id}>{gb.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setShowGradCandidateForm(false)} className="px-3 py-1 border border-zinc-900 bg-white">Cancel</button>
                    <button type="submit" className="px-4 py-1 border border-zinc-900 bg-zinc-900 text-white font-black uppercase">Add</button>
                  </div>
                </form>
              )}

              <div className="border-2 border-zinc-900 overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-zinc-100 border-b-2 border-zinc-900 font-bold text-[10px] tracking-widest text-zinc-500">
                    <tr>
                      <th className="p-2.5">Candidate Student</th>
                      <th className="p-2.5">Conferred Degree/Major</th>
                      <th className="p-2.5">Clearance Check</th>
                      <th className="p-2.5">Degree Issued</th>
                      <th className="p-2.5">Transcript Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 bg-white font-bold text-xs text-zinc-900">
                    {paged(graduationCandidates).map(gc => {
                      const std = students.find(s => s.id === gc.studentId);
                      const prog = programs.find(p => p.id === std?.programId);
                      const clr = clearances.find(c => c.studentId === gc.studentId);
                      
                      const isFullyCleared = clr?.status === 'cleared';

                      return (
                        <tr key={gc.id} className="hover:bg-zinc-50">
                          <td className="p-2.5 font-mono text-zinc-600">
                            <span className="font-bold text-zinc-900 block font-sans">{std?.fullName}</span>
                            {gc.studentId}
                          </td>
                          <td className="p-2.5 text-zinc-700">{prog?.name}</td>
                          <td className="p-2.5">
                            <span className={`text-[9px] font-black border px-2 py-0.5 uppercase ${
                              isFullyCleared ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                            }`}>
                              {isFullyCleared ? 'CLEARED' : 'PENDING DEPARTMENTS'}
                            </span>
                          </td>
                          <td className="p-2.5">
                            <button
                              onClick={() => {
                                const certNum = 'CERT-' + Math.floor(100000 + Math.random() * 900000);
                                const updated = graduationCandidates.map(g => g.id === gc.id ? { ...g, certificateIssued: true, certificateNumber: certNum } : g);
                                onUpdateGraduationCandidates(updated);
                              }}
                              className={`px-2 py-1 text-[9px] font-bold border ${gc.certificateIssued ? 'bg-emerald-50 text-emerald-800' : 'bg-white text-zinc-900 hover:bg-zinc-100'}`}
                            >
                              {gc.certificateIssued ? `ISSUED (${gc.certificateNumber})` : 'Issue Degree Cert'}
                            </button>
                          </td>
                          <td className="p-2.5">
                            <span className="text-zinc-600">ISSUED (OK)</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ==================== 16. USERS & ROLES ==================== */}
        {adminTab === 'users' && (
          <div className="space-y-4 uppercase text-xs font-bold">
            <h3 className="text-base font-black text-zinc-900 border-b-2 border-zinc-100 pb-2 tracking-wide">
              System Access Accounts & Roles assignment
            </h3>

            <div className="border-2 border-zinc-900 overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-zinc-100 border-b-2 border-zinc-900 font-bold text-[10px] tracking-widest text-zinc-500">
                  <tr>
                    <th className="p-2.5">Profile User</th>
                    <th className="p-2.5">System Email</th>
                    <th className="p-2.5">Role Assignment</th>
                    <th className="p-2.5">Account status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 bg-white font-bold text-xs text-zinc-900">
                  {paged(users).map(u => (
                    <tr key={u.id} className="hover:bg-zinc-50">
                      <td className="p-2.5 text-zinc-900 font-black">{u.fullName}</td>
                      <td className="p-2.5 lowercase font-mono font-medium text-zinc-500">{u.email}</td>
                      <td className="p-2.5">
                        <span className="text-[10px] bg-zinc-900 text-white font-black px-2 py-0.5 rounded-none uppercase font-mono">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-2.5">
                        <span className={`text-[10px] border px-2 py-0.5 uppercase ${
                          u.status === 'active' ? 'bg-emerald-50 text-emerald-800 border-emerald-900' : 'bg-rose-50 text-rose-800 border-rose-900'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {tableRowCount[adminTab] > 0 && !selectedStudentId && (
          <div className="mt-4 flex items-center justify-between border-t-2 border-zinc-900 pt-3 text-[10px] font-black uppercase tracking-wider">
            <span>Page {tablePage} of {Math.max(1, Math.ceil(tableRowCount[adminTab] / tablePageSize))} &bull; {tableRowCount[adminTab]} records</span>
            <div className="flex gap-2">
              <button type="button" disabled={tablePage === 1} onClick={() => setTablePage(page => Math.max(1, page - 1))} className="border border-zinc-900 bg-white px-3 py-1 disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
              <button type="button" disabled={tablePage >= Math.ceil(tableRowCount[adminTab] / tablePageSize)} onClick={() => setTablePage(page => page + 1)} className="border border-zinc-900 bg-zinc-900 px-3 py-1 text-white disabled:cursor-not-allowed disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </motion.div>

    </div>
  );
}
