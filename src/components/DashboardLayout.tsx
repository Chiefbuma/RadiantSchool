import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  GraduationCap, 
  CreditCard, 
  Calendar, 
  ClipboardList, 
  Settings, 
  LogOut,
  Bell,
  Search,
  Menu,
  HeartPulse
} from 'lucide-react';
import { useAuth } from './FirebaseProvider';
import { auth } from '../firebase';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/dashboard', roles: ['admin', 'registrar', 'dean', 'finance', 'lecturer', 'student'] },
  
  // Admin/Staff Specific - Corrected Paths
  { icon: Users, label: 'Students', path: '/dashboard/admin/registry/students', roles: ['admin', 'registrar', 'dean', 'lecturer'] },
  { icon: BookOpen, label: 'Programmes', path: '/dashboard/admin/academic/programmes', roles: ['admin', 'registrar', 'dean'] },
  { icon: GraduationCap, label: 'Applications', path: '/dashboard/admin/registry/applications', roles: ['admin', 'registrar'] },
  { icon: CreditCard, label: 'Finance', path: '/dashboard/admin/finance/fees', roles: ['admin', 'registrar', 'finance'] },
  { icon: ClipboardList, label: 'Exams', path: '/dashboard/admin/exams/list', roles: ['admin', 'registrar', 'dean'] },
  { icon: Calendar, label: 'Learning', path: '/dashboard/admin/learning/classes', roles: ['admin', 'registrar', 'lecturer'] },
  
  { icon: Settings, label: 'Settings', path: '/dashboard/settings', roles: ['admin', 'registrar', 'dean', 'finance', 'lecturer', 'student'] },
];

import { Outlet } from 'react-router-dom';

