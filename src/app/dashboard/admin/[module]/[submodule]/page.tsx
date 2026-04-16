'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import AdminPortalPage, { AdminFormField } from '@/components/portal/AdminPortalPage';

const adminConfigs: Record<string, Record<string, any>> = {
  system: {
    institutions: {
      title: 'Institutions',
      subtitle: 'Manage higher education entities',
      columns: ['Name', 'Code', 'Type', 'Status'],
      initialData: [
        { name: 'Radiant Hospital Training Institute', code: 'RHTI', type: 'Private', status: 'Active' }
      ],
      formFields: [
        { label: 'Name', key: 'name', type: 'text', placeholder: 'Enter institution name' },
        { label: 'Code', key: 'code', type: 'text', placeholder: 'e.g. RHTI' },
        { label: 'Type', key: 'type', type: 'select', options: ['Public', 'Private', 'Faith-Based'] },
        { label: 'Status', key: 'status', type: 'radio', options: ['Active', 'Inactive'] },
      ]
    },
    campuses: {
      title: 'Campuses',
      subtitle: 'Manage institution physical locations',
      columns: ['Name', 'Institution', 'Location', 'Status'],
      initialData: [
        { name: 'Kasarani Main', institution: 'RHTI', location: 'Nairobi', status: 'Active' }
      ],
      formFields: [
        { label: 'Name', key: 'name', type: 'text' },
        { label: 'Institution', key: 'institution', type: 'select', options: ['RHTI'] },
        { label: 'Location', key: 'location', type: 'text' },
        { label: 'Status', key: 'status', type: 'radio', options: ['Active', 'Inactive'] },
      ]
    },
    departments: {
      title: 'Departments',
      subtitle: 'Academic and administrative departments',
      columns: ['Name', 'Campus', 'Head', 'Status'],
      initialData: [
        { name: 'Nursing', campus: 'Kasarani Main', head: 'Dr. Jane Doe', status: 'Active' },
        { name: 'Health Records', campus: 'Kasarani Main', head: 'Mr. John Smith', status: 'Active' }
      ],
      formFields: [
        { label: 'Name', key: 'name', type: 'text' },
        { label: 'Campus', key: 'campus', type: 'select', options: ['Kasarani Main'] },
        { label: 'Head of Department', key: 'head', type: 'text' },
        { label: 'Status', key: 'status', type: 'radio', options: ['Active', 'Inactive'] },
      ]
    },
    staff: {
      title: 'Staff Management',
      subtitle: 'Academic and non-academic staff records',
      columns: ['Name', 'Staff ID', 'Department', 'Role'],
      initialData: [
        { name: 'Dr. Jane Doe', staff_id: 'S001', department: 'Nursing', role: 'Dean' }
      ],
      formFields: [
        { label: 'Full Name', key: 'name', type: 'text' },
        { label: 'Staff ID', key: 'staff_id', type: 'text' },
        { label: 'Department', key: 'department', type: 'select', options: ['Nursing', 'Health Records', 'Finance'] },
        { label: 'Role', key: 'role', type: 'select', options: ['Dean', 'Lecturer', 'Registrar', 'Admin'] },
      ]
    }
  },
  academic: {
    years: {
      title: 'Academic Years',
      subtitle: 'Define academic calendars',
      columns: ['Year', 'Start Date', 'End Date', 'Status'],
      initialData: [{ year: '2023/2024', start_date: '2023-09-01', end_date: '2024-08-31', status: 'Active' }],
      formFields: [
        { label: 'Year Name', key: 'year', type: 'text', placeholder: 'e.g. 2023/2024' },
        { label: 'Start Date', key: 'start_date', type: 'date' },
        { label: 'End Date', key: 'end_date', type: 'date' },
        { label: 'Status', key: 'status', type: 'radio', options: ['Active', 'Closed'] },
      ]
    },
    semesters: {
      title: 'Semesters',
      subtitle: 'Manage semester periods',
      columns: ['Name', 'Academic Year', 'Start', 'End'],
      initialData: [{ name: 'Semester 1', year: '2023/2024', start: '2023-09-01', end: '2023-12-20' }],
      formFields: [
        { label: 'Semester Name', key: 'name', type: 'text' },
        { label: 'Academic Year', key: 'year', type: 'select', options: ['2023/2024'] },
        { label: 'Start Date', key: 'start', type: 'date' },
        { label: 'End Date', key: 'end', type: 'date' },
      ]
    },
    programmes: {
      title: 'Programmes',
      subtitle: 'Academic courses and degrees',
      columns: ['Name', 'Code', 'Duration', 'Department'],
      initialData: [
        { name: 'Diploma in Nursing', code: 'DNS', duration: '3 Years', department: 'Nursing' },
        { name: 'Cert in Health Records', code: 'CHR', duration: '18 Months', department: 'Health Records' }
      ],
      formFields: [
        { label: 'Programme Name', key: 'name', type: 'text' },
        { label: 'Code', key: 'code', type: 'text' },
        { label: 'Duration', key: 'duration', type: 'text' },
        { label: 'Department', key: 'department', type: 'select', options: ['Nursing', 'Health Records'] },
      ]
    }
  },
  registry: {
    students: {
      title: 'Students',
      subtitle: 'Student information system',
      columns: ['Name', 'Reg No', 'Programme', 'Status'],
      initialData: [
        { name: 'Alice Wambui', reg_no: 'C01/001/2023', programme: 'Nursing', status: 'Active' },
        { name: 'Bob Otieno', reg_no: 'C02/001/2023', programme: 'Health Records', status: 'Active' }
      ],
      formFields: [
        { label: 'Full Name', key: 'name', type: 'text' },
        { label: 'Registration No', key: 'reg_no', type: 'text' },
        { label: 'Programme', key: 'programme', type: 'select', options: ['Nursing', 'Health Records'] },
        { label: 'Status', key: 'status', type: 'radio', options: ['Active', 'Suspended', 'Completed'] },
      ]
    },
    applications: {
      title: 'Applications',
      subtitle: 'Manage new student admissions',
      columns: ['Applicant', 'Programme', 'Date', 'Status'],
      initialData: [
        { applicant: 'Charlie Maina', programme: 'Nursing', date: '2026-03-15', status: 'Pending' }
      ],
      formFields: [
        { label: 'Applicant Name', key: 'applicant', type: 'text' },
        { label: 'Programme', key: 'programme', type: 'select', options: ['Nursing', 'Health Records'] },
        { label: 'Application Date', key: 'date', type: 'date' },
        { label: 'Status', key: 'status', type: 'select', options: ['Pending', 'Approved', 'Rejected'] },
      ]
    }
  },
  learning: {
    classes: {
      title: 'Class Groups',
      subtitle: 'Manage student class groupings',
      columns: ['Name', 'Programme', 'Semester', 'Capacity'],
      initialData: [{ name: 'Nursing 2023 A', programme: 'Nursing', semester: 'Sem 2', capacity: '50' }],
      formFields: [
        { label: 'Class Name', key: 'name', type: 'text' },
        { label: 'Programme', key: 'programme', type: 'select', options: ['Nursing', 'Health Records'] },
        { label: 'Semester', key: 'semester', type: 'select', options: ['Sem 1', 'Sem 2'] },
        { label: 'Capacity', key: 'capacity', type: 'number' },
      ]
    },
    rooms: {
      title: 'Rooms',
      subtitle: 'Manage physical learning spaces',
      columns: ['Name', 'Type', 'Capacity', 'Status'],
      initialData: [{ name: 'Lecture Hall 1', type: 'Lecture Hall', capacity: '100', status: 'Available' }],
      formFields: [
        { label: 'Room Name', key: 'name', type: 'text' },
        { label: 'Type', key: 'type', type: 'select', options: ['Lecture Hall', 'Lab', 'Seminar Room'] },
        { label: 'Capacity', key: 'capacity', type: 'number' },
        { label: 'Status', key: 'status', type: 'radio', options: ['Available', 'Occupied', 'Maintenance'] },
      ]
    }
  },
  exams: {
    list: {
      title: 'Exams',
      subtitle: 'Manage examination schedules',
      columns: ['Course', 'Date', 'Type', 'Status'],
      initialData: [{ course: 'Anatomy I', date: '2026-05-15', type: 'Main', status: 'Scheduled' }],
      formFields: [
        { label: 'Course', key: 'course', type: 'select', options: ['Anatomy I', 'Physiology', 'Biochemistry'] },
        { label: 'Exam Date', key: 'date', type: 'date' },
        { label: 'Type', key: 'type', type: 'select', options: ['Main', 'Supplementary', 'Special'] },
        { label: 'Status', key: 'status', type: 'radio', options: ['Scheduled', 'Ongoing', 'Completed'] },
      ]
    }
  },
  finance: {
    fees: {
      title: 'Fee Structures',
      subtitle: 'Manage billable items per programme',
      columns: ['Programme', 'Year', 'Total Amount', 'Status'],
      initialData: [
        { programme: 'Nursing', year: 'Year 1', amount: '120,000', status: 'Active' }
      ],
      formFields: [
        { label: 'Programme', key: 'programme', type: 'select', options: ['Nursing', 'Health Records'] },
        { label: 'Year', key: 'year', type: 'select', options: ['Year 1', 'Year 2', 'Year 3'] },
        { label: 'Total Amount', key: 'amount', type: 'number' },
        { label: 'Status', key: 'status', type: 'radio', options: ['Active', 'Inactive'] },
      ]
    }
  }
};

export default function AdminModulePage() {
  const params = useParams();
  const moduleName = params.module as string;
  const submodule = params.submodule as string;

  const config = adminConfigs[moduleName]?.[submodule];

  if (!config) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-bold text-gray-400">Module Configuration Not Found</h2>
        <p className="text-sm text-gray-500 mt-2">The requested module path /dashboard/admin/{moduleName}/{submodule} is not configured yet.</p>
      </div>
    );
  }

  return (
    <AdminPortalPage 
      title={config.title}
      subtitle={config.subtitle}
      columns={config.columns}
      initialData={config.initialData}
      formFields={config.formFields}
    />
  );
}
