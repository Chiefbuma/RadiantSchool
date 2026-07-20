/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, 
  Application, 
  Program, 
  Module, 
  Cohort, 
  Class, 
  Student, 
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
} from './types';
import AdminPortal from './AdminPortal';
import StudentPortal from './StudentPortal';
import StudentRegisterModal from './StudentRegisterModal';
import { ShieldCheck, ShieldAlert, Users, Sparkles, Award } from 'lucide-react';
import { useNotifications } from './notifications';

type SchoolPortalAppProps = {
  initialRole: 'admin' | 'student';
  currentUserEmail: string;
};

export default function SchoolPortalApp({ initialRole, currentUserEmail }: SchoolPortalAppProps) {
  const { toast } = useNotifications();
  // Roles Management
  const [role, setRole] = useState<'admin' | 'student'>(initialRole);
  const [loggedInStudentId, setLoggedInStudentId] = useState<string>('RHTI/CNA/2026/0001');

  // Register Modal States
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [registerApplication, setRegisterApplication] = useState<Application | null>(null);

  // Database Tables State
  const [applications, setApplications] = useState<Application[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [timetable, setTimetable] = useState<TimetableEvent[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [marks, setMarks] = useState<StudentMark[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [requests, setRequests] = useState<StudentRequest[]>([]);
  const [attachments, setAttachments] = useState<AttachmentPlacement[]>([]);
  const [clearances, setClearances] = useState<ClearanceStatus[]>([]);
  const [graduationBatches, setGraduationBatches] = useState<GraduationBatch[]>([]);
  const [graduationCandidates, setGraduationCandidates] = useState<GraduationCandidate[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  const canSwitchRoles = initialRole === 'admin';

  const loadSnapshot = useCallback(async () => {
    const response = await fetch('/api/portal/snapshot', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Portal data request failed (${response.status})`);
    const data = await response.json();
    setApplications(data.applications ?? []); setStudents(data.students ?? []); setPrograms(data.programs ?? []);
    setModules(data.modules ?? []); setCohorts(data.cohorts ?? []); setClasses(data.classes ?? []);
    setResources(data.resources ?? []); setTimetable(data.timetable ?? []); setExams(data.exams ?? []);
    setMarks(data.marks ?? []); setInvoices(data.invoices ?? []); setPayments(data.payments ?? []);
    setRequests(data.requests ?? []); setAttachments(data.attachments ?? []); setClearances(data.clearances ?? []);
    setGraduationBatches(data.graduationBatches ?? []); setGraduationCandidates(data.graduationCandidates ?? []);
    setUsers(data.users ?? []); setLogs(data.logs ?? []);
    const matchingStudent = (data.students ?? []).find((student: Student) => student.email.toLowerCase() === currentUserEmail.toLowerCase());
    if (matchingStudent) setLoggedInStudentId(matchingStudent.id);
  }, [currentUserEmail]);

  useEffect(() => { loadSnapshot().catch((error) => toast('Unable to load portal data', { tone: 'error', message: error.message })); }, [loadSnapshot, toast]);

  // Handle register student (triggers via StudentRegisterModal)
  const handleRegisterStudent = async (studentData: Omit<Student, 'id' | 'userId' | 'created_at'>) => {
    const response = await fetch('/api/portal/registrations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...studentData, applicationId: registerApplication ? Number(registerApplication.id) : undefined, programId: Number(studentData.programId), cohortId: Number(studentData.cohortId), classId: Number(studentData.classId) }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? 'Registration failed');
    setRegisterApplication(null); setRegisterModalOpen(false);
    await loadSnapshot();
    toast('Student record registered', { tone: 'success', message: `Admission ${result.studentNumber}. Secure invitation created for 48 hours.` });
  };

  const openOnboardModal = (app: Application | null) => {
    setRegisterApplication(app);
    setRegisterModalOpen(true);
  };

  const requestJson = useCallback(async (url: string, init: RequestInit) => {
    const response = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) } });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error ?? `Operation failed (${response.status})`);
    return result;
  }, []);

  const syncCollection = useCallback(<T extends { id: string }>(entity: string, current: T[], next: T[], setLocal: React.Dispatch<React.SetStateAction<T[]>>) => {
    const added = next.filter(row => !current.some(existing => existing.id === row.id));
    const removed = current.filter(row => !next.some(existing => existing.id === row.id));
    const changed = next.filter(row => current.some(existing => existing.id === row.id && JSON.stringify(existing) !== JSON.stringify(row)));
    setLocal(next);
    void (async () => {
      try {
        for (const row of added) await requestJson(`/api/portal/entities/${entity}`, { method: 'POST', body: JSON.stringify(row) });
        for (const row of removed) await requestJson(`/api/portal/entities/${entity}/${encodeURIComponent(row.id)}`, { method: 'DELETE' });
        if (changed.length) throw new Error('Editing this record requires its dedicated lifecycle action.');
        await loadSnapshot();
        toast('Database updated', { tone: 'success' });
      } catch (error) {
        await loadSnapshot().catch(() => undefined);
        toast('Database update failed', { tone: 'error', message: error instanceof Error ? error.message : 'The change was rejected.' });
      }
    })();
  }, [loadSnapshot, requestJson, toast]);

  const updateApplications = useCallback((next: Application[]) => {
    const changed = next.find(row => applications.some(existing => existing.id === row.id && existing.status !== row.status));
    setApplications(next);
    if (!changed) { void loadSnapshot(); return; }
    const previous = applications.find(row => row.id === changed.id)!;
    void (async () => { try {
      if (previous.status === 'new' && changed.status !== 'under_review') await requestJson(`/api/portal/applications/${changed.id}/status`, { method: 'POST', body: JSON.stringify({ status: 'under_review', reason: 'Admissions review opened from workbench.' }) });
      await requestJson(`/api/portal/applications/${changed.id}/status`, { method: 'POST', body: JSON.stringify({ status: changed.status, reason: changed.reviewNotes || `Application ${changed.status} by admissions.` }) });
      await loadSnapshot(); toast(`Application ${changed.status}`, { tone: changed.status === 'rejected' ? 'warning' : 'success' });
    } catch (error) { await loadSnapshot(); toast('Application update failed', { tone: 'error', message: error instanceof Error ? error.message : 'Transition rejected.' }); } })();
  }, [applications, loadSnapshot, requestJson, toast]);

  const updateStudents = useCallback((next: Student[]) => {
    const changed=next.find(row=>students.some(old=>old.id===row.id&&JSON.stringify(old)!==JSON.stringify(row)));
    const removed=students.find(row=>!next.some(current=>current.id===row.id));setStudents(next);
    void (async()=>{try{if(changed)await requestJson(`/api/portal/students/${encodeURIComponent(changed.id)}`,{method:'PATCH',body:JSON.stringify(changed)});if(removed)await requestJson(`/api/portal/students/${encodeURIComponent(removed.id)}`,{method:'DELETE'});await loadSnapshot();}catch(error){await loadSnapshot();toast('Student update rejected',{tone:'error',message:error instanceof Error?error.message:'Operation failed'});}})();
  },[students,requestJson,loadSnapshot,toast]);

  return (
    <div className="school-portal-root min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans antialiased">
      
      {/* High-end System Header bar */}
      <header className="flex shrink-0 select-none flex-col items-stretch justify-between gap-4 border-b-4 border-zinc-900 bg-zinc-900 px-3 py-4 text-white sm:px-6 lg:flex-row lg:items-center">
        
        <div className="flex items-center gap-3 sm:gap-4">
          <a href="/" aria-label="Radiant Hospital Training Institute public website" className="shrink-0 border border-white/15 bg-white p-1">
            <img src="/logo/rhti-logo.png" alt="Radiant Hospital Training Institute" className="h-12 w-auto object-contain sm:h-14" />
          </a>
          <div>
            <h1 className="text-2xl font-black uppercase leading-none tracking-wide text-white sm:text-3xl">
              Radiant Hospital Training Institute
            </h1>
            <p className="pt-0.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400 sm:text-xs">
              Integrated Campus Management System &bull; Radiant Group of Hospitals
            </p>
          </div>
        </div>

        {/* Global Role Switcher Workspace */}
        <div className="flex flex-wrap items-center gap-3">
          
          {canSwitchRoles && <div className="flex items-center bg-zinc-800 border-2 border-zinc-700 rounded-none p-1">
            <button
              onClick={() => setRole('admin')}
              className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider transition cursor-pointer ${
                role === 'admin' 
                  ? 'bg-yellow-400 text-zinc-900 font-bold' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Staff Portal
            </button>
            <button
              onClick={() => setRole('student')}
              className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider transition cursor-pointer ${
                role === 'student' 
                  ? 'bg-yellow-400 text-zinc-900 font-bold' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Student Portal
            </button>
          </div>}

          {/* Student Selector Dropdown for simulation */}
          {role === 'student' && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-400 font-black uppercase">Active Login:</span>
              <select
                value={loggedInStudentId}
                onChange={(e) => setLoggedInStudentId(e.target.value)}
                className="bg-zinc-800 border-2 border-zinc-700 text-white font-bold text-xs p-1 cursor-pointer focus:outline-none uppercase"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.fullName} ({s.id.split('/').pop()})</option>
                ))}
              </select>
            </div>
          )}

        </div>

      </header>

      {/* Main Workspace Body */}
      <main className={`mx-auto w-full flex-1 space-y-6 ${initialRole === 'admin' ? 'max-w-[1680px] px-3 py-4 sm:px-5 lg:px-6' : 'max-w-7xl p-3 sm:p-6'}`}>
        
        {/* Portal Headers */}
        <div className="flex flex-col items-start justify-between gap-2 border-b-2 border-zinc-900 pb-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-zinc-900">
              {role === 'admin' ? 'Administrative Staff Hub' : 'Admitted Student Dashboard'}
            </h2>
            {role === 'admin' && <p className="text-xs text-zinc-500 font-bold uppercase">Reviewing admissions, financial ledgers, clinical rotations, exams, and signoff clearances.</p>}
          </div>
          <div className="text-right font-mono text-[10px] text-zinc-400 font-bold uppercase">
            <span>Server Timestamp: Nairobi, KE &bull; </span>
            <span className="text-primary font-black">FALL 2026 TERM</span>
          </div>
        </div>

        {/* Render active portal */}
        {role === 'admin' ? (
          <AdminPortal
            applications={applications}
            students={students}
            onboarding={clearances}
            programs={programs}
            modules={modules}
            cohorts={cohorts}
            classes={classes}
            resources={resources}
            timetable={timetable}
            exams={exams}
            marks={marks}
            invoices={invoices}
            payments={payments}
            requests={requests}
            attachments={attachments}
            clearances={clearances}
            graduationBatches={graduationBatches}
            graduationCandidates={graduationCandidates}
            users={users}
            logs={logs}

            onUpdateApplications={updateApplications}
            onUpdateStudents={updateStudents}
            onUpdateInvoices={setInvoices}
            onUpdatePayments={setPayments}
            onUpdateRequests={(next) => { const changed=next.find(row=>requests.some(old=>old.id===row.id&&old.status!==row.status)); setRequests(next); if(!changed)return void loadSnapshot(); void requestJson(`/api/portal/requests/${changed.id}`,{method:'PATCH',body:JSON.stringify({status:changed.status,notes:changed.adminComments})}).then(loadSnapshot).catch(error=>{void loadSnapshot();toast('Request update rejected',{tone:'error',message:error.message});}); }}
            onUpdateAttachments={(next) => { const added=next.find(row=>!attachments.some(old=>old.id===row.id)); if(!added)return void loadSnapshot(); const student=students.find(s=>s.id===added.studentId); void requestJson('/api/portal/entities/attachments',{method:'POST',body:JSON.stringify({...added,studentId:student?.databaseId})}).then(loadSnapshot).catch(error=>toast('Placement rejected',{tone:'error',message:error.message})); }}
            onUpdateClearances={(next) => { const changed=next.find(row=>clearances.some(old=>old.studentId===row.studentId&&JSON.stringify(old.checkpoints)!==JSON.stringify(row.checkpoints))); setClearances(next); if(!changed)return void loadSnapshot(); const old=clearances.find(row=>row.studentId===changed.studentId)!; const key=(Object.keys(changed.checkpoints) as Array<keyof typeof changed.checkpoints>).find(name=>old.checkpoints[name]!==changed.checkpoints[name]); const clearanceId=key?changed.checkpointIds?.[key]:undefined; if(!clearanceId)return void loadSnapshot(); const approved=changed.checkpoints[key!]; void requestJson('/api/portal/clearance/decisions',{method:'POST',body:JSON.stringify({clearanceId,decision:approved?'approved':'revoked',reason:`${approved?'Approved':'Revoked'} from departmental clearance workspace.`})}).then(loadSnapshot).catch(error=>{void loadSnapshot();toast('Clearance decision rejected',{tone:'error',message:error.message});}); }}
            onUpdateGraduationCandidates={(next) => { const added=next.find(row=>!graduationCandidates.some(old=>old.id===row.id)); const changed=next.find(row=>graduationCandidates.some(old=>old.id===row.id&&!old.certificateIssued&&row.certificateIssued)); const target=added??changed; if(!target)return void loadSnapshot(); const student=students.find(s=>s.id===target.studentId); const url=added?'/api/portal/graduation/candidates':'/api/portal/graduation/credentials'; void requestJson(url,{method:'POST',body:JSON.stringify({studentId:student?.databaseId,batchId:target.batchId})}).then(loadSnapshot).catch(error=>{void loadSnapshot();toast(added?'Candidate rejected':'Credential issuance rejected',{tone:'error',message:error.message});}); }}
            onUpdateGraduationBatches={(next) => syncCollection('graduation-batches', graduationBatches, next, setGraduationBatches)}
            onUpdateExams={(next) => syncCollection('exams', exams, next, setExams)}
            onUpdateMarks={(next) => { const added=next.find(row=>!marks.some(old=>old.id===row.id)); if(!added)return void loadSnapshot(); const student=students.find(s=>s.id===added.studentId); void requestJson('/api/portal/marks',{method:'POST',body:JSON.stringify({assessmentId:added.examId,studentId:student?.databaseId,score:added.marksObtained})}).then(loadSnapshot).catch(error=>toast('Mark rejected',{tone:'error',message:error.message})); }}
            onUpdateTimetable={(next) => syncCollection('timetable', timetable, next, setTimetable)}
            onUpdateResources={(next) => syncCollection('resources', resources, next, setResources)}
            onUpdateClasses={(next) => syncCollection('classes', classes, next, setClasses)}
            onUpdateCohorts={(next) => syncCollection('cohorts', cohorts, next, setCohorts)}
            onUpdateModules={(next) => syncCollection('modules', modules, next, setModules)}
            onUpdatePrograms={(next) => syncCollection('programs', programs, next, setPrograms)}
            onUpdateUsers={setUsers}

            onOpenRegisterModal={openOnboardModal}
          />
        ) : (
          <StudentPortal
            students={students}
            loggedInStudentId={loggedInStudentId}
            programs={programs}
            cohorts={cohorts}
            classes={classes}
            modules={modules}
            timetable={timetable}
            resources={resources}
            invoices={invoices}
            payments={payments}
            requests={requests}
            attachments={attachments}
            clearances={clearances}
            graduationBatches={graduationBatches}
            graduationCandidates={graduationCandidates}
            marks={marks}
            exams={exams}

            onAddPayment={(paymentData) => {
              void requestJson('/api/portal/payment-claims', { method: 'POST', body: JSON.stringify({ invoiceId: paymentData.invoiceId, amountKes: paymentData.amount, method: paymentData.paymentMethod, reference: paymentData.transactionReference }) })
                .then(() => { void loadSnapshot(); toast('Payment evidence submitted', { tone: 'success', message: 'Finance must verify the transaction before a receipt or clearance is issued.' }); })
                .catch(error => toast('Payment claim rejected', { tone: 'error', message: error.message }));
            }}
            onAddRequest={(requestData) => {
              void requestJson('/api/portal/entities/requests',{method:'POST',body:JSON.stringify(requestData)})
                .then(()=>{void loadSnapshot();toast('Request submitted',{tone:'success',message:'Your petition has been filed with the Academic Registrar.'});})
                .catch(error=>toast('Request rejected',{tone:'error',message:error.message}));
            }}
            onLogAttachmentHour={(placementId) => {
              const today=new Date().toISOString().slice(0,10);
              void requestJson('/api/portal/attachments/logbooks',{method:'POST',body:JSON.stringify({placementId,entryDate:today,startedAt:'08:00',endedAt:'09:00',activities:'Clinical placement activity recorded by student.',studentNotes:'Submitted through student portal.'})})
                .then(()=>{void loadSnapshot();toast('Logbook entry submitted',{tone:'success'});})
                .catch(error=>toast('Logbook entry rejected',{tone:'error',message:error.message}));
            }}
          />
        )}

      </main>

      {/* Registrar Register Onboarding modal */}
      {registerModalOpen && (
        <StudentRegisterModal
          application={registerApplication}
          programs={programs}
          cohorts={cohorts}
          classes={classes}
          onClose={() => {
            setRegisterApplication(null);
            setRegisterModalOpen(false);
          }}
          onRegister={handleRegisterStudent}
        />
      )}

      {/* Global high-contrast Footer */}
      <footer className="bg-white border-t-4 border-zinc-900 py-4 px-6 text-center select-none shrink-0 font-bold text-[10px] text-zinc-500 uppercase">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-none bg-emerald-500 border border-zinc-900"></div>
            <span>Postgres Schema & Sync fully aligned with RHTI general ledger</span>
          </div>
          <div>
            RADIANT HOSPITAL TRAINING INSTITUTE (RHTI) &bull; ALL RIGHTS RESERVED &bull; FALL 2026
          </div>
        </div>
      </footer>

    </div>
  );
}
