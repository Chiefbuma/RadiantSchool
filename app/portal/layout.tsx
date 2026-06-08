import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import {
  Banknote,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LibraryBig,
  LogOut,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";

const adminLinks = [
  { href: "/portal/admin", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
  { href: "/portal/admin/applications", label: "Applications", icon: <ClipboardList size={16} /> },
  { href: "/portal/admin/students", label: "Students", icon: <Users size={16} /> },
  { href: "/portal/admin/onboarding", label: "Onboarding", icon: <CheckCircle2 size={16} /> },
  { href: "/portal/admin/enrollments", label: "Enrollments", icon: <GraduationCap size={16} /> },
  { href: "/portal/admin/programs", label: "Programs", icon: <BookOpen size={16} /> },
  { href: "/portal/admin/modules", label: "Modules", icon: <LibraryBig size={16} /> },
  { href: "/portal/admin/cohorts", label: "Cohorts", icon: <GraduationCap size={16} /> },
  { href: "/portal/admin/classes", label: "Classes", icon: <Users size={16} /> },
  { href: "/portal/admin/resources", label: "Resources", icon: <FileText size={16} /> },
  { href: "/portal/admin/timetable", label: "Timetable", icon: <CalendarDays size={16} /> },
  { href: "/portal/admin/exams", label: "Exams", icon: <ClipboardList size={16} /> },
  { href: "/portal/admin/results", label: "Results", icon: <FileText size={16} /> },
  { href: "/portal/admin/fees", label: "Fees", icon: <Banknote size={16} /> },
  { href: "/portal/admin/requests", label: "Requests", icon: <ClipboardList size={16} /> },
  { href: "/portal/admin/clearance", label: "Clearance", icon: <ShieldCheck size={16} /> },
  { href: "/portal/admin/graduation", label: "Graduation", icon: <GraduationCap size={16} /> },
  { href: "/portal/admin/users", label: "Users", icon: <Settings size={16} /> },
];

const studentLinks = [
  { href: "/portal/student", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
  { href: "/#programs", label: "Website", icon: <BookOpen size={16} /> },
];

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const isStudent = user.roles.includes("student") && !user.permissions.includes("portal.admin");
  const homePath = isStudent ? "/portal/student" : "/portal/admin";

  async function logout() {
    "use server";
    const { destroyCurrentSession, SESSION_COOKIE } = await import("@/lib/auth");
    const { cookies } = await import("next/headers");
    await destroyCurrentSession();
    (await cookies()).set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[#f8f8f0] text-dark">
      <header className="sticky top-0 z-50 border-b border-dark/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 md:px-6">
          <a href={homePath} className="flex items-center gap-3">
            <img src="/logo/rhti-logo.png" alt="RHTI" className="h-12 w-auto object-contain" />
            <span className="hidden border-l border-dark/10 pl-3 text-xs font-black uppercase tracking-widest text-dark/50 md:inline">
              Institution Portal
            </span>
          </a>

          <nav className="hidden items-center gap-2 md:flex">
            {!isStudent && (
              <a href="/portal/admin" className="flex items-center gap-2 px-3 py-2 text-xs font-black uppercase tracking-widest text-dark/70 hover:text-primary">
                <LayoutDashboard size={16} /> Admin
              </a>
            )}
            <a href="/portal/student" className="flex items-center gap-2 px-3 py-2 text-xs font-black uppercase tracking-widest text-dark/70 hover:text-primary">
              <GraduationCap size={16} /> Student
            </a>
            <a href="/#programs" className="flex items-center gap-2 px-3 py-2 text-xs font-black uppercase tracking-widest text-dark/70 hover:text-primary">
              <BookOpen size={16} /> Website
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="m-0 text-sm font-black leading-none text-dark">{user.full_name}</p>
              <p className="m-0 text-[10px] font-bold uppercase tracking-widest text-dark/40">{user.roles.join(", ")}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserRound size={20} />
            </div>
            <form action={logout}>
              <button className="flex h-10 w-10 items-center justify-center bg-dark text-white hover:bg-primary" aria-label="Logout">
                <LogOut size={18} />
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-[1600px] lg:grid-cols-[280px_1fr]">
        <aside className="hidden min-h-[calc(100vh-73px)] border-r border-dark/10 bg-white lg:block">
          <div className="sticky top-[73px] p-4">
            <p className="mb-3 px-3 text-[10px] font-black uppercase tracking-[0.3em] text-dark/40">
              {isStudent ? "Student Menu" : "Admin Menu"}
            </p>
            <nav className="space-y-1">
              {(isStudent ? studentLinks : adminLinks).map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-bold text-dark/70 transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  {item.icon}
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </main>
  );
}