export default function DashboardLayout() {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(profile?.role || '')
  );

  // Map our routes to the UoN style tabs
  const studentTabs = [
    { 
      label: 'Home', 
      path: '/dashboard/portal/home/password',
      subTabs: [
        { label: 'Change Password', path: '/dashboard/portal/home/password' },
        { label: 'My profile', path: '/dashboard/portal/home/profile' },
        { label: 'Student ID', path: '/dashboard/portal/home/id' },
        { label: 'Inter Faculty', path: '/dashboard/portal/home/inter-faculty' },
        { label: 'Clearance Status', path: '/dashboard/portal/home/clearance' },
        { label: 'Caution Refund', path: '/dashboard/portal/home/refund' },
        { label: 'Academic Tracking', path: '/dashboard/portal/home/tracking' },
      ]
    },
    { 
      label: 'Fees', 
      path: '/dashboard/portal/fees/statement',
      subTabs: [
        { label: 'Fee Statement', path: '/dashboard/portal/fees/statement' },
        { label: 'Fee Structure', path: '/dashboard/portal/fees/structure' },
        { label: 'Payment Options', path: '/dashboard/portal/fees/options' },
        { label: 'Financial Aid', path: '/dashboard/portal/fees/aid' },
      ]
    },
    { 
      label: 'Timetables', 
      path: '/dashboard/portal/timetables/semester',
      subTabs: [
        { label: 'Semester Timetable', path: '/dashboard/portal/timetables/semester' },
        { label: 'Exam Timetable', path: '/dashboard/portal/timetables/exams' },
        { label: 'Room Allocation', path: '/dashboard/portal/timetables/rooms' },
      ]
    },
    { 
      label: 'Course Registration', 
      path: '/dashboard/portal/registration/units',
      subTabs: [
        { label: 'Unit Registration', path: '/dashboard/portal/registration/units' },
        { label: 'Registration Status', path: '/dashboard/portal/registration/status' },
        { label: 'Unit Catalog', path: '/dashboard/portal/registration/catalog' },
      ]
    },
    { 
      label: 'Course Evaluation', 
      path: '/dashboard/portal/evaluation/lecturer',
      subTabs: [
        { label: 'Lecturer Evaluation', path: '/dashboard/portal/evaluation/lecturer' },
        { label: 'Unit Evaluation', path: '/dashboard/portal/evaluation/unit' },
      ]
    },
    { 
      label: 'Results', 
      path: '/dashboard/portal/results/provisional',
      subTabs: [
        { label: 'Provisional Results', path: '/dashboard/portal/results/provisional' },
        { label: 'Transcript Request', path: '/dashboard/portal/results/transcript' },
        { label: 'Graduation Status', path: '/dashboard/portal/results/graduation' },
      ]
    },
    { 
      label: 'Enquiries', 
      path: '/dashboard/portal/enquiries/contact',
      subTabs: [
        { label: 'Contact Registry', path: '/dashboard/portal/enquiries/contact' },
        { label: 'Support Ticket', path: '/dashboard/portal/enquiries/ticket' },
        { label: 'FAQs', path: '/dashboard/portal/enquiries/faqs' },
      ]
    },
    { 
      label: 'Book Room', 
      path: '/dashboard/portal/booking/hostel',
      subTabs: [
        { label: 'Hostel Booking', path: '/dashboard/portal/booking/hostel' },
        { label: 'Library Seat', path: '/dashboard/portal/booking/library' },
        { label: 'Study Room', path: '/dashboard/portal/booking/study' },
      ]
    },
    { label: 'Logout', onClick: signOut, subTabs: [] },
  ];

  const isAdmin = profile?.role === 'admin' || profile?.role === 'registrar' || profile?.role === 'finance' || profile?.role === 'dean';
  const isStudent = profile?.role === 'student';

  const adminTabs = [
    { 
      label: 'System', 
      path: '/dashboard/admin/system/institutions',
      subTabs: [
        { label: 'Institutions', path: '/dashboard/admin/system/institutions' },
        { label: 'Campuses', path: '/dashboard/admin/system/campuses' },
        { label: 'Departments', path: '/dashboard/admin/system/departments' },
        { label: 'Staff', path: '/dashboard/admin/system/staff' },
        { label: 'Roles', path: '/dashboard/admin/system/roles' },
        { label: 'Permissions', path: '/dashboard/admin/system/permissions' },
      ]
    },
    { 
      label: 'Academic', 
      path: '/dashboard/admin/academic/years',
      subTabs: [
        { label: 'Academic Years', path: '/dashboard/admin/academic/years' },
        { label: 'Semesters', path: '/dashboard/admin/academic/semesters' },
        { label: 'Programmes', path: '/dashboard/admin/academic/programmes' },
        { label: 'Intakes', path: '/dashboard/admin/academic/intakes' },
        { label: 'Curriculum', path: '/dashboard/admin/academic/curriculum' },
        { label: 'Courses', path: '/dashboard/admin/academic/courses' },
      ]
    },
    { 
      label: 'Registry', 
      path: '/dashboard/admin/registry/applications',
      subTabs: [
        { label: 'Applications', path: '/dashboard/admin/registry/applications' },
        { label: 'Students', path: '/dashboard/admin/registry/students' },
        { label: 'Enrollments', path: '/dashboard/admin/registry/enrollments' },
        { label: 'Guardians', path: '/dashboard/admin/registry/guardians' },
        { label: 'Documents', path: '/dashboard/admin/registry/documents' },
        { label: 'Clinical Sites', path: '/dashboard/admin/registry/clinical-sites' },
        { label: 'Clinical Rotations', path: '/dashboard/admin/registry/clinical-rotations' },
        { label: 'Student Rotations', path: '/dashboard/admin/registry/student-rotations' },
      ]
    },
    { 
      label: 'Learning', 
      path: '/dashboard/admin/learning/classes',
      subTabs: [
        { label: 'Class Groups', path: '/dashboard/admin/learning/classes' },
        { label: 'Rooms', path: '/dashboard/admin/learning/rooms' },
        { label: 'Sessions', path: '/dashboard/admin/learning/sessions' },
        { label: 'Attendance', path: '/dashboard/admin/learning/attendance' },
        { label: 'Assignments', path: '/dashboard/admin/learning/assignments' },
      ]
    },
    { 
      label: 'Exams', 
      path: '/dashboard/admin/exams/list',
      subTabs: [
        { label: 'Exams', path: '/dashboard/admin/exams/list' },
        { label: 'Results', path: '/dashboard/admin/exams/results' },
        { label: 'Grading', path: '/dashboard/admin/exams/grading' },
      ]
    },
    { 
      label: 'Finance', 
      path: '/dashboard/admin/finance/fees',
      subTabs: [
        { label: 'Fee Structures', path: '/dashboard/admin/finance/fees' },
        { label: 'Invoices', path: '/dashboard/admin/finance/invoices' },
        { label: 'Payments', path: '/dashboard/admin/finance/payments' },
      ]
    },
    { label: 'Logout', onClick: signOut, subTabs: [] },
  ];

  const portalTabs = isStudent ? studentTabs : adminTabs;

  // Find active tab to show its sub-tabs
  const activeTab = portalTabs.find(tab => 
    location.pathname === tab.path || 
    (tab.path && tab.path !== '/dashboard' && tab.path !== '#' && location.pathname.startsWith(tab.path.split('/').slice(0, 4).join('/')))
  ) || portalTabs[0];

  if (isStudent || isAdmin) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Academic Header */}
        <header className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-ocean flex items-center justify-center text-white shrink-0 shadow-sm">
            <HeartPulse className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-ink-tech uppercase tracking-tight">
              {isAdmin ? 'RHTI Administrative Portal' : 'Radiant Hospital Training Institute'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 italic mt-1 font-medium">
              {isAdmin ? 'Management & Registry Services' : '"Enhancing Paramount Care-Team"'}
            </p>
          </div>
        </header>

        {/* Primary Navigation Tabs - Real Academic Tabs */}
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-end gap-px bg-gray-200 border-x border-t border-gray-300">
            {portalTabs.map((tab) => {
              const isActive = activeTab.label === tab.label;
              if (tab.onClick) {
                return (
                  <button
                    key={tab.label}
                    onClick={tab.onClick}
                    className="px-3 sm:px-6 py-2.5 bg-gray-500 text-white font-bold text-[10px] sm:text-sm hover:bg-gray-600 transition-colors whitespace-nowrap flex-1 sm:flex-none text-center border-r border-white/10 last:border-r-0"
                  >
                    {tab.label}
                  </button>
                );
              }
              return (
                <Link
                  key={tab.label}
                  to={tab.path || '#'}
                  className={`px-3 sm:px-6 py-2.5 font-bold text-[10px] sm:text-sm transition-all whitespace-nowrap flex-1 sm:flex-none text-center border-r border-white/10 last:border-r-0 ${
                    isActive 
                      ? 'bg-white text-primary-ocean border-t-2 border-t-primary-ocean -mb-[1px] relative z-10' 
                      : 'bg-gray-500 text-white hover:bg-gray-600'
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Secondary Sub-Navigation Bar - Responsive Sub-Menu */}
        <div className="bg-white border-b border-gray-300 shadow-sm">
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-x-6 sm:gap-x-10 gap-y-2">
            {activeTab.subTabs.map((item) => (
              <Link 
                key={item.label} 
                to={item.path}
                className="text-[10px] sm:text-xs font-bold text-gray-600 hover:text-primary-ocean flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors group"
              >
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-primary-ocean/30 group-hover:bg-primary-ocean transition-colors"></div>
                {item.label}
              </Link>
            ))}
            {activeTab.subTabs.length === 0 && (
              <div className="text-[10px] sm:text-xs font-bold text-gray-400 italic py-0.5">
                No additional options for this section
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-8 flex-1">
          <div className="bg-[#F8FAFC] border border-line-tech p-4 sm:p-8 min-h-[500px] shadow-sm">
            <Outlet />

            {/* Bottom Links */}
            <div className="mt-12 pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4 text-[10px] sm:text-xs font-bold text-primary-ocean">
                <a href="#" className="underline">About Us</a>
                <span>•</span>
              </div>
              <div className="flex flex-wrap justify-center items-center gap-1 text-[10px] sm:text-xs font-bold text-gray-600">
                <a href="#" className="text-primary-ocean underline">Data Privacy</a>
                <span>© 2026</span>
                <a href="#" className="text-primary-ocean underline">Radiant Hospital Training Institute</a>
                <span>. Design: by</span>
                <a href="#" className="text-primary-ocean underline">ICT Centre</a>
              </div>
            </div>
          </div>
        </main>

        {/* Footer Note */}
        <footer className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 border-t border-line-tech">
          <p className="text-[9px] sm:text-[11px] text-gray-500 font-bold uppercase tracking-widest">
            Note: All administrative actions are logged and monitored. 
            Radiant Hospital Training Institute &copy; 2026
          </p>
          <Button variant="link" className="p-0 h-auto text-[10px] sm:text-xs mt-4" onClick={() => window.location.href = '/'}>
            Back to Website
          </Button>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-bg-tech overflow-hidden font-sans">
      {/* Sidebar - Technical Rail */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-ink-tech text-bg-tech transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full border-r border-white/10">
          <div className="p-8 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-none border border-white/20 flex items-center justify-center">
                <HeartPulse className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-serif italic text-xl leading-none">RHTI</h2>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] opacity-40 mt-1">Radiant Hospital</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-6">
            <div className="px-4 space-y-1">
              {filteredNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 group relative ${
                      isActive 
                        ? 'bg-white text-ink-tech' 
                        : 'text-white/50 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-ink-tech"></div>}
                    <item.icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-ink-tech' : 'opacity-50'}`} />
                    <span className="font-mono text-[10px] uppercase tracking-widest font-bold">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="p-4 border-t border-white/10">
            <div className="bg-white/5 p-4 rounded-none border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-8 w-8 rounded-none border border-white/20">
                  <AvatarImage src={user?.photoURL || ''} />
                  <AvatarFallback className="bg-ink-tech text-bg-tech text-[10px] font-mono">
                    {profile?.displayName?.charAt(0) || user?.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                  <p className="font-bold text-xs truncate">{profile?.displayName || 'User'}</p>
                  <p className="font-mono text-[9px] uppercase tracking-widest opacity-40 truncate">{profile?.role}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-none h-8 px-2"
                onClick={signOut}
              >
                <LogOut className="w-3 h-3 mr-2" />
                <span className="font-mono text-[9px] uppercase tracking-widest">Terminate Session</span>
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header - Technical Bar */}
        <header className="h-16 bg-white border-b border-line-tech flex items-center justify-between px-8 shrink-0 z-20">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden rounded-none border border-line-tech"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="w-4 h-4" />
            </Button>
            <div className="hidden md:flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest opacity-40">
              <span>System Status:</span>
              <span className="flex items-center gap-1.5 text-green-600">
                <div className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse"></div>
                Operational
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-4 border-r border-line-tech pr-6">
              <div className="text-right">
                <p className="font-mono text-[9px] uppercase tracking-widest opacity-40">Local Time</p>
                <p className="font-mono text-[10px] font-bold">
                  {new Date().toLocaleTimeString('en-KE', { hour12: false })} EAT
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-none hover:bg-bg-tech relative">
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto relative">
          <Outlet />
        </div>
      </main>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-ink-tech/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </div>
  );
}

