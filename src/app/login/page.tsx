'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '@/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { HeartPulse } from 'lucide-react';
import PortalPage from '@/components/portal/PortalPage';

export default function LoginPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = React.useState('Home');
  const [activeSubTab, setActiveSubTab] = React.useState('Change Password');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Bypass login for testing
    toast.success("Login successful (Bypass enabled)");
    router.push('/dashboard');
  };

  const tabs = [
    'Home', 'Fees', 'Timetables', 'Course Registration', 'Course Evaluation', 'Results', 'Enquiries', 'Book Room', 'Logout'
  ];

  const subNavMap: Record<string, string[]> = {
    'Home': ['Change Password', 'My profile', 'Student ID', 'Inter Faculty', 'Clearance Status', 'Caution Refund', 'Academic Tracking'],
    'Fees': ['Fee Statement', 'Fee Structure', 'Payment Options', 'Financial Aid'],
    'Timetables': ['Semester Timetable', 'Exam Timetable', 'Room Allocation'],
    'Course Registration': ['Unit Registration', 'Registration Status', 'Unit Catalog'],
    'Course Evaluation': ['Lecturer Evaluation', 'Unit Evaluation'],
    'Results': ['Provisional Results', 'Transcript Request', 'Graduation Status'],
    'Enquiries': ['Contact Registry', 'Support Ticket', 'FAQs'],
    'Book Room': ['Hostel Booking', 'Library Seat', 'Study Room'],
    'Logout': []
  };

  const currentSubNav = subNavMap[activeTab] || [];

  // Update sub-tab when primary tab changes
  React.useEffect(() => {
    if (subNavMap[activeTab] && subNavMap[activeTab].length > 0) {
      setActiveSubTab(subNavMap[activeTab][0]);
    }
  }, [activeTab]);

  const renderPortalContent = () => {
    if (activeTab === 'Home' && activeSubTab === 'Change Password') {
      return (
        <>
          <div className="mb-8">
            <h2 className="text-sm sm:text-lg font-bold text-ink-tech mb-2 leading-tight">
              Application For Temporary (Deferment)/Permanent Withdrawal From And Readmission to Academic Programme
            </h2>
            <a href="#" className="text-primary-ocean font-bold text-[10px] sm:text-sm underline block">Permanent -Temporary Withdrawal Form.</a>
          </div>

          <form onSubmit={handleLogin} className="max-w-4xl border border-gray-300 bg-white p-4 sm:p-8 shadow-sm">
            <div className="border-b border-gray-800 pb-2 mb-6">
              <p className="text-[10px] sm:text-sm font-bold italic text-gray-700">Log on using the Registration Number to access {activeTab} services. The year of registration must be in full eg ../2009</p>
            </div>

            <div className="space-y-6 max-w-2xl">
              <div className="flex flex-col md:grid md:grid-cols-3 md:items-center gap-2 md:gap-4">
                <label className="text-xs sm:text-sm font-bold text-gray-700">Registration Number:</label>
                <input 
                  type="text" 
                  placeholder="e.g. C01/1234/2023"
                  className="border border-gray-400 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-ocean md:col-span-1" 
                />
                <span className="text-[10px] sm:text-sm italic text-gray-600 font-medium">Type your Student Registration Number</span>
              </div>

              <div className="flex flex-col md:grid md:grid-cols-3 md:items-start gap-2 md:gap-4">
                <label className="text-xs sm:text-sm font-bold text-gray-700">Password:</label>
                <div className="md:col-span-1">
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="border border-gray-400 p-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-primary-ocean" 
                  />
                </div>
                <span className="text-[10px] sm:text-sm italic text-gray-600 font-medium leading-tight">Use your National ID / Passport No. or KCSE Index No. or Application Reference No. as your initial password</span>
              </div>

              <div className="flex flex-col md:grid md:grid-cols-3 gap-4">
                <div className="md:col-start-2 flex flex-col sm:flex-row gap-2">
                  <Button 
                    type="submit"
                    className="bg-gray-100 border border-gray-400 text-ink-tech hover:bg-gray-200 rounded-none px-8 py-2 h-auto text-xs sm:text-sm font-bold shadow-sm w-full md:w-auto"
                  >
                    Login
                  </Button>
                  <Button 
                    type="button"
                    onClick={() => {
                      toast.success("Admin Login successful (Bypass enabled)");
                      router.push('/dashboard/admin/registry/students');
                    }}
                    className="bg-ink-tech text-white hover:bg-ink-tech/90 rounded-none px-8 py-2 h-auto text-xs sm:text-sm font-bold shadow-sm w-full md:w-auto"
                  >
                    Admin Login
                  </Button>
                </div>
              </div>

              <div className="pt-4">
                <a href="#" className="text-primary-ocean font-bold text-xs sm:text-sm underline">Forgot your password?</a>
              </div>
            </div>
          </form>

          <div className="mt-8 space-y-2">
            <p className="text-xs sm:text-sm font-bold text-gray-800">Note: Digits and Letters in your Registration Number.</p>
            <ul className="space-y-1 text-xs sm:text-sm font-bold text-gray-700 ml-4 sm:ml-8">
              <li className="flex items-center gap-2">
                <span className="text-gray-400">»</span> Digit 0 (Zero) and NOT letter O in C01/..
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gray-400">»</span> Letter I and NOT Digit 1 (One) in I20/..
              </li>
            </ul>
          </div>

          <div className="mt-8">
            <fieldset className="border border-gray-400 p-4 sm:p-6 relative">
              <legend className="px-2 text-sm sm:text-base font-bold text-primary-ocean uppercase tracking-tight">
                SMIS Allocated Registration No
              </legend>
              <div className="space-y-4">
                <h4 className="text-xs sm:text-sm font-bold text-gray-800">New Students</h4>
                <p className="text-[10px] sm:text-xs text-gray-800 font-bold leading-relaxed">
                  Enter Application Ref. No as it appear in your Letter of Offer to get your allocated Student Registration No
                </p>
                
                <div className="flex flex-col md:flex-row md:items-center gap-2 max-w-3xl">
                  <label className="text-[10px] sm:text-xs font-bold text-gray-800 whitespace-nowrap">
                    Application Ref. No:
                  </label>
                  <div className="flex flex-1 gap-2">
                    <input 
                      type="text" 
                      className="flex-1 border border-gray-400 p-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary-ocean bg-white min-w-[200px]" 
                    />
                    <button 
                      className="bg-gray-100 border border-gray-400 text-ink-tech hover:bg-gray-200 px-4 py-1 text-[10px] sm:text-xs font-bold shadow-sm whitespace-nowrap"
                    >
                      Get Allocated Registration No
                    </button>
                  </div>
                </div>
              </div>
            </fieldset>
          </div>
        </>
      );
    }

    // Map sub-tabs to PortalPage content
    switch (activeSubTab) {
      case 'My profile':
        return <PortalPage title="My Profile" type="table" columns={['Field', 'Value']} data={[{field: 'Name', value: 'John Doe'}, {field: 'Reg No', value: 'C01/1234/2023'}, {field: 'Programme', value: 'Diploma in Clinical Medicine'}, {field: 'Year', value: '2023'}, {field: 'Status', value: 'Active'}]} />;
      case 'Student ID':
        return <PortalPage title="Student ID" type="info" subtitle="Digital Student Identification Card" />;
      case 'Inter Faculty':
        return <PortalPage title="Inter Faculty Transfer" type="form" formFields={[{label: 'Current Faculty', placeholder: 'Medicine'}, {label: 'Target Faculty', placeholder: 'Nursing'}, {label: 'Reason', placeholder: 'Type reason here...'}]} actionLabel="Apply for Transfer" />;
      case 'Clearance Status':
        return <PortalPage title="Clearance Status" type="table" columns={['Department', 'Status', 'Remarks']} data={[{department: 'Library', status: 'Cleared', remarks: 'No pending books'}, {department: 'Finance', status: 'Pending', remarks: 'Semester 2 balance'}, {department: 'Hostel', status: 'Cleared', remarks: 'Room 402 returned'}]} />;
      case 'Caution Refund':
        return <PortalPage title="Caution Refund" type="form" formFields={[{label: 'Bank Name', placeholder: 'KCB'}, {label: 'Account No', placeholder: '1234567890'}, {label: 'Branch', placeholder: 'Nairobi'}]} actionLabel="Request Refund" />;
      case 'Academic Tracking':
        return <PortalPage title="Academic Tracking" type="table" columns={['Semester', 'GPA', 'Status']} data={[{semester: 'Year 1 Sem 1', gpa: '3.8', status: 'Pass'}, {semester: 'Year 1 Sem 2', gpa: '3.6', status: 'Pass'}]} />;
      
      case 'Fee Statement':
        return <PortalPage title="Fee Statement" type="table" columns={['Date', 'Description', 'Ref', 'Amount', 'Balance']} data={[{date: '2026-01-10', description: 'Tuition Fee', ref: 'INV-001', amount: '45,000', balance: '45,000'}, {date: '2026-02-15', description: 'Payment', ref: 'REC-042', amount: '-45,000', balance: '0'}]} />;
      case 'Fee Structure':
        return <PortalPage title="Fee Structure" type="table" columns={['Item', 'Year 1', 'Year 2', 'Year 3']} data={[{item: 'Tuition', year_1: '90,000', year_2: '90,000', year_3: '90,000'}, {item: 'Lab Fees', year_1: '10,000', year_2: '10,000', year_3: '10,000'}]} />;
      case 'Payment Options':
        return <PortalPage title="Payment Options" type="info" subtitle="M-PESA, Bank Transfer, and Portal Payment" />;
      case 'Financial Aid':
        return <PortalPage title="Financial Aid" type="table" columns={['Sponsor', 'Amount', 'Status']} data={[{sponsor: 'HELB', amount: '30,000', status: 'Disbursed'}]} />;

      case 'Semester Timetable':
        return <PortalPage title="Semester Timetable" type="table" columns={['Day', 'Time', 'Unit', 'Venue']} data={[{day: 'Monday', time: '08:00 - 11:00', unit: 'Anatomy I', venue: 'Lecture Hall A'}, {day: 'Wednesday', time: '14:00 - 17:00', unit: 'Biochemistry', venue: 'Lab 2'}]} />;
      case 'Exam Timetable':
        return <PortalPage title="Exam Timetable" type="table" columns={['Date', 'Time', 'Unit', 'Venue']} data={[{date: '2026-05-10', time: '09:00', unit: 'Anatomy Final', venue: 'Great Hall'}]} />;
      case 'Room Allocation':
        return <PortalPage title="Room Allocation" type="table" columns={['Unit', 'Room', 'Capacity']} data={[{unit: 'General Surgery', room: 'Room 102', capacity: '50'}]} />;

      case 'Unit Registration':
        return <PortalPage title="Unit Registration" type="table" columns={['Unit Code', 'Unit Name', 'Credits', 'Action']} data={[{unit_code: 'MED101', unit_name: 'Intro to Medicine', credits: '3', action: 'Register'}]} />;
      case 'Registration Status':
        return <PortalPage title="Registration Status" type="info" subtitle="Semester 2 Registration: COMPLETED" />;
      case 'Unit Catalog':
        return <PortalPage title="Unit Catalog" type="table" columns={['Code', 'Name', 'Department']} data={[{code: 'MED201', name: 'Pathology', department: 'Medicine'}]} />;

      case 'Lecturer Evaluation':
        return <PortalPage title="Lecturer Evaluation" type="form" formFields={[{label: 'Lecturer Name', placeholder: 'Dr. Smith'}, {label: 'Rating (1-5)', placeholder: '5'}, {label: 'Comments', placeholder: 'Excellent teaching...'}]} actionLabel="Submit Evaluation" />;
      case 'Unit Evaluation':
        return <PortalPage title="Unit Evaluation" type="form" formFields={[{label: 'Unit Name', placeholder: 'Anatomy'}, {label: 'Difficulty', placeholder: 'Hard'}, {label: 'Feedback', placeholder: 'Need more lab time'}]} actionLabel="Submit Feedback" />;

      case 'Provisional Results':
        return <PortalPage title="Provisional Results" type="table" columns={['Unit', 'Grade', 'Points']} data={[{unit: 'Anatomy', grade: 'A', points: '12'}, {unit: 'Physiology', grade: 'B+', points: '10'}]} />;
      case 'Transcript Request':
        return <PortalPage title="Transcript Request" type="form" formFields={[{label: 'Reason', placeholder: 'Job Application'}, {label: 'Format', placeholder: 'Digital PDF'}]} actionLabel="Request Transcript" />;
      case 'Graduation Status':
        return <PortalPage title="Graduation Status" type="info" subtitle="Status: ON TRACK (Expected Dec 2026)" />;

      case 'Contact Registry':
        return <PortalPage title="Contact Registry" type="form" formFields={[{label: 'Subject', placeholder: 'Missing Marks'}, {label: 'Message', placeholder: 'I cannot see my results for...'}]} actionLabel="Send Message" />;
      case 'Support Ticket':
        return <PortalPage title="Support Ticket" type="table" columns={['Ticket ID', 'Subject', 'Status']} data={[{ticket_id: 'T-1001', subject: 'Portal Login', status: 'Closed'}]} />;
      case 'FAQs':
        return <PortalPage title="FAQs" type="info" subtitle="Frequently Asked Questions" />;

      case 'Hostel Booking':
        return <PortalPage title="Hostel Booking" type="form" formFields={[{label: 'Hostel Name', placeholder: 'Hall 4'}, {label: 'Room Type', placeholder: 'Double'}]} actionLabel="Book Room" />;
      case 'Library Seat':
        return <PortalPage title="Library Seat" type="form" formFields={[{label: 'Section', placeholder: 'Quiet Zone'}, {label: 'Time Slot', placeholder: '10:00 - 12:00'}]} actionLabel="Reserve Seat" />;
      case 'Study Room':
        return <PortalPage title="Study Room" type="form" formFields={[{label: 'Room No', placeholder: 'SR-01'}, {label: 'Duration', placeholder: '2 Hours'}]} actionLabel="Book Study Room" />;

      default:
        return <PortalPage title={activeSubTab} type="info" />;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Academic Header */}
      <header className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-ocean flex items-center justify-center text-white shrink-0 shadow-sm">
          <HeartPulse className="w-10 h-10 sm:w-12 sm:h-12" />
        </div>
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-ink-tech uppercase tracking-tight">Radiant Hospital Training Institute</h1>
          <p className="text-xs sm:text-sm text-gray-500 italic mt-1 font-medium">"Enhancing Paramount Care-Team"</p>
        </div>
      </header>

      {/* Primary Navigation Tabs - Real Academic Tabs */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap sm:flex-nowrap sm:overflow-x-auto no-scrollbar items-end gap-px bg-gray-200 border-x border-t border-gray-300">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 sm:px-6 py-2.5 font-bold text-[10px] sm:text-sm whitespace-nowrap flex-1 text-center sm:flex-none transition-all border-r border-white/10 last:border-r-0 ${
                activeTab === tab 
                  ? 'bg-white text-primary-ocean border-t-2 border-t-primary-ocean -mb-[1px] relative z-10' 
                  : 'bg-gray-500 text-white hover:bg-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Secondary Sub-Navigation Bar - Responsive Sub-Menu */}
      <div className="bg-white border-b border-gray-300 shadow-sm">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-3 flex flex-wrap sm:flex-nowrap sm:overflow-x-auto no-scrollbar items-center gap-x-6 sm:gap-x-10 gap-y-2">
          {currentSubNav.map((item) => (
            <button 
              key={item} 
              onClick={() => setActiveSubTab(item)}
              className={`text-[10px] sm:text-xs font-bold flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors group ${
                activeSubTab === item ? 'text-primary-ocean' : 'text-gray-600 hover:text-primary-ocean'
              }`}
            >
              <div className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full transition-colors ${
                activeSubTab === item ? 'bg-primary-ocean' : 'bg-primary-ocean/30 group-hover:bg-primary-ocean'
              }`}></div>
              {item}
            </button>
          ))}
          {currentSubNav.length === 0 && (
            <div className="text-[10px] sm:text-xs font-bold text-gray-400 italic py-0.5">
              No additional options for this section
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-8 flex-1">
        <div className="bg-[#F8FAFC] border border-line-tech p-4 sm:p-8 min-h-[500px] shadow-sm">
          {renderPortalContent()}

          {/* Bottom Links */}
          <div className="mt-12 pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 text-[10px] sm:text-xs font-bold text-primary-ocean">
              <a href="#" className="underline">About Us</a>
              <span>•</span>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-1 text-[10px] sm:text-xs font-bold text-gray-600">
              <a href="#" className="text-primary-ocean underline">Data Privacy</a>
              <span>&copy; 2026</span>
              <a href="#" className="text-primary-ocean underline">Radiant Hospital Training Institute</a>
              <span>. Design: by</span>
              <a href="#" className="text-primary-ocean underline">ICT Centre</a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Note */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 border-t border-line-tech">
        <p className="text-[9px] sm:text-[11px] text-gray-500 font-bold uppercase tracking-widest">
          Note: All actions within this portal are logged and monitored. 
          Radiant Hospital Training Institute &copy; 2026
        </p>
        <Button variant="link" className="p-0 h-auto text-[10px] sm:text-xs mt-4" onClick={() => router.push('/')}>
          Back to Website
        </Button>
      </footer>
    </div>
  );
}
