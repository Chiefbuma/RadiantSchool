'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/FirebaseProvider';
import { BookOpen, ClipboardList, Users, Settings } from 'lucide-react';

const StatCard = ({ title, value, change }: { title: string, value: string, change: string }) => (
  <div className="bg-white p-6 flex flex-col justify-between group hover:bg-ink-tech hover:text-white transition-all duration-300">
    <p className="font-mono text-[9px] uppercase tracking-[0.2em] opacity-40 group-hover:opacity-60">{title}</p>
    <div className="mt-4 flex items-end justify-between">
      <h4 className="text-3xl font-bold tracking-tighter leading-none">{value}</h4>
      <span className="font-mono text-[10px] font-bold text-primary-ocean group-hover:text-white">{change}</span>
    </div>
  </div>
);

const QuickAction = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
  <button className="flex items-center gap-4 p-4 border border-line-tech bg-white hover:border-ink-tech transition-all group text-left">
    <div className="w-10 h-10 border border-line-tech flex items-center justify-center group-hover:bg-ink-tech group-hover:text-white transition-all">
      {icon}
    </div>
    <span className="font-mono text-[10px] uppercase tracking-widest font-bold">{label}</span>
  </button>
);

export default function OverviewPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (profile?.role === 'student') {
        router.replace('/dashboard/portal/home/password');
      } else if (profile?.role === 'admin' || profile?.role === 'registrar' || profile?.role === 'finance' || profile?.role === 'dean') {
        router.replace('/dashboard/admin/system/institutions');
      }
    }
  }, [profile, loading, router]);

  if (loading) {
    return <div className="p-8 font-mono text-xs animate-pulse">Initializing System...</div>;
  }

  return (
    <div className="space-y-0 h-full flex flex-col">
      <div className="p-8 border-b border-line-tech flex items-center justify-between bg-white">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
          <p className="text-gray-500 font-mono text-[10px] uppercase tracking-widest mt-1">
            Authenticated as: {profile?.role} / {profile?.displayName || user?.email}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[9px] uppercase tracking-widest opacity-40">Registry Date</p>
          <p className="font-mono text-[10px] font-bold">{new Date().toLocaleDateString('en-KE', { dateStyle: 'full' })}</p>
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-line-tech border-b border-line-tech">
        {profile?.role === 'student' ? (
          <>
            <StatCard title="ACADEMIC PROGRESS" value="65.2%" change="+5.1%" />
            <StatCard title="ATTENDANCE RATE" value="92.0%" change="0.0%" />
            <StatCard title="PENDING ASSESSMENTS" value="03" change="NEXT: MAY 12" />
            <StatCard title="FINANCIAL BALANCE" value={`KES ${profile?.balance?.toLocaleString() || '0'}`} change="DUE: MAY 15" />
          </>
        ) : profile?.role === 'lecturer' ? (
          <>
            <StatCard title="ACTIVE SESSIONS" value="04" change="TODAY: 02" />
            <StatCard title="TOTAL ENROLLMENT" value="156" change="+12" />
            <StatCard title="GRADING QUEUE" value="42" change="DUE: 72H" />
            <StatCard title="CURRICULUM READY" value="85.0%" change="TARGET: 100%" />
          </>
        ) : (
          <>
            <StatCard title="TOTAL STUDENTS" value="1,284" change="+12.4%" />
            <StatCard title="GROSS REVENUE" value="KES 4.2M" change="+5.2%" />
            <StatCard title="ADMISSION QUEUE" value="452" change="+24.1%" />
            <StatCard title="FACULTY COUNT" value="48" change="0.0%" />
          </>
        )}
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 bg-bg-tech">
        <div className="lg:col-span-2 p-8 border-r border-line-tech bg-white">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold mb-8 opacity-40">SYSTEM ACTIVITY LOG</h3>
          <div className="space-y-8">
            {[1,2,3,4].map(i => (
              <div key={i} className="flex gap-8 relative group">
                {i !== 4 && <div className="absolute left-[7px] top-4 bottom-[-32px] w-px bg-line-tech"></div>}
                <div className="w-4 h-4 rounded-none border border-ink-tech bg-white shrink-0 z-10 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-ink-tech opacity-20 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="pb-4">
                  <div className="flex items-center gap-4 mb-1">
                    <p className="font-bold text-sm tracking-tight">REGISTRY_UPDATE_EVENT_{i}029</p>
                    <span className="font-mono text-[9px] opacity-30">10:45:22 AM</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed max-w-xl font-mono">
                    The semester 2 examination schedule has been synchronized for all clinical medicine departments. 
                    Verification required by faculty dean.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-8 bg-bg-tech">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold mb-8 opacity-40">TERMINAL ACTIONS</h3>
          <div className="grid grid-cols-1 gap-3">
            <QuickAction icon={<BookOpen className="w-4 h-4" />} label="Curriculum Access" />
            <QuickAction icon={<ClipboardList className="w-4 h-4" />} label="Examination Portal" />
            <QuickAction icon={<Users className="w-4 h-4" />} label="Registry Profile" />
            <QuickAction icon={<Settings className="w-4 h-4" />} label="System Configuration" />
          </div>
        </div>
      </div>
    </div>
  );
}
