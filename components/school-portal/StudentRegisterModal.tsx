/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Application, Program, Cohort, Class, Student } from './types';
import { X, UserPlus, Info } from 'lucide-react';
import { useNotifications } from './notifications';

interface StudentRegisterModalProps {
  application?: Application | null;
  programs: Program[];
  cohorts: Cohort[];
  classes: Class[];
  onClose: () => void;
  onRegister: (studentData: Omit<Student, 'id' | 'userId' | 'created_at'>) => Promise<void> | void;
}

export default function StudentRegisterModal({
  application,
  programs,
  cohorts,
  classes,
  onClose,
  onRegister
}: StudentRegisterModalProps) {
  const { toast } = useNotifications();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  
  const [nationalId, setNationalId] = useState('');
  const [residence, setResidence] = useState('');
  const [nextOfKinName, setNextOfKinName] = useState('');
  const [nextOfKinPhone, setNextOfKinPhone] = useState('');
  const [nextOfKinRelationship, setNextOfKinRelationship] = useState('Parent');

  const [programId, setProgramId] = useState('');
  const [cohortId, setCohortId] = useState('');
  const [classId, setClassId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill from application if present
  useEffect(() => {
    if (application) {
      setFullName(application.fullName);
      setEmail(application.email);
      setPhone(application.phone);
      setDateOfBirth(application.dateOfBirth);
      setProgramId(application.preferredProgramId);
    } else {
      if (programs.length > 0) setProgramId(programs[0].id);
    }
  }, [application, programs]);

  // Handle program changes to filter/select matching cohorts
  const filteredCohorts = cohorts.filter(c => c.programId === programId);
  useEffect(() => {
    if (filteredCohorts.length > 0) {
      setCohortId(filteredCohorts[0].id);
    } else {
      setCohortId('');
    }
  }, [programId]);

  // Handle cohort changes to filter/select matching classes
  const filteredClasses = classes.filter(c => c.cohortId === cohortId);
  useEffect(() => {
    if (filteredClasses.length > 0) {
      setClassId(filteredClasses[0].id);
    } else {
      setClassId('');
    }
  }, [cohortId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!programId || !cohortId || !classId) {
      toast('Academic allocation required', { tone: 'warning', message: 'Select a program, cohort, and class before registering the student.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await onRegister({
      fullName,
      email,
      phone,
      dateOfBirth,
      nationalId,
      residence,
      nextOfKinName,
      nextOfKinPhone,
      nextOfKinRelationship,
      status: 'active',
      holds: [],
      programId,
      cohortId,
      classId
      });
    } catch (error) {
      toast('Registration failed', { tone: 'error', message: error instanceof Error ? error.message : 'The registration could not be completed.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProgram = programs.find(p => p.id === programId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 p-3 backdrop-blur-xs animate-fade-in sm:p-5">
      <div className="flex max-h-[94dvh] w-full max-w-5xl flex-col overflow-hidden border-4 border-zinc-900 bg-white shadow-2xl">
        
        {/* Modal Header */}
        <div className="bg-zinc-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="text-yellow-400" size={24} />
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight">Student Portal Registration</h3>
              <p className="text-[10px] text-zinc-300 font-bold uppercase">
                {application ? `Converting Accepted Applicant: ${application.fullName}` : 'Onboard New Academic Student'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 bg-zinc-800 border-2 border-zinc-700 hover:border-yellow-400 text-zinc-400 hover:text-white rounded-none transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="portal-inline-form min-h-0 flex-1 space-y-5 overflow-y-auto p-4 uppercase text-xs font-bold text-zinc-900 sm:p-6">
          
          <div className="bg-amber-50 p-4 border-2 border-zinc-900 rounded-none space-y-1">
            <div className="flex gap-2 items-start">
              <Info size={16} className="text-zinc-900 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs font-black text-zinc-900 uppercase tracking-wider block">Operational Procedure Guard</span>
                <p className="text-[10px] text-zinc-600 leading-normal lowercase normal-case">
                  Registration registers a new record in <b>portal_students</b>, provisions a linked login <b>portal_users</b> credential, sets the <b>student role</b>, assigns program and cohort, and generates a term tuition invoice.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Left Column: Personal details */}
            <div className="space-y-3">
              <h4 className="text-zinc-500 font-black tracking-widest text-[10px] border-b-2 border-zinc-100 pb-1">I. Student Identity</h4>
              
              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-400 block tracking-widest">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-1.5 border-2 border-zinc-900 rounded-none bg-white text-zinc-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-400 block tracking-widest">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-2 py-1 border-2 border-zinc-900 rounded-none bg-white text-zinc-900 focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-400 block tracking-widest">National ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 38902145"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    className="w-full px-2 py-1.5 border-2 border-zinc-900 rounded-none bg-white text-zinc-900 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-400 block tracking-widest">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-2 py-1.5 border-2 border-zinc-900 rounded-none bg-white text-zinc-900 focus:outline-none lowercase font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-400 block tracking-widest">Phone *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-2 py-1.5 border-2 border-zinc-900 rounded-none bg-white text-zinc-900 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-400 block tracking-widest">Residential Town/Area *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ruiru Town / Kahawa Sukari"
                  value={residence}
                  onChange={(e) => setResidence(e.target.value)}
                  className="w-full px-3 py-1.5 border-2 border-zinc-900 rounded-none bg-white text-zinc-900 focus:outline-none"
                />
              </div>

              <h4 className="text-zinc-500 font-black tracking-widest text-[10px] border-b-2 border-zinc-100 pb-1 pt-2">II. Next of Kin Details</h4>
              
              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-400 block tracking-widest">NOK Full Name *</label>
                <input
                  type="text"
                  required
                  value={nextOfKinName}
                  onChange={(e) => setNextOfKinName(e.target.value)}
                  className="w-full px-3 py-1.5 border-2 border-zinc-900 rounded-none bg-white text-zinc-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-400 block tracking-widest">NOK Relationship *</label>
                  <select
                    value={nextOfKinRelationship}
                    onChange={(e) => setNextOfKinRelationship(e.target.value)}
                    className="w-full p-1.5 border-2 border-zinc-900 rounded-none bg-white text-zinc-900 focus:outline-none cursor-pointer"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Sibling">Sibling</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-400 block tracking-widest">NOK Telephone *</label>
                  <input
                    type="text"
                    required
                    value={nextOfKinPhone}
                    onChange={(e) => setNextOfKinPhone(e.target.value)}
                    className="w-full px-2 py-1.5 border-2 border-zinc-900 rounded-none bg-white text-zinc-900 focus:outline-none font-mono"
                  />
                </div>
              </div>

            </div>

            {/* Right Column: Academic lifecycle placements */}
            <div className="space-y-3 bg-zinc-50 p-4 border-2 border-zinc-900 rounded-none h-fit">
              <h4 className="text-zinc-500 font-black tracking-widest text-[10px] border-b-2 border-zinc-900/10 pb-1">III. Lifecycle Allocation</h4>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-500 block tracking-widest">1. Program Selection *</label>
                <select
                  required
                  value={programId}
                  onChange={(e) => setProgramId(e.target.value)}
                  className="w-full p-2 border-2 border-zinc-900 rounded-none bg-white text-zinc-900 focus:outline-none cursor-pointer"
                >
                  <option value="">-- Choose Program --</option>
                  {programs.map(p => (
                    <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                  ))}
                </select>
              </div>

              {selectedProgram && (
                <div className="p-2.5 bg-white border-2 border-zinc-900 border-dashed text-[10px] text-zinc-500 space-y-1 lowercase normal-case">
                  <div className="flex justify-between uppercase font-black text-[9px] text-zinc-800">
                    <span>Program Policy</span>
                    <span className="text-blue-600">Active</span>
                  </div>
                  <div><span className="font-bold">Required KCSE:</span> {selectedProgram.entryRequirement}</div>
                  <div><span className="font-bold">Tuition Cost:</span> KES {selectedProgram.tuitionFee.toLocaleString()}</div>
                  <div><span className="font-bold">Duration:</span> {selectedProgram.durationMonths} Months</div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-500 block tracking-widest">2. Cohort Association *</label>
                <select
                  required
                  disabled={!programId}
                  value={cohortId}
                  onChange={(e) => setCohortId(e.target.value)}
                  className="w-full p-2 border-2 border-zinc-900 rounded-none bg-white text-zinc-900 focus:outline-none cursor-pointer disabled:bg-zinc-200"
                >
                  <option value="">-- Choose Cohort --</option>
                  {filteredCohorts.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.intakeTerm})</option>
                  ))}
                </select>
                {!programId && <span className="text-[9px] text-zinc-400 font-bold lowercase">Choose program first</span>}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-500 block tracking-widest">3. Class / Trainer Assignment *</label>
                <select
                  required
                  disabled={!cohortId}
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full p-2 border-2 border-zinc-900 rounded-none bg-white text-zinc-900 focus:outline-none cursor-pointer disabled:bg-zinc-200"
                >
                  <option value="">-- Choose Class & Trainer --</option>
                  {filteredClasses.map(cl => (
                    <option key={cl.id} value={cl.id}>{cl.name} (By {cl.lecturerName})</option>
                  ))}
                </select>
                {!cohortId && <span className="text-[9px] text-zinc-400 font-bold lowercase">Choose cohort first</span>}
              </div>

              {selectedProgram && (
                <div className="pt-3 border-t-2 border-zinc-900/10 space-y-2">
                  <span className="text-[10px] font-black text-zinc-400 tracking-wider block">IV. AUTOMATED LEDGER ENTRIES</span>
                  <div className="flex justify-between items-center bg-white p-2 border border-zinc-900 text-[10px] font-mono">
                    <span className="text-zinc-500 font-sans">TUITION INVOICE:</span>
                    <span className="text-emerald-700 font-black">KES {selectedProgram.tuitionFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-2 border border-zinc-900 text-[10px] font-mono">
                    <span className="text-zinc-500 font-sans">LOGIN USERNAME:</span>
                    <span className="text-zinc-800 font-black lowercase">{email || 'username@rhti...'}</span>
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t-4 border-zinc-900">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border-2 border-zinc-900 bg-white hover:bg-zinc-100 transition cursor-pointer text-xs font-black uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !programId || !cohortId || !classId}
              className="px-5 py-2 border-2 border-zinc-900 bg-zinc-900 hover:bg-yellow-400 hover:text-zinc-900 text-white transition cursor-pointer text-xs font-black uppercase tracking-wider disabled:bg-zinc-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating Student Record…' : 'Confirm & Create Student Record'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
