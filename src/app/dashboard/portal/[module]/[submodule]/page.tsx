'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import PortalPage from '@/components/portal/PortalPage';

const portalConfigs: Record<string, Record<string, any>> = {
  home: {
    password: { title: 'Change Password', type: 'form', formFields: [{ label: 'Current Password', placeholder: '••••••••', type: 'password' }, { label: 'New Password', placeholder: '••••••••', type: 'password' }, { label: 'Confirm New Password', placeholder: '••••••••', type: 'password' }], actionLabel: 'Update Password' },
    profile: { title: 'My Profile', type: 'table', columns: ['Field', 'Value'], data: [{ field: 'Name', value: 'John Doe' }, { field: 'Reg No', value: 'C01/1234/2023' }, { field: 'Programme', value: 'Diploma in Clinical Medicine' }, { field: 'Year', value: '2023' }, { field: 'Status', value: 'Active' }] },
    id: { title: 'Student ID', type: 'info', subtitle: 'Digital Student Identification Card' },
    'inter-faculty': { title: 'Inter Faculty Transfer', type: 'form', formFields: [{ label: 'Current Faculty', placeholder: 'Medicine' }, { label: 'Target Faculty', placeholder: 'Nursing' }, { label: 'Reason', placeholder: 'Type reason here...' }], actionLabel: 'Apply for Transfer' },
    clearance: { title: 'Clearance Status', type: 'table', columns: ['Department', 'Status', 'Remarks'], data: [{ department: 'Library', status: 'Cleared', remarks: 'No pending books' }, { department: 'Finance', status: 'Pending', remarks: 'Semester 2 balance' }, { department: 'Hostel', status: 'Cleared', remarks: 'Room 402 returned' }] },
    refund: { title: 'Caution Refund', type: 'form', formFields: [{ label: 'Bank Name', placeholder: 'KCB' }, { label: 'Account No', placeholder: '1234567890' }, { label: 'Branch', placeholder: 'Nairobi' }], actionLabel: 'Request Refund' },
    tracking: { title: 'Academic Tracking', type: 'table', columns: ['Semester', 'GPA', 'Status'], data: [{ semester: 'Year 1 Sem 1', gpa: '3.8', status: 'Pass' }, { semester: 'Year 1 Sem 2', gpa: '3.6', status: 'Pass' }] },
  },
  fees: {
    statement: { title: 'Fee Statement', type: 'table', columns: ['Date', 'Description', 'Ref', 'Amount', 'Balance'], data: [{ date: '2026-01-10', description: 'Tuition Fee', ref: 'INV-001', amount: '45,000', balance: '45,000' }, { date: '2026-02-15', description: 'Payment', ref: 'REC-042', amount: '-45,000', balance: '0' }] },
    structure: { title: 'Fee Structure', type: 'table', columns: ['Item', 'Year 1', 'Year 2', 'Year 3'], data: [{ item: 'Tuition', year_1: '90,000', year_2: '90,000', year_3: '90,000' }, { item: 'Lab Fees', year_1: '10,000', year_2: '10,000', year_3: '10,000' }] },
    options: { title: 'Payment Options', type: 'info', subtitle: 'M-PESA, Bank Transfer, and Portal Payment' },
    aid: { title: 'Financial Aid', type: 'table', columns: ['Sponsor', 'Amount', 'Status'], data: [{ sponsor: 'HELB', amount: '30,000', status: 'Disbursed' }] },
  },
  timetables: {
    semester: { title: 'Semester Timetable', type: 'table', columns: ['Day', 'Time', 'Unit', 'Venue'], data: [{ day: 'Monday', time: '08:00 - 11:00', unit: 'Anatomy I', venue: 'Lecture Hall A' }, { day: 'Wednesday', time: '14:00 - 17:00', unit: 'Biochemistry', venue: 'Lab 2' }] },
    exams: { title: 'Exam Timetable', type: 'table', columns: ['Date', 'Time', 'Unit', 'Venue'], data: [{ date: '2026-05-10', time: '09:00', unit: 'Anatomy Final', venue: 'Great Hall' }] },
    rooms: { title: 'Room Allocation', type: 'table', columns: ['Unit', 'Room', 'Capacity'], data: [{ unit: 'General Surgery', room: 'Room 102', capacity: '50' }] },
  },
  registration: {
    units: { title: 'Unit Registration', type: 'table', columns: ['Unit Code', 'Unit Name', 'Credits', 'Action'], data: [{ unit_code: 'MED101', unit_name: 'Intro to Medicine', credits: '3', action: 'Register' }] },
    status: { title: 'Registration Status', type: 'info', subtitle: 'Semester 2 Registration: COMPLETED' },
    catalog: { title: 'Unit Catalog', type: 'table', columns: ['Code', 'Name', 'Department'], data: [{ code: 'MED201', name: 'Pathology', department: 'Medicine' }] },
  },
  evaluation: {
    lecturer: { title: 'Lecturer Evaluation', type: 'form', formFields: [{ label: 'Lecturer Name', placeholder: 'Dr. Smith' }, { label: 'Rating (1-5)', placeholder: '5' }, { label: 'Comments', placeholder: 'Excellent teaching...' }], actionLabel: 'Submit Evaluation' },
    unit: { title: 'Unit Evaluation', type: 'form', formFields: [{ label: 'Unit Name', placeholder: 'Anatomy' }, { label: 'Difficulty', placeholder: 'Hard' }, { label: 'Feedback', placeholder: 'Need more lab time' }], actionLabel: 'Submit Feedback' },
  },
  results: {
    provisional: { title: 'Provisional Results', type: 'table', columns: ['Unit', 'Grade', 'Points'], data: [{ unit: 'Anatomy', grade: 'A', points: '12' }, { unit: 'Physiology', grade: 'B+', points: '10' }] },
    transcript: { title: 'Transcript Request', type: 'form', formFields: [{ label: 'Reason', placeholder: 'Job Application' }, { label: 'Format', placeholder: 'Digital PDF' }], actionLabel: 'Request Transcript' },
    graduation: { title: 'Graduation Status', type: 'info', subtitle: 'Status: ON TRACK (Expected Dec 2026)' },
  },
  enquiries: {
    contact: { title: 'Contact Registry', type: 'form', formFields: [{ label: 'Subject', placeholder: 'Missing Marks' }, { label: 'Message', placeholder: 'I cannot see my results for...' }], actionLabel: 'Send Message' },
    ticket: { title: 'Support Ticket', type: 'table', columns: ['Ticket ID', 'Subject', 'Status'], data: [{ ticket_id: 'T-1001', subject: 'Portal Login', status: 'Closed' }] },
    faqs: { title: 'FAQs', type: 'info', subtitle: 'Frequently Asked Questions' },
  },
  booking: {
    hostel: { title: 'Hostel Booking', type: 'form', formFields: [{ label: 'Hostel Name', placeholder: 'Hall 4' }, { label: 'Room Type', placeholder: 'Double' }], actionLabel: 'Book Room' },
    library: { title: 'Library Seat', type: 'form', formFields: [{ label: 'Section', placeholder: 'Quiet Zone' }, { label: 'Time Slot', placeholder: '10:00 - 12:00' }], actionLabel: 'Reserve Seat' },
    study: { title: 'Study Room', type: 'form', formFields: [{ label: 'Room No', placeholder: 'SR-01' }, { label: 'Duration', placeholder: '2 Hours' }], actionLabel: 'Book Study Room' },
  }
};

export default function PortalModulePage() {
  const params = useParams();
  const moduleName = params.module as string;
  const submodule = params.submodule as string;

  const config = portalConfigs[moduleName]?.[submodule];

  if (!config) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-bold text-gray-400">Module Configuration Not Found</h2>
        <p className="text-sm text-gray-500 mt-2">The requested module path /dashboard/portal/{moduleName}/{submodule} is not configured yet.</p>
      </div>
    );
  }

  return (
    <PortalPage 
      title={config.title}
      subtitle={config.subtitle}
      type={config.type}
      data={config.data}
      columns={config.columns}
      formFields={config.formFields}
      actionLabel={config.actionLabel}
    />
  );
}
